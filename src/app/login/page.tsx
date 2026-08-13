import { signIn } from '@/lib/auth';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; registered?: string; reset?: string; email?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const registered = params?.registered;
  const reset = params?.reset;
  const defaultEmail = params?.email || '';

  let errorMessage = '';
  if (error === 'CredentialsSignin') {
    errorMessage = 'Credenciales incorrectas. Verifica tu correo/cédula o contraseña.';
  } else if (error === 'TooManyAttempts') {
    errorMessage = 'Demasiados intentos fallidos. Espera unos minutos y vuelve a intentar.';
  } else if (error === 'AccessDenied') {
    errorMessage = 'Acceso denegado. Tu usuario no tiene permisos suficientes.';
  } else if (error) {
    errorMessage = 'Ocurrió un error al intentar iniciar sesión. Revisa tus datos.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 sm:p-10 w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3 text-[#2D1B69] text-2xl border border-purple-100">
          ✦
        </div>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-xs text-gray-500 mb-6">Inicio de Sesión en la Plataforma</p>

        {registered && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-left leading-relaxed shadow-xs">
            🎉 <strong>¡Registro y verificación completados!</strong>
            <br />
            Por favor ingresa tus datos (Correo o Cédula) y tu contraseña para iniciar sesión.
          </div>
        )}

        {reset && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-left leading-relaxed shadow-xs">
            🔑 <strong>¡Contraseña actualizada!</strong>
            <br />
            Ingresa tu correo y la nueva contraseña para iniciar sesión.
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server';
            const email = String(formData.get('email') || '').trim();
            const password = String(formData.get('password') || '').trim();
            try {
              const { headers } = await import('next/headers');
              const { isRateLimited, getRequestIp } = await import('@/lib/rateLimit');
              const headerList = await headers();
              const ip = getRequestIp(headerList.get('x-forwarded-for'));
              if (
                isRateLimited(`login-ip:${ip}`, 20, 60_000) ||
                isRateLimited(`login-email:${email.toLowerCase()}`, 10, 15 * 60_000)
              ) {
                const { redirect } = await import('next/navigation');
                redirect('/login?error=TooManyAttempts');
              }
              await signIn('admin-credentials', {
                email,
                password,
                redirectTo: '/admin',
              });
            } catch (err: any) {
              if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.name === 'RedirectError' || err?.message === 'NEXT_REDIRECT') {
                throw err;
              }
              const { redirect } = await import('next/navigation');
              redirect('/login?error=CredentialsSignin');
            }
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico o Cédula</label>
            <input
              required
              name="email"
              type="text"
              defaultValue={defaultEmail}
              placeholder="correo@ejemplo.com o número de cédula"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">Contraseña</label>
              <Link href="/forgot-password" className="text-[11px] text-[#2D1B69] hover:underline font-medium">
                ¿Olvidaste tu clave?
              </Link>
            </div>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-all cursor-pointer shadow-md shadow-purple-900/10 active:scale-[0.99] mt-2"
          >
            Iniciar Sesión ✦
          </button>
        </form>

        <div className="text-xs text-gray-400">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="text-[#2D1B69] font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
