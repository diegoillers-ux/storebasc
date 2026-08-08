import Link from 'next/link';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  const sent = params?.sent;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5FF] p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-sm text-center">
        <p className="text-3xl mb-2">✦</p>
        <h1 className="text-xl font-bold text-[#2D1B69] mb-1">Espíritu Ananda</h1>
        <p className="text-sm text-gray-400 mb-6">Recuperación de Contraseña</p>

        {sent ? (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-left leading-relaxed">
            <p className="font-bold mb-1">📩 Correo enviado con éxito</p>
            <p>Hemos enviado un código/enlace de recuperación a tu casilla de correo electrónico. Revisa tu bandeja de entrada o carpeta de spam.</p>
          </div>
        ) : (
          <form
            action={async (formData: FormData) => {
              'use server';
              const email = String(formData.get('email') || '').trim();
              if (!email) return;

              // Simulación / Integración de envío de correo de recuperación
            }}
            className="space-y-4 text-left mb-6"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico Registrado</label>
              <input
                required
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D1B69]/20 focus:border-[#2D1B69] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2D1B69] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#1E1145] transition-colors cursor-pointer shadow-sm mt-2"
            >
              Enviar Código de Recuperación
            </button>
          </form>
        )}

        <div className="text-xs text-gray-400">
          <Link href="/login" className="text-[#2D1B69] font-semibold hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
