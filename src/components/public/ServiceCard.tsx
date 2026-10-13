import Link from 'next/link'

export interface ServiceCardProps {
  id: string
  title: string
  description: string | null
  price: number
  duration: number
  category?: string | null
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ServiceCard({
  id,
  title,
  description,
  price,
  duration,
  category,
}: ServiceCardProps) {
  return (
    <div className="glass-card hover:shadow-premium-hover rounded-3xl p-8 flex flex-col justify-between border border-ananda-400/20 transition-all duration-300 group hover:border-ananda-500/40">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="px-3.5 py-1 bg-ananda-100 text-ananda-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            {category || 'Lectura Astral'}
          </span>
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <span>⏱</span> {duration} min
          </span>
        </div>

        <h3 className="font-display text-2xl font-bold text-ananda-950 group-hover:text-ananda-500 transition-colors mb-3 leading-snug">
          {title}
        </h3>

        <p className="text-gray-600 text-sm truncate-2 leading-relaxed mb-6">
          {description || 'Sesión personalizada de orientación astral e intuitiva.'}
        </p>
      </div>

      <div className="pt-6 border-t border-ananda-100/60 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-gray-400 block uppercase font-medium">Inversión</span>
          <span className="font-display text-2xl font-bold text-amber-500">
            {formatCOP(price)}
          </span>
        </div>

        <Link
          href={`/checkout/${id}`}
          className="px-6 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5"
        >
          Reservar sesión
        </Link>
      </div>
    </div>
  )
}
