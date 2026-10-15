import Link from 'next/link';

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; phone?: string; error?: string; resent?: string }>;
}) {
  const params = await searchParams;
  const email = params?.email || '';
  const phone = params?.phone || '';
  const error = params?.error || '';
  const resent = params?.resent || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 sm:p-10 w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3 text-[#2D1B69] text-3xl border border-purple-100">
          📩
        </div>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Confirma tu Código OTP</h1>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Ingresa el código numérico de 6 dígitos enviado a tu correo{' '}
          <strong className="text-[#2D1B69] font-semibold">{email || 'registrado'}</strong>
          {phone ? (
            <>
              {' '}y teléfono <strong className="text-[#2D1B69] font-semibold">{phone}</strong>
            </>
          ) : null}.
        </p>

        {resent && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-left leading-relaxed">
            ✅ ¡Nuevo código OTP generado y enviado a tu correo!
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server';
            const { redirect } = await import('next/navigation');
            const code = String(formData.get('code') || '').trim();

            if (!code || code.length !== 6) {
              redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&error=Por+favor+ingresa+el+código+numérico+de+6+dígitos.`);
            }

            try {
              const { customerRepository } = await import('@/lib/supabase/repositories/customers');
              
              if (email) {
                const verified = await customerRepository.verifyOtp(email, code);
                if (!verified) {
                  redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&error=Código+OTP+incorrecto,+expirado+o+demasiados+intentos.+Verifica+e+inténtalo+de+nuevo.`);
                }
              }
            } catch (dbErr: unknown) {
              const redirectErr = dbErr as { digest?: unknown; name?: unknown; message?: unknown } | null | undefined;
              const digest = typeof redirectErr?.digest === 'string' ? redirectErr.digest : undefined;
              if (digest?.startsWith('NEXT_REDIRECT') || redirectErr?.name === 'RedirectError' || redirectErr?.message === 'NEXT_REDIRECT') {
                throw dbErr;
              }
              console.log('[VerifyOTP] Note:', dbErr);
            }

            // Redirigir obligatoriamente al inicio de sesión (/login) con banner de confirmación
            redirect(`/login?registered=true&email=${encodeURIComponent(email)}`);
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">
              Escribe tu Código OTP de 6 Dígitos
            </label>
            <input
              required
              name="code"
              type="text"
              maxLength={6}
              placeholder="000000"
              defaultValue=""
              autoComplete="off"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-center font-mono text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-all cursor-pointer shadow-md shadow-purple-900/10 active:scale-[0.99] mt-2"
          >
            Verificar mi Cuenta e Ir a Iniciar Sesión ✦
          </button>
        </form>

        {/* Reenviar código OTP */}
        <form
          action={async () => {
            'use server';
            const { redirect } = await import('next/navigation');
            const { headers } = await import('next/headers');
            const { randomInt } = await import('crypto');
            const { isRateLimited, getRequestIp } = await import('@/lib/rateLimit');
            if (email) {
              const headerList = await headers();
              const ip = getRequestIp(headerList.get('x-forwarded-for'));
              if (isRateLimited(`otp-resend:${ip}`, 10, 60_000) || isRateLimited(`otp-resend-email:${email.toLowerCase()}`, 3, 10 * 60_000)) {
                redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&error=Demasiados+intentos.+Espera+unos+minutos+antes+de+reenviar+el+código.`);
              }
              try {
                const newCode = String(randomInt(100000, 1000000));
                const { customerRepository } = await import('@/lib/supabase/repositories/customers');
                await customerRepository.setOtp(email, newCode);

                const customers = await customerRepository.getByEmail(email);
                const name = customers.length > 0 ? customers[0].name : 'Usuario';

                const { sendVerificationEmail } = await import('@/lib/mailer');
                await sendVerificationEmail(email, name, newCode);
              } catch (e) {
                console.log('[ResendOTP] error:', e);
              }
            }
            redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&resent=true`);
          }}
          className="mb-4"
        >
          <button
            type="submit"
            className="text-xs text-[#2D1B69] font-medium hover:underline cursor-pointer bg-transparent border-0"
          >
            ¿No recibiste el correo? Clic aquí para reenviar código OTP
          </button>
        </form>

        <div className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
          ¿Corregir datos de registro?{' '}
          <Link href="/register" className="text-[#2D1B69] font-semibold hover:underline">
            Volver al formulario
          </Link>
        </div>
      </div>
    </div>
  );
}
