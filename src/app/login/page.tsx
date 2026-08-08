import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  let errorMessage = ''
  if (error === 'CredentialsSignin') {
    errorMessage = 'Credenciales incorrectas. Verifica tu correo o contraseña de administrador.'
  } else if (error === 'AccessDenied') {
    errorMessage = 'Acceso Denegado: Tu correo no está autorizado como administrador.'
  } else if (error) {
    errorMessage = 'Ocurrió un error al intentar iniciar sesión.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-sm text-center">
        <p className="text-3xl mb-2">✦</p>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-sm text-gray-400 mb-6">Panel de Administración</p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server'
            const email = formData.get('email')
            const password = formData.get('password')
            try {
              await signIn('admin-credentials', {
                email,
                password,
                redirectTo: '/admin',
              })
            } catch (err: any) {
              if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.name === 'RedirectError' || err?.message === 'NEXT_REDIRECT') {
                throw err
              }
              const { redirect } = await import('next/navigation')
              redirect('/login?error=CredentialsSignin')
            }
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              required
              name="email"
              type="email"
              placeholder="diegoillers@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700">Contraseña</label>
              <Link href="/forgot-password" className="text-[11px] text-[#2D1B69] hover:underline">
                ¿Olvidaste tu clave?
              </Link>
            </div>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-colors cursor-pointer shadow-sm mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mb-4 text-xs text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#2D1B69] font-semibold hover:underline">
            Registrarme como Admin
          </Link>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">o modo rápido</span>
          </div>
        </div>

        {/* Acceso Directo Admin (Preproducción / Demo) */}
        <form
          action={async () => {
            'use server'
            await signIn('demo', { redirectTo: '/admin' })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-50 text-[#2D1B69] border border-purple-200 px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
          >
            ⚡ Ingreso Directo Admin (Preproducción)
          </button>
        </form>
      </div>
    </div>
  )
}


