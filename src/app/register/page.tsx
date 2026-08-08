import { signIn } from '@/lib/auth';
import Link from 'next/link';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-sm text-center">
        <p className="text-3xl mb-2">✦</p>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-sm text-gray-400 mb-6">Registro de Administrador</p>

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-left leading-relaxed">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            'use server';
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim().toLowerCase();
            const password = String(formData.get('password') || '').trim();

            if (!email || !password || !name) {
              return;
            }

            try {
              // Intentar registrar el perfil en la base de datos Supabase admin_users
              try {
                const { adminUserRepository } = await import('@/lib/supabase/repositories/admin-users');
                const existing = await adminUserRepository.getByEmail(email);
                if (!existing) {
                  await adminUserRepository.create({
                    email,
                    name,
                    role: 'SUPER_ADMIN',
                    active: true,
                  });
                }
              } catch (repoErr) {
                console.log('Nota: no se pudo guardar en admin_users table (modo demo/fallback):', repoErr);
              }

              // Registrar y autorizar inmediatamente la sesión
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              required
              name="name"
              type="text"
              placeholder="Diego Illeras"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
            />
          </div>

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
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña Deseada</label>
            <input
              required
              name="password"
              type="password"
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-colors cursor-pointer shadow-sm mt-2"
          >
            Registrar mi Usuario Admin
          </button>
        </form>

        <div className="text-xs text-gray-400">
          ¿Ya tienes cuenta de administrador?{' '}
          <Link href="/login" className="text-[#2D1B69] font-semibold hover:underline">
            Inicia Sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
