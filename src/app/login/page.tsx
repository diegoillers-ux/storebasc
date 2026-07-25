import { signIn } from '@/lib/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  let errorMessage = ''
  if (error === 'AccessDenied') {
    errorMessage = 'Acceso Denegado: Tu correo de Google no está autorizado como administrador.'
  } else if (error === 'OAuthSignin' || error === 'OAuthCallback') {
    errorMessage = 'Error de conexión con Google OAuth 2.0 (invalid_client o callback no registrado en Google Cloud).'
  } else if (error) {
    errorMessage = 'Ocurrió un error al intentar iniciar sesión.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-sm text-center">
        <p className="text-3xl mb-2">✦</p>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-sm text-gray-400 mb-6">Panel de administración</p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          {/* Opción 1: Acceso Directo Admin (Preproducción / Demo) */}
          <form
            action={async () => {
              'use server'
              await signIn('demo', { redirectTo: '/admin' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#1E1145] transition-colors cursor-pointer shadow-sm"
            >
              ⚡ Ingreso Directo Admin (Preproducción)
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">o con tu cuenta</span>
            </div>
          </div>

          {/* Opción 2: Google OAuth 2.0 */}
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/admin' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Continuar con Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
