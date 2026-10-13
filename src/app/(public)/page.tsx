import Link from 'next/link'
import Image from 'next/image'
import { getGeneralContactLink } from '@/lib/whatsapp'
import { isDemoMode } from '@/lib/demoMode'
import { serviceRepository, Service } from '@/lib/supabase/repositories/services'
import { productRepository, Product } from '@/lib/supabase/repositories/products'

// Datos simulados de respaldo para Modo Demo o fallbacks de base de datos
const MOCK_SERVICES: Service[] = [
  {
    id: 'serv-1',
    name: 'Lectura de Carta Natal Completa',
    slug: 'carta-natal',
    description: 'Lectura astrológica detallada cruzando planetas, casas astrales y tránsitos mayores para entender tu mapa de vida.',
    duration: 60,
    price: 150000,
    currency: 'COP',
    modality: 'whatsapp',
    preparation: null,
    active: true,
    featured: true,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'serv-2',
    name: 'Lectura de Tarot Express',
    slug: 'tarot-express',
    description: 'Sesión rápida enfocada en una pregunta concreta sobre trabajo, amor o bienestar personal con guía inmediata.',
    duration: 30,
    price: 50000,
    currency: 'COP',
    modality: 'whatsapp',
    preparation: null,
    active: true,
    featured: false,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'serv-3',
    name: 'Sinastría de Pareja',
    slug: 'sinastria',
    description: 'Estudio comparativo de dos cartas astrales para comprender las dinámicas de relación, puntos de unión y crecimiento.',
    duration: 90,
    price: 200000,
    currency: 'COP',
    modality: 'whatsapp',
    preparation: null,
    active: true,
    featured: false,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Sahumerio Sagrado de Copal',
    slug: 'sahumerio-copal',
    description: 'Varitas de copal silvestre y resinas aromáticas para purificación energética profunda de espacios.',
    price: 35000,
    currency: 'COP',
    stock: 12,
    sku: 'SAH-COP-01',
    category: 'Sahumerios',
    imageUrl: null,
    images: [],
    active: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    name: 'Kit de Cristales de Cuarzo Rosa',
    slug: 'kit-cuarzo-rosa',
    description: 'Cristales de cuarzo rosa seleccionados a mano para vibrar en amor incondicional y paz interior.',
    price: 45000,
    currency: 'COP',
    stock: 8,
    sku: 'CRI-ROS-02',
    category: 'Piedras y Cristales',
    imageUrl: null,
    images: [],
    active: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-3',
    name: 'Vela de Sándalo & Lavanda',
    slug: 'vela-sandalo-lavanda',
    description: 'Vela artesanal de cera de soya consagrada en luna llena para momentos de meditación.',
    price: 40000,
    currency: 'COP',
    stock: 5,
    sku: 'VEL-SAN-03',
    category: 'Velas',
    imageUrl: null,
    images: [],
    active: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-4',
    name: 'Bruma Cúralotodo Astral',
    slug: 'bruma-astral',
    description: 'Elixir botánico de aceites esenciales para limpieza y armonización rápida del campo áurico.',
    price: 32000,
    currency: 'COP',
    stock: 10,
    sku: 'BRU-AST-04',
    category: 'Aceites',
    imageUrl: null,
    images: [],
    active: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function getFeaturedServices(): Promise<Service[]> {
  try {
    if (isDemoMode()) {
      return MOCK_SERVICES
    }
    const services = await serviceRepository.list(true)
    if (!services || services.length === 0) {
      return MOCK_SERVICES
    }
    return services.slice(0, 3)
  } catch {
    return MOCK_SERVICES
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    if (isDemoMode()) {
      return MOCK_PRODUCTS
    }
    const products = await productRepository.list(true)
    const inStock = products.filter((p) => p.stock > 0)
    if (!inStock || inStock.length === 0) {
      return MOCK_PRODUCTS
    }
    return inStock.slice(0, 4)
  } catch {
    return MOCK_PRODUCTS
  }
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function HomePage() {
  const waLink = getGeneralContactLink()
  const services = await getFeaturedServices()
  const products = await getFeaturedProducts()

  return (
    <main className="w-full overflow-x-hidden font-sans bg-[#FAF8FF]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-ananda-950 to-ananda-900 text-white overflow-hidden">
        {/* Luces y destellos cosmicos de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ananda-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Patron de Estrellas SVG sutiles */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#A78BFA">
            <circle cx="15%" cy="20%" r="1.5" />
            <circle cx="85%" cy="25%" r="2" />
            <circle cx="70%" cy="65%" r="1" />
            <circle cx="25%" cy="75%" r="2.5" />
            <circle cx="50%" cy="15%" r="1" />
            <circle cx="90%" cy="80%" r="1.5" />
            <polygon points="200,120 203,128 211,131 203,134 200,142 197,134 189,131 197,128" opacity="0.6" />
            <polygon points="900,300 902,306 908,308 902,310 900,316 898,310 892,308 898,306" opacity="0.5" />
          </g>
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-ananda-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="text-amber-300">✦</span> Lecturas Astrales & Espacio Místico · Cali
          </span>

          {/* H1 Principal */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-white">
            Tu cielo interior,{' '}
            <span className="bg-gradient-to-r from-ananda-400 via-purple-300 to-amber-200 bg-clip-text text-transparent">
              revelado
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="font-sans text-gray-300 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
            Sesiones de astrología y tarot personalizadas para iluminar tu camino.
            Productos artesanales sagrados creados con intención pura.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
            <Link
              href="/servicios"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-ananda-500 text-white font-semibold text-sm shadow-lg shadow-ananda-500/25 hover:bg-purple-600 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Ver sesiones
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 2. SERVICIOS DESTACADOS */}
      <section id="servicios" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-ananda-500 text-xs font-bold uppercase tracking-widest mb-3">
            Lecturas & Acompañamiento
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ananda-950 mb-4">
            Sesiones Astrales Destacadas
          </h2>
          <p className="text-gray-600 text-base">
            Descubre el mapa cósmico de tu ser con sesiones diseñadas para brindarte claridad y evolución personal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          {services.map((service) => (
            <div
              key={service.id || service.slug}
              className="glass-card border border-ananda-400/20 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl hover:border-ananda-500/40 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3.5 py-1 bg-ananda-100 text-ananda-800 text-xs font-medium rounded-full">
                    ⏱ {service.duration} min
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ananda-500">
                    {service.modality === 'whatsapp' ? 'WhatsApp Directo' : service.modality}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-ananda-950 group-hover:text-ananda-500 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-3">
                  {service.description || 'Consulta personalizada con Lina para abordar tu momento actual.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-ananda-100/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-medium">Inversión</span>
                  <span className="font-display text-2xl font-bold text-ananda-900">
                    {formatCOP(service.price)}
                  </span>
                </div>
                <Link
                  href={`/checkout/${service.id || service.slug}`}
                  className="px-6 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-colors shadow-sm"
                >
                  Reservar
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 text-ananda-500 font-semibold text-sm hover:text-ananda-900 transition-colors"
          >
            Ver todos los servicios de la tienda →
          </Link>
        </div>
      </section>

      {/* 3. TIENDA DESTACADA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#FAF8FF] to-white border-t border-ananda-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-ananda-500 text-xs font-bold uppercase tracking-widest mb-3">
              Catálogo Artesanal
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ananda-950 mb-4">
              Objetos con Alma & Propósito
            </h2>
            <p className="text-gray-600 text-base">
              Herramientas energéticas y botánica sagrada intencionadas para acompañar tus rituales diarios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {products.map((product) => (
              <div
                key={product.id || product.slug}
                className="bg-white border border-ananda-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-ananda-400/30 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Imagen del Producto o SVG Místico de Reemplazo */}
                <div className="relative w-full h-52 bg-ananda-50 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ananda-100/50 to-ananda-50 flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-3xl mb-2 text-ananda-500">✦</span>
                      <span className="text-xs font-medium text-ananda-700 uppercase tracking-wider">
                        {product.category || 'Intención Astral'}
                      </span>
                    </div>
                  )}
                  {product.stock > 0 && (
                    <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      En stock ({product.stock})
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-ananda-500 uppercase tracking-wider block mb-1">
                      {product.category || 'Producto Físico'}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ananda-950 group-hover:text-ananda-500 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {product.description || 'Producto artesanal sagrado preparado con intención.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ananda-50 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-ananda-900">
                      {formatCOP(product.price)}
                    </span>
                    <Link
                      href="/tienda"
                      className="text-xs font-semibold text-ananda-500 hover:text-ananda-900 transition-colors"
                    >
                      Detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tienda"
              className="px-8 py-3.5 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-all duration-300 shadow-md"
            >
              Ver tienda completa
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SOBRE LINA (About) */}
      <section className="py-24 px-6 bg-gradient-to-r from-ananda-950 via-[#241554] to-ananda-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Tarjeta Visual Lina con Acento Dorado */}
          <div className="border-2 border-amber-400/40 rounded-3xl p-8 sm:p-10 bg-white/5 backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 p-1 mb-6 shadow-xl">
              <div className="w-full h-full rounded-full bg-ananda-950 flex items-center justify-center">
                <span className="text-amber-300 font-display text-4xl font-bold">L</span>
              </div>
            </div>

            <p className="italic text-amber-200/90 text-sm font-display max-w-sm leading-relaxed mb-4">
              "El cielo no determina tu destino, revela tu potencial infinito para caminar con propósito."
            </p>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Lina · Astróloga & Creadora
            </span>
          </div>

          {/* Texto Inspirador */}
          <div className="flex flex-col justify-center">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
              ✦ Sobre Espíritu Ananda
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Guiando tu despertar con amor y astrología
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-4">
              Soy Lina, astróloga y facilitadora holística. Espíritu Ananda nació del deseo profundo de crear un refugio consciente donde la sabiduría de los astros y los rituales sagrados se encuentren con tu vida cotidiana.
            </p>
            <p className="text-gray-300 text-base leading-relaxed mb-8">
              Cada lectura es una conversación personalizada de autoconocimiento, guiada con empatía y respeto. Mi propósito es acompañarte a reconectar con tu esencia y tu paz interior.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-bold text-sm block mb-1">✦ Sabiduría</span>
                <span className="text-xs text-gray-300">Carta natal y tránsitos astrales.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-bold text-sm block mb-1">✦ Intuición</span>
                <span className="text-xs text-gray-300">Tarot y visión terapéutica.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-bold text-sm block mb-1">✦ Intención</span>
                <span className="text-xs text-gray-300">Objetos consagrados a mano.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIOS */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-ananda-500 text-xs font-bold uppercase tracking-widest mb-3">
              Experiencias de Consultantes
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ananda-950 mb-4">
              Historias de Transformación
            </h2>
            <p className="text-gray-600 text-base">
              Lo que comparten quienes han navegado su mapa natal con Espíritu Ananda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card border border-ananda-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "La lectura de mi carta natal con Lina fue una experiencia reveladora. Me dio claridad y mucha tranquilidad para tomar decisiones importantes en mi carrera."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-ananda-100 flex items-center justify-between">
                <span className="font-bold text-ananda-950 font-display text-sm">Camila R.</span>
                <span className="text-xs text-ananda-500 font-medium">Cali, Colombia</span>
              </div>
            </div>

            <div className="glass-card border border-ananda-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "El kit de cristales llegó impecable y con una guía súper linda. Se nota el amor y la intención con la que empaquetan cada detalle."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-ananda-100 flex items-center justify-between">
                <span className="font-bold text-ananda-950 font-display text-sm">Mariana V.</span>
                <span className="text-xs text-ananda-500 font-medium">Bogotá, Colombia</span>
              </div>
            </div>

            <div className="glass-card border border-ananda-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "Hice la consulta de Tarot Express por WhatsApp y quedé impresionada con la precisión y el trato tan amoroso. Sin duda volveré a agendar."
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-ananda-100 flex items-center justify-between">
                <span className="font-bold text-ananda-950 font-display text-sm">Sofía G.</span>
                <span className="text-xs text-ananda-500 font-medium">Medellín, Colombia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL BANNER */}
      <section className="py-20 px-6 bg-ananda-900 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-ananda-950 via-ananda-900 to-ananda-800 opacity-90" />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-ananda-400 text-xs font-bold uppercase tracking-widest mb-3">
            ✦ Da el primer paso
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            ¿Lista para descubrir lo que los astros tienen para ti?
          </h2>
          <p className="text-gray-300 max-w-xl mt-4 text-base leading-relaxed">
            Escríbenos directamente por WhatsApp para resolver tus dudas o agendar tu sesión personalizada.
          </p>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 mt-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-xl shadow-emerald-950/40 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            Hablar por WhatsApp con Lina
          </a>
        </div>
      </section>
    </main>
  )
}
