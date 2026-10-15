#!/usr/bin/env python3
"""Read-only shadow decisions. No API writes, approvals, merges or model calls."""
import argparse
import base64
from datetime import datetime, timezone
from fnmatch import fnmatchcase
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SHA = re.compile(r"[0-9a-f]{40}")


def matches(path, patterns):
    return any(fnmatchcase(path, pattern) for pattern in patterns)


def decide(policy, snapshot):
    manual, hold = [], []
    pr = snapshot.get("pr", {})
    head, base = pr.get("head", {}), pr.get("base", {})
    head_sha, base_sha = head.get("sha"), base.get("sha")
    if policy.get("schema_version") != 1 or policy.get("mode") != "shadow":
        hold.append("Only the reviewed shadow policy is supported.")
    if snapshot.get("repository") != policy.get("repository"):
        manual.append("Repository differs from policy.")
    if pr.get("state") != "open" or pr.get("draft") is not False:
        manual.append("PR must be open and ready for review.")
    if base.get("ref") != policy.get("base_branch") or head.get("repo") != policy.get("repository"):
        manual.append("Unexpected base branch or fork.")
    if not (isinstance(head_sha, str) and SHA.fullmatch(head_sha)
            and isinstance(base_sha, str) and SHA.fullmatch(base_sha)):
        hold.append("Missing exact head/base SHA.")
    if snapshot.get("current_base_sha") != base_sha:
        hold.append("Base branch changed; refresh evidence.")
    if snapshot.get("policy_base_sha") != base_sha:
        hold.append("Policy/runner were not loaded from the current trusted base.")
    if snapshot.get("collection_limits"):
        hold.append("Collector reports incomplete evidence.")
    if snapshot.get("snapshot_stable") is not True:
        hold.append("PR head/base were not rechecked after evidence collection.")
    if snapshot.get("associated_open_prs") != [pr.get("number")]:
        hold.append("Open PR identity for this HEAD is incomplete or ambiguous.")
    if pr.get("mergeable") is not True:
        hold.append("Mergeability is false or unknown.")
    files = snapshot.get("files", [])
    if not isinstance(files, list) or not files or len(files) != pr.get("changed_files"):
        hold.append("Changed-file inventory is incomplete.")
        files = files if isinstance(files, list) else []
    if len(files) > policy["max_files"]:
        manual.append("File budget exceeded.")
    total = 0
    for file in files:
        name = file.get("filename", "")
        path = PurePosixPath(name)
        if (not name or path.is_absolute() or ".." in path.parts or "\\" in name
                or matches(name, policy["denied_paths"])
                or not matches(name, policy["allowed_paths"])
                or path.suffix.lower() not in policy["allowed_extensions"]):
            manual.append("Path needs owner review: " + name)
        if file.get("status") not in {"added", "modified"} or file.get("previous_filename"):
            manual.append("Rename, deletion or unusual file status needs owner review.")
        if not isinstance(file.get("patch"), str) or not file["patch"].strip():
            hold.append("Missing text diff: " + name)
        counts = [file.get("additions"), file.get("deletions")]
        if any(type(value) is not int or value < 0 for value in counts):
            hold.append("Invalid line counts.")
        else:
            total += sum(counts)
    if total > policy["max_changed_lines"]:
        manual.append("Changed-line budget exceeded.")
    if total != pr.get("additions", -1) + pr.get("deletions", -1):
        hold.append("Line totals differ from PR metadata.")

    # Task permission comes from the trusted base queue, never from this PR's edits/body/labels.
    tasks = snapshot.get("base_queue", {}).get("tasks", [])
    ids = [task.get("id") for task in tasks]
    if any(not isinstance(ident, str) or not ident for ident in ids) or len(ids) != len(set(ids)):
        hold.append("Trusted queue has invalid or duplicate task IDs.")
    candidates = [task for task in tasks if task.get("merge_delegation", {}).get("head_branch") == head.get("ref")]
    task = candidates[0] if len(candidates) == 1 else {}
    delegation = task.get("merge_delegation", {})
    if (task.get("authorized") is not True or delegation.get("enabled") is not True
            or delegation.get("policy_id") != policy.get("id")):
        hold.append("No unique authorized task delegated on the trusted base.")
    scoped_paths = delegation.get("allowed_paths", [])
    if not isinstance(scoped_paths, list) or not scoped_paths or any(not isinstance(path, str) for path in scoped_paths):
        hold.append("Task lacks an explicit delegated file scope.")
    elif any(not matches(file.get("filename", ""), scoped_paths) for file in files):
        manual.append("Changed files exceed the task's delegated scope.")
    if task.get("status") not in {"ready", "running", "reviewing", "ready_for_review"}:
        hold.append("Task state is not eligible.")
    auth = task.get("authorization", {})
    if auth.get("by") != "diegoillers-ux" or any(not isinstance(auth.get(key), str) or not auth[key].strip()
                                               for key in ("at", "reference", "scope")):
        hold.append("Missing owner authorization provenance.")
    else:
        try:
            timestamp = datetime.fromisoformat(auth["at"])
            if timestamp.tzinfo is None or "T" not in auth["at"]:
                raise ValueError("Missing timezone.")
        except ValueError:
            hold.append("Invalid authorization timestamp.")
    by_id = {item.get("id"): item for item in tasks}
    if any(by_id.get(dep, {}).get("status") != "accepted" for dep in task.get("depends_on", [])):
        hold.append("Task dependencies have not been accepted.")

    protection = snapshot.get("protection")
    expected = {(check["name"], check["app_id"]) for check in policy["required_checks"]}
    if not isinstance(protection, dict):
        hold.append("Branch-protection evidence unavailable.")
    else:
        required = protection.get("required_status_checks", {})
        configured = {(check.get("context"), check.get("app_id")) for check in required.get("checks", [])}
        if expected != configured or required.get("strict") is not True:
            hold.append("Required check sources or strict branch protection differ from policy.")
        if protection.get("enforce_admins", {}).get("enabled") is not True:
            hold.append("Branch rules must apply to administrators.")
        if protection.get("required_conversation_resolution", {}).get("enabled") is not True:
            hold.append("Conversation resolution is not enforced.")
    if snapshot.get("unresolved_threads") != 0:
        hold.append("Review threads are unresolved or their inventory is unavailable.")
    if any(review.get("state") == "CHANGES_REQUESTED" for review in snapshot.get("latest_reviews", [])):
        hold.append("An outstanding formal review requests changes.")

    # Validate checks on the exact test merge, including both parents, rather than a previous push.
    merge_sha = snapshot.get("integration_sha")
    if not isinstance(merge_sha, str) or not SHA.fullmatch(merge_sha) or snapshot.get("integration_parents") != [base_sha, head_sha]:
        hold.append("Current integration commit is not proven against head and base.")
    checks = snapshot.get("checks", [])
    for name, app in sorted(expected):
        matching = [check for check in checks if check.get("name") == name and check.get("app_id") == app]
        if not matching:
            hold.append("Missing configured check: " + name)
            continue
        latest = max(matching, key=lambda check: check.get("id", 0))
        if latest.get("head_sha") != merge_sha or latest.get("status") != "completed" or latest.get("conclusion") != "success":
            hold.append("Configured check is not successful on current integration: " + name)

    issuer = policy.get("review", {}).get("app_id")
    review_check = snapshot.get("review_check", {})
    if type(issuer) is not int or issuer in {item["app_id"] for item in policy["required_checks"]}:
        hold.append("Independent reviewer application is not configured.")
    if (review_check.get("app_id") != issuer or review_check.get("name") != policy["review"]["check_name"]
            or review_check.get("head_sha") != head_sha or review_check.get("status") != "completed"
            or review_check.get("conclusion") != "success"):
        hold.append("Missing successful attestation from the trusted reviewer on this HEAD.")
    report = review_check.get("report", {})
    if (report.get("verdict") != "APPROVE" or report.get("head") != head_sha or report.get("base") != base_sha
            or report.get("repository") != policy["repository"] or report.get("pr") != pr.get("number")
            or report.get("task_id") != task.get("id") or report.get("full_diff_reviewed") is not True
            or not report.get("reviewer_session") or not report.get("implementer_session")
            or report.get("reviewer_session") == report.get("implementer_session")):
        hold.append("Independent review packet is incomplete or stale.")
    round_number = report.get("round")
    if type(round_number) is not int or not 1 <= round_number <= policy["review"]["max_rounds"]:
        hold.append("Review round is missing or outside the limit.")
    criteria = task.get("acceptance_checks", [])
    results = report.get("criteria", [])
    if (not criteria or len({item.get("id") for item in criteria}) != len(criteria)
            or {item.get("id") for item in criteria} != {item.get("id") for item in results}
            or len(results) != len(criteria)
            or any(item.get("status") != "PASS" or not item.get("evidence") for item in results)):
        hold.append("Acceptance criteria do not have complete passing evidence.")
    findings = report.get("findings")
    if not isinstance(findings, list) or any(item.get("severity") not in {"P3"}
            or item.get("blocking") is not False for item in findings):
        hold.append("Blocking findings exist or findings inventory is incomplete.")
    decision = "MANUAL" if manual else "HOLD" if hold else "WOULD_MERGE"
    return {"schema_version": 1, "mode": "shadow", "merge_enabled": False, "decision": decision,
            "policy_id": policy.get("id"), "repository": snapshot.get("repository"), "pr": pr.get("number"),
            "head": head_sha, "base": base_sha, "manual_reasons": sorted(set(manual)),
            "missing_evidence": sorted(set(hold)), "observed_at": snapshot.get("observed_at")}


