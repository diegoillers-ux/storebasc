import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("gate", ROOT / "delegated_merge.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class DelegationTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads((ROOT.parent / ".github/delegated-merge/policy.json").read_text(encoding="utf-8"))
        # Synthetic issuer for tests only; the actual policy has no reviewer application configured.
        self.policy["review"]["app_id"] = 424242
        h, b, merge = "a" * 40, "b" * 40, "c" * 40
        task = {"id": "DOC-1", "status": "reviewing", "authorized": True, "depends_on": [],
                "authorization": {"by": "diegoillers-ux", "at": "2026-10-14T12:00:00-05:00",
                                  "reference": "synthetic fixture", "scope": "README wording"},
                "merge_delegation": {"enabled": True, "policy_id": self.policy["id"],
                                     "head_branch": "docs/DOC-1", "allowed_paths": ["README.md"]},
                "acceptance_checks": [{"id": "AC-1", "description": "Link points to the documented route"}]}
        self.snapshot = {
            "repository": self.policy["repository"], "current_base_sha": b, "policy_base_sha": b,
            "snapshot_stable": True, "collection_limits": [],
            "associated_open_prs": [99],
            "pr": {"number": 99, "state": "open", "draft": False, "mergeable": True, "changed_files": 1,
                   "additions": 1, "deletions": 1, "head": {"sha": h, "ref": "docs/DOC-1", "repo": self.policy["repository"]},
                   "base": {"sha": b, "ref": "main"}},
            "files": [{"filename": "README.md", "status": "modified", "additions": 1, "deletions": 1,
                       "patch": "@@ -1 +1 @@\n-old route\n+new route"}],
            "base_queue": {"tasks": [task]}, "unresolved_threads": 0, "latest_reviews": [],
            "protection": {"required_status_checks": {"strict": True, "checks": [
                {"context": check["name"], "app_id": check["app_id"]} for check in self.policy["required_checks"]]},
                "enforce_admins": {"enabled": True}, "required_conversation_resolution": {"enabled": True}},
            "integration_sha": merge, "integration_parents": [b, h],
            "checks": [{"id": index, "name": check["name"], "app_id": check["app_id"], "head_sha": merge,
                        "status": "completed", "conclusion": "success"} for index, check in enumerate(self.policy["required_checks"], 1)],
            "review_check": {"id": 10, "name": "delegated-review", "app_id": 424242, "head_sha": h,
                             "status": "completed", "conclusion": "success", "report": {
                                 "verdict": "APPROVE", "head": h, "base": b, "repository": self.policy["repository"], "pr": 99,
                                 "task_id": "DOC-1", "full_diff_reviewed": True,
                                 "reviewer_session": "independent", "implementer_session": "writer", "round": 1,
                                 "criteria": [{"id": "AC-1", "status": "PASS", "evidence": "synthetic inspected link"}], "findings": []}}
        }

    def decision(self):
        return gate.decide(self.policy, self.snapshot)

    def test_complete_synthetic_evidence_only_predicts_merge(self):
        original = copy.deepcopy(self.snapshot)
        report = self.decision()
        self.assertEqual(report["decision"], "WOULD_MERGE")
        self.assertIs(report["merge_enabled"], False)
        self.assertEqual(self.snapshot, original)

    def test_actual_unconfigured_reviewer_never_passes(self):
        self.policy["review"]["app_id"] = None
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_changing_mode_cannot_activate_merges(self):
        self.policy["mode"] = "active"
        report = self.decision()
        self.assertEqual(report["decision"], "HOLD")
        self.assertFalse(report["merge_enabled"])

    def test_governance_runtime_and_disguised_paths_need_manual_review(self):
        for name in ["AGENTS.md", ".github/workflows/ci.yml", "src/auth.ts", "docs/help/AGENTS.md",
                     "docs/agent-loop/QUEUE.json", "../README.md", "docs\\help\\guide.md"]:
            with self.subTest(path=name):
                self.snapshot["files"][0]["filename"] = name
                self.assertEqual(self.decision()["decision"], "MANUAL")

    def test_task_scope_is_narrower_than_policy(self):
        self.snapshot["files"][0]["filename"] = "docs/help/guide.md"
        self.assertEqual(self.decision()["decision"], "MANUAL")

    def test_rename_deletion_and_line_budget_need_manual_review(self):
        for change in [{"status": "renamed", "previous_filename": "AGENTS.md"}, {"status": "removed"}, {"additions": 300}]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot["files"][0].update(change)
            with self.subTest(change=change):
                self.assertEqual(self.decision()["decision"], "MANUAL")
            self.snapshot = original

    def test_missing_patch_or_incomplete_file_inventory_blocks(self):
        self.snapshot["files"][0]["patch"] = None
        self.assertEqual(self.decision()["decision"], "HOLD")
        self.snapshot["files"][0]["patch"] = "patch"
        self.snapshot["pr"]["changed_files"] = 2
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_task_authorization_and_delegation_must_exist_on_base(self):
        for change in [{"authorized": False}, {"authorization": {}}, {"merge_delegation": {}}, {"status": "proposed"}]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot["base_queue"]["tasks"][0].update(change)
            with self.subTest(change=change):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original

    def test_dependency_must_be_accepted(self):
        task = self.snapshot["base_queue"]["tasks"][0]
        task["depends_on"] = ["DEP"]
        self.snapshot["base_queue"]["tasks"].append({"id": "DEP", "status": "ready_for_review"})
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_missing_or_weakened_branch_protection_blocks(self):
        for change in [None, {"required_status_checks": {"strict": False}}]:
            self.snapshot["protection"] = change
            with self.subTest(change=change):
                self.assertEqual(self.decision()["decision"], "HOLD")

    def test_pending_failed_skipped_and_foreign_checks_block(self):
        for change in [{"conclusion": "skipped"}, {"conclusion": "failure"}, {"status": "queued"},
                       {"app_id": 999}, {"head_sha": "d" * 40}]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot["checks"][0].update(change)
            with self.subTest(change=change):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original

    def test_newest_rerun_failure_overrides_old_success(self):
        check = dict(self.snapshot["checks"][0], id=1000, conclusion="failure")
        self.snapshot["checks"].append(check)
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_stale_base_integration_or_policy_blocks(self):
        for field, value in [("current_base_sha", "d" * 40), ("policy_base_sha", "d" * 40),
                             ("integration_parents", ["a" * 40, "b" * 40]), ("snapshot_stable", False)]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot[field] = value
            with self.subTest(field=field):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original

    def test_missing_review_and_self_review_block(self):
        for change in [{"head": "d" * 40}, {"base": "d" * 40}, {"verdict": "COMMENTED"},
                       {"reviewer_session": "writer"}, {"full_diff_reviewed": False}, {"round": 4}, {"criteria": []}]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot["review_check"]["report"].update(change)
            with self.subTest(change=change):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original

    def test_unknown_issuer_or_author_workflow_cannot_attest_review(self):
        for app in [999, 15368]:
            self.snapshot["review_check"]["app_id"] = app
            with self.subTest(app=app):
                self.assertEqual(self.decision()["decision"], "HOLD")

    def test_review_cannot_be_reused_for_another_pr_or_repository(self):
        for field, value in [("pr", 100), ("repository", "other/repo")]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot["review_check"]["report"][field] = value
            with self.subTest(field=field):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original
        self.snapshot["associated_open_prs"] = [99, 100]
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_additional_required_checks_cannot_be_silently_ignored(self):
        self.snapshot["protection"]["required_status_checks"]["checks"].append({"context": "security", "app_id": 15368})
        self.assertEqual(self.decision()["decision"], "HOLD")

    def test_p2_p3_blockers_and_unknown_findings_block(self):
        for finding in [{"severity": "P2", "blocking": False}, {"severity": "P3", "blocking": True},
                        {"severity": "UNKNOWN", "blocking": False}]:
            self.snapshot["review_check"]["report"]["findings"] = [finding]
            with self.subTest(finding=finding):
                self.assertEqual(self.decision()["decision"], "HOLD")

    def test_unresolved_threads_formal_changes_and_collection_errors_block(self):
        for field, value in [("unresolved_threads", None), ("unresolved_threads", 1),
                             ("latest_reviews", [{"state": "CHANGES_REQUESTED"}]),
                             ("collection_limits", ["network error"])]:
            original = copy.deepcopy(self.snapshot)
            self.snapshot[field] = value
            with self.subTest(field=field):
                self.assertEqual(self.decision()["decision"], "HOLD")
            self.snapshot = original

    def test_rest_adapter_only_uses_get_without_shell(self):
        with patch.object(gate.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, "{}")) as run:
            gate.api("repos/owner/repo/pulls/1")
        self.assertEqual(run.call_args.args[0][:4], ["gh", "api", "--method", "GET"])
        self.assertNotIn("shell", run.call_args.kwargs)

    def test_local_policy_and_runner_must_match_the_claimed_git_revision(self):
        policy = json.loads((ROOT.parent / ".github/delegated-merge/policy.json").read_text(encoding="utf-8"))
        source = Path(gate.__file__).read_text(encoding="utf-8")
        for candidate_source, candidate_policy, expected in [(source, policy, "b" * 40),
                                                            ("modified code", policy, None),
                                                            (source, dict(policy, max_files=100), None)]:
            results = [subprocess.CompletedProcess([], 0, "b" * 40 + "\n"),
                       subprocess.CompletedProcess([], 0, candidate_source),
                       subprocess.CompletedProcess([], 0, json.dumps(candidate_policy))]
            with self.subTest(expected=expected), patch.object(gate.subprocess, "run", side_effect=results):
                self.assertEqual(gate.trusted_revision(policy), expected)

    def test_thread_inventory_paginates_query_only(self):
        def response(resolved, more, cursor):
            return subprocess.CompletedProcess([], 0, json.dumps({"data": {"repository": {"pullRequest": {
                "reviewThreads": {"nodes": [{"isResolved": resolved}], "pageInfo": {"hasNextPage": more, "endCursor": cursor}}}}}}))
        with patch.object(gate.subprocess, "run", side_effect=[response(True, True, "cursor"), response(False, False, None)]) as run:
            self.assertEqual(gate.unresolved_threads("owner/repo", 1), 1)
        for call in run.call_args_list:
            command = call.args[0]
            self.assertIn("query=query(", " ".join(command))
            self.assertNotIn("mutation", " ".join(command))

    def test_cli_reports_shadow_without_mutating_snapshot(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            policy, snapshot = root / "policy.json", root / "snapshot.json"
            policy.write_text(json.dumps(self.policy), encoding="utf-8")
            original = json.dumps(self.snapshot)
            snapshot.write_text(original, encoding="utf-8")
            result = subprocess.run([sys.executable, "-B", str(ROOT / "delegated_merge.py"),
                                     "--policy", str(policy), "--snapshot", str(snapshot)],
                                    capture_output=True, text=True, encoding="utf-8", timeout=20)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)["decision"], "WOULD_MERGE")
            self.assertFalse(json.loads(result.stdout)["merge_enabled"])
            self.assertEqual(snapshot.read_text(encoding="utf-8"), original)
