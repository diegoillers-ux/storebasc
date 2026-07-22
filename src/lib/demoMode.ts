export function isDemoMode() {
  if (process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return true
  }
  // Fallback automatico a modo demo si no estan configuradas las credenciales de Firebase en el servidor
  if (typeof window === 'undefined' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return true
  }
  return false
}