def api(path):
    result = subprocess.run(["gh", "api", "--method", "GET", path], check=True, capture_output=True,
                            text=True, encoding="utf-8")
    return json.loads(result.stdout)


def pages(path, key=None):
    output = []
    for page in range(1, 31):
        data = api(path + ("&" if "?" in path else "?") + "per_page=100&page=" + str(page))
        batch = data[key] if key else data
        output.extend(batch)
        if len(batch) < 100:
            return output
    raise ValueError("Pagination limit reached; evidence would be incomplete.")


def normalize_check(check):
    return {key: check.get(key) for key in ("id", "name", "head_sha", "status", "conclusion")} | {"app_id": check.get("app", {}).get("id")}


def unresolved_threads(repo, number):
    owner, name = repo.split("/")
    query = """query($owner:String!, $name:String!, $number:Int!, $cursor:String) {
      repository(owner:$owner,name:$name) { pullRequest(number:$number) {
        reviewThreads(first:100,after:$cursor) {
          nodes { isResolved } pageInfo { hasNextPage endCursor }
        }
      }}
    }"""
    cursor, unresolved = None, 0
    for _ in range(100):
        command = ["gh", "api", "graphql", "-f", "query=" + query, "-f", "owner=" + owner,
                   "-f", "name=" + name, "-F", "number=" + str(number)]
        if cursor:
            command.extend(["-f", "cursor=" + cursor])
        result = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8")
        payload = json.loads(result.stdout)
        if payload.get("errors"):
            raise ValueError("Thread inventory unavailable.")
        threads = payload["data"]["repository"]["pullRequest"]["reviewThreads"]
        unresolved += sum(node["isResolved"] is False for node in threads["nodes"])
        page = threads["pageInfo"]
        if not page["hasNextPage"]:
            return unresolved
        if not page["endCursor"] or page["endCursor"] == cursor:
            raise ValueError("Invalid thread pagination.")
        cursor = page["endCursor"]
    raise ValueError("Thread pagination limit reached.")


