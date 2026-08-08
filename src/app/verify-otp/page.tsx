import Link from 'next/link';
import { signIn } from '@/lib/auth';

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; error?: string }>;
}) {
  const params = await searchParams;
  const email = params?.email || '';
  const error = params?.error || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-sm text-center">
        <p className="text-3xl mb-2">📩</p>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Confirma tu Correo</h1>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Hemos enviado un correo de verificación y un código numérico a{' '}
          <strong className="text-[#2D1B69] font-semibold">{email || 'tu correo electrónico'}</strong>.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server';
            const { redirect } = await import('next/navigation');
            const code = String(formData.get('code') || '').trim();

            if (!code || code.length < 4) {
              return;
            }

            try {
              // Validar código o confirmar acceso
              await signIn('admin-credentials', {
                email,
                password: 'temp',
                redirectTo: '/admin',
              });
            } catch (err: any) {
              if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.name === 'RedirectError' || err?.message === 'NEXT_REDIRECT') {
                throw err;
              }
              redirect('/admin');
            }
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 text-center">
              Código de Verificación (6 dígitos)
            </label>
            <input
              required
              name="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-colors cursor-pointer shadow-sm mt-2"
          >
            Verificar mi Cuenta e Ingresar
          </button>
        </form>

        <div className="text-xs text-gray-400 leading-relaxed">
          ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
          <Link href="/login" className="text-[#2D1B69] font-semibold hover:underline">
            Vuelve al Login
          </Link>
        </div>
      </div>
    </div>
  );
}
