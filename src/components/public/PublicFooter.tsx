export function PublicFooter() {
  return (
    <footer className="bg-[#2D1B69] text-white py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="font-bold text-lg">✦ Espíritu Ananda</p>
          <p className="text-violet-300 text-sm mt-1">Lecturas astrales · Productos artesanales</p>
          <p className="text-violet-400 text-xs mt-1">Cali, Colombia</p>
        </div>
        <div className="text-sm text-violet-300 space-y-1">
          <p>Sesiones por WhatsApp</p>
          <p>Envíos a todo Colombia</p>
        </div>
      </div>
      <p className="text-center text-violet-400 text-xs mt-8">© {new Date().getFullYear()} Espíritu Ananda</p>
    </footer>
  )
}