def trusted_revision(policy):
    """A local HEAD name alone does not prove that working files came from that commit."""
    try:
        def git(*args):
            return subprocess.run(["git", "-C", str(ROOT), *args], check=True, capture_output=True,
                                  text=True, encoding="utf-8").stdout
        revision = git("rev-parse", "HEAD").strip()
        source = git("show", "HEAD:ops/delegated_merge.py")
        committed_policy = json.loads(git("show", "HEAD:.github/delegated-merge/policy.json"))
        if source != Path(__file__).read_text(encoding="utf-8") or committed_policy != policy:
            return None
        return revision
    except (OSError, ValueError, subprocess.CalledProcessError):
        return None


def collect(policy, number):
    repo = policy["repository"]
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo) or type(number) is not int or number <= 0:
        raise ValueError("Invalid repository or PR number.")
    prefix = "repos/" + repo
    pr = api(prefix + "/pulls/" + str(number))
    head, base = pr["head"], pr["base"]
    snapshot = {"repository": repo, "observed_at": datetime.now(timezone.utc).isoformat(),
                "pr": {key: pr.get(key) for key in ("number", "state", "draft", "mergeable", "changed_files", "additions", "deletions")},
                "files": pages(prefix + "/pulls/" + str(number) + "/files"), "checks": [], "latest_reviews": [],
                "unresolved_threads": None, "base_queue": {"tasks": []}}
    snapshot["pr"]["head"] = {"sha": head["sha"], "ref": head["ref"], "repo": (head.get("repo") or {}).get("full_name")}
    snapshot["pr"]["base"] = {"sha": base["sha"], "ref": base["ref"]}
    snapshot["current_base_sha"] = api(prefix + "/branches/" + policy["base_branch"])["commit"]["sha"]
    snapshot["policy_base_sha"] = trusted_revision(policy)
    errors = []
    try:
        linked = pages(prefix + "/commits/" + head["sha"] + "/pulls")
        snapshot["associated_open_prs"] = sorted(item["number"] for item in linked
                                                 if item["state"] == "open" and item["head"]["sha"] == head["sha"])
    except (subprocess.CalledProcessError, KeyError):
        errors.append("PR identity inventory unavailable.")
    try:
        snapshot["protection"] = api(prefix + "/branches/" + policy["base_branch"] + "/protection")
    except subprocess.CalledProcessError:
        errors.append("Branch-protection API access unavailable.")
    try:
        queue = api(prefix + "/contents/" + policy["queue_path"] + "?ref=" + base["sha"])
        snapshot["base_queue"] = json.loads(base64.b64decode(queue["content"]).decode("utf-8"))
    except (subprocess.CalledProcessError, KeyError, ValueError, UnicodeError):
        errors.append("Trusted base queue unavailable.")
    merge_sha = pr.get("merge_commit_sha")
    if isinstance(merge_sha, str) and SHA.fullmatch(merge_sha):
        try:
            commit = api(prefix + "/git/commits/" + merge_sha)
            snapshot["integration_sha"] = merge_sha
            snapshot["integration_parents"] = [parent["sha"] for parent in commit["parents"]]
            snapshot["checks"] = [normalize_check(check) for check in pages(prefix + "/commits/" + merge_sha + "/check-runs", "check_runs")]
        except (subprocess.CalledProcessError, KeyError):
            errors.append("Integration checks unavailable.")
    try:
        reviewer = policy["review"]
        checks = pages(prefix + "/commits/" + head["sha"] + "/check-runs", "check_runs")
        matching = [check for check in checks if check["name"] == reviewer["check_name"] and check.get("app", {}).get("id") == reviewer["app_id"]]
        if matching:
            check = max(matching, key=lambda item: item["id"])
            snapshot["review_check"] = normalize_check(check) | {"report": json.loads(check["output"]["summary"])}
        reviews = pages(prefix + "/pulls/" + str(number) + "/reviews")
        latest = {}
        for review in reviews:
            if review["state"] in {"APPROVED", "CHANGES_REQUESTED", "DISMISSED"}:
                latest[review["user"]["login"]] = review
        snapshot["latest_reviews"] = [{"state": review["state"], "user": review["user"]["login"]} for review in latest.values()]
    except (subprocess.CalledProcessError, KeyError, ValueError):
        errors.append("Reviewer evidence unavailable.")
    try:
        snapshot["unresolved_threads"] = unresolved_threads(repo, number)
    except (subprocess.CalledProcessError, KeyError, TypeError, ValueError):
        errors.append("Complete review-thread resolution inventory unavailable.")
    final_pr = api(prefix + "/pulls/" + str(number))
    final_base = api(prefix + "/branches/" + policy["base_branch"])["commit"]["sha"]
    snapshot["snapshot_stable"] = (final_pr["head"]["sha"] == head["sha"]
                                   and final_pr["base"]["sha"] == base["sha"]
                                   and all(final_pr.get(key) == pr.get(key) for key in ("state", "draft", "mergeable"))
                                   and final_base == snapshot["current_base_sha"])
    snapshot["collection_limits"] = errors
    return snapshot


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--policy", type=Path, default=ROOT / ".github/delegated-merge/policy.json")
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--pr", type=int)
    inputs.add_argument("--snapshot", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    policy = json.loads(args.policy.read_text(encoding="utf-8"))
    snapshot = collect(policy, args.pr) if args.pr else json.loads(args.snapshot.read_text(encoding="utf-8"))
    report = decide(policy, snapshot)
    report["collection_limits"] = snapshot.get("collection_limits", [])
    rendered = json.dumps(report, indent=2, ensure_ascii=False)
    print(rendered)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    # Shadow findings are reports, not a required merge approval. Parsing/collection errors still fail.
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as exc:
        print("Shadow evaluation failed:", type(exc).__name__, file=sys.stderr)
        sys.exit(2)
