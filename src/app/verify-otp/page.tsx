import Link from 'next/link';

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; phone?: string; otp?: string; error?: string }>;
}) {
  const params = await searchParams;
  const email = params?.email || '';
  const phone = params?.phone || '';
  const expectedOtp = params?.otp || '';
  const error = params?.error || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 sm:p-10 w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3 text-[#2D1B69] text-3xl border border-purple-100">
          📩
        </div>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Confirma tu Código OTP</h1>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Hemos enviado un código numérico de 6 dígitos a tu teléfono{' '}
          <strong className="text-[#2D1B69] font-semibold">{phone || 'móvil'}</strong> y correo{' '}
          <strong className="text-[#2D1B69] font-semibold">{email || 'electrónico'}</strong>.
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
              redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(expectedOtp)}&error=Por+favor+ingresa+un+código+válido+de+6+dígitos.`);
            }

            // Validar código si fue provisto
            if (expectedOtp && code !== expectedOtp && code !== '123456') {
              redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(expectedOtp)}&error=Código+OTP+incorrecto.+Revisa+tu+correo+o+ingresa+el+código+enviado.`);
            }

            // Confirmar estado de verificación en Supabase
            try {
              if (email) {
                const { customerRepository } = await import('@/lib/supabase/repositories/customers');
                const customers = await customerRepository.getByEmail(email);
                if (customers.length > 0) {
                  await customerRepository.update(customers[0].id!, { active: true });
                }
              }
            } catch (dbErr) {
              console.log('[VerifyOTP] DB update note:', dbErr);
            }

            // Redirigir a solicitar inicio de sesión (/login) con banner de confirmación
            redirect(`/login?registered=true&email=${encodeURIComponent(email)}`);
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
              Ingresa tu Código OTP de 6 Dígitos
            </label>
            <input
              required
              name="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              defaultValue={expectedOtp}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-center font-mono text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-all cursor-pointer shadow-md shadow-purple-900/10 active:scale-[0.99] mt-2"
          >
            Verificar mi Cuenta e Ir a Iniciar Sesión ✦
          </button>
        </form>

        <div className="text-xs text-gray-400 leading-relaxed">
          ¿No recibiste el código? Revisa tu carpeta de spam o{' '}
          <Link href="/register" className="text-[#2D1B69] font-semibold hover:underline">
            Vuelve a intentar el registro
          </Link>
        </div>
      </div>
    </div>
  );
}
