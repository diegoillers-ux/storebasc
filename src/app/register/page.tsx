import Link from 'next/link';
import { randomInt } from 'crypto';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 sm:p-10 w-full max-w-md text-center my-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3 text-[#2D1B69] text-2xl border border-purple-100">
          ✦
        </div>
        <h1 className="text-2xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-xs text-gray-500 mb-6">Registro de Usuario y Creación de Perfil</p>

        {success && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-left leading-relaxed">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server';
            const { redirect } = await import('next/navigation');
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim().toLowerCase();
            const cedula = String(formData.get('cedula') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const password = String(formData.get('password') || '').trim();

            if (!name || !email || !cedula || !phone || !password) {
              redirect('/register?error=Por+favor+diligencia+todos+los+campos+obligatorios.');
            }

            if (password.length < 6) {
              redirect('/register?error=La+contraseña+debe+tener+mínimo+6+caracteres.');
            }

            try {
              // Rate limit: 5 registros por IP cada 15 minutos
              const { headers } = await import('next/headers');
              const { isRateLimited, getRequestIp } = await import('@/lib/rateLimit');
              const headerList = await headers();
              const ip = getRequestIp(headerList.get('x-forwarded-for'));
              if (isRateLimited(`register-ip:${ip}`, 5, 15 * 60_000) || isRateLimited(`register-email:${email}`, 3, 15 * 60_000)) {
                redirect('/register?error=Demasiados+intentos.+Espera+unos+minutos+y+vuelve+a+intentar.');
              }

              // 1. Registro nativo en Supabase Auth
              try {
                const { getAdminSupabase } = await import('@/lib/supabase/server');
                const supabase = getAdminSupabase();
                await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: { name, cedula, phone },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://storebasc.vercel.app'}/login?registered=true`,
                  },
                });
              } catch (supaErr) {
                console.log('[Register] Supabase Auth note:', supaErr);
              }

              // 2. Generar Código OTP seguro de 6 dígitos (criptográfico)
              const verificationCode = String(randomInt(100000, 1000000));

              // 3. Guardar o actualizar registro en la tabla customers de Supabase PostgreSQL con OTP seguro
              try {
                const { customerRepository } = await import('@/lib/supabase/repositories/customers');
                const existing = await customerRepository.getByEmail(email);
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

                if (existing.length === 0) {
                  await customerRepository.create({
                    name,
                    email,
                    cedula,
                    phone,
                    otpCode: verificationCode,
                    otpExpiresAt: expiresAt,
                    isVerified: false,
                    active: false, // Bloqueado hasta verificar el OTP
                  });
                } else {
                  await customerRepository.update(existing[0].id!, {
                    name,
                    cedula,
                    phone,
                    otpCode: verificationCode,
                    otpExpiresAt: expiresAt,
                    isVerified: false,
                  });
                }
              } catch (custRepoErr) {
                console.log('[Register] Customer DB note:', custRepoErr);
              }

              // 4. Si el correo coincide con un Administrador autorizado, guardar en admin_users
              const adminEmails = (process.env.ADMIN_EMAILS || '')
                .split(',')
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean);

              if (adminEmails.includes(email)) {
                try {
                  const { adminUserRepository } = await import('@/lib/supabase/repositories/admin-users');
                  const existingAdmin = await adminUserRepository.getByEmail(email);
                  if (!existingAdmin) {
                    await adminUserRepository.create({
                      email,
                      name,
                      role: 'SUPER_ADMIN',
                      active: true,
                    });
                  }
                } catch (adminErr) {
                  console.log('[Register] Admin DB note:', adminErr);
                }
              }

              // 5. Enviar correo transaccional real con el código OTP al correo del usuario
              try {
                const { sendVerificationEmail } = await import('@/lib/mailer');
                await sendVerificationEmail(email, name, verificationCode);
              } catch (mailErr) {
                console.log('[Register] Email delivery note:', mailErr);
              }

              // 6. Redirigir a la pantalla de verificación (SIN exponer el código OTP en la URL)
              redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
            } catch (err: any) {
              if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.name === 'RedirectError' || err?.message === 'NEXT_REDIRECT') {
                throw err;
              }
              redirect(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
            }
          }}
          className="space-y-4 text-left mb-6"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo *</label>
            <input
              required
              name="name"
              type="text"
              placeholder="Ingresa tu nombre y apellido"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico *</label>
            <input
              required
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cédula / Documento ID *</label>
              <input
                required
                name="cedula"
                type="text"
                placeholder="Número de cédula"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono Celular *</label>
              <input
                required
                name="phone"
                type="tel"
                placeholder="Número de celular"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña Deseada *</label>
            <input
              required
              name="password"
              type="password"
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/60 text-[11px] text-[#2D1B69] leading-relaxed">
            📲 <strong>Verificación Inicial:</strong> Al registrarte, recibirás tu código numérico OTP de 6 dígitos en tu correo para validar la cuenta antes de ingresar.
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-all cursor-pointer shadow-md shadow-purple-900/10 active:scale-[0.99] mt-2"
          >
            Registrar mi Cuenta ✦
          </button>
        </form>

        <div className="text-xs text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#2D1B69] font-semibold hover:underline">
            Inicia Sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
