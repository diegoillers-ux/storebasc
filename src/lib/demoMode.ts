export function isDemoMode() {
    return process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
}
