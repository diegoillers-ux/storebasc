import { isDemoMode } from '@/lib/demoMode'
import { serviceRepository } from '@/lib/supabase/repositories/services'
import ServicesCatalogClient from './ServicesCatalogClient'

export interface CatalogService {
  id: string
  title: string
  description: string | null
  price: number
  duration: number
  category: string
}

const MOCK_SERVICES: CatalogService[] = [
  {
    id: 'carta-natal',
    title: 'Lectura de Carta Natal Completa',
    description: 'Exploración exhaustiva de tu mapa cósmico al nacer: soles, lunas, ascendente, casas astrales y tránsitos vitales.',
    price: 150000,
    duration: 60,
    category: 'Carta Natal',
  },
  {
    id: 'tarot-express',
    title: 'Lectura de Tarot Express',
    description: 'Sesión rápida enfocada en una pregunta puntual de amor, trabajo o salud para obtener orientación inmediata.',
    price: 50000,
    duration: 30,
    category: 'Tarot',
  },
  {
    id: 'revolucion-solar',
    title: 'Revolución Solar - Año Personal',
    description: 'Análisis del retorno solar anual para anticipar el clima energético, retos y oportunidades de tu próximo ciclo de cumpleaños.',
    price: 180000,
    duration: 75,
    category: 'Año Personal',
  },
  {
    id: 'sinastria-pareja',
    title: 'Sinastría & Dinámica de Pareja',
    description: 'Estudio profundo de la química astral entre dos personas, analizando puntos de sintonía y aprendizaje mutuo.',
    price: 200000,
    duration: 90,
    category: 'Relaciones',
  },
  {
    id: 'tarot-terapeutico',
    title: 'Lectura de Tarot Terapéutico',
    description: 'Tirada completa del arquetipo de la psique para desbloquear patrones inconscientes y sanar heridas del alma.',
    price: 90000,
    duration: 60,
    category: 'Tarot',
  },
]

async function getServicesData(): Promise<CatalogService[]> {
  try {
    if (isDemoMode()) {
      return MOCK_SERVICES
    }
    const rawServices = await serviceRepository.list(true)
    if (!rawServices || rawServices.length === 0) {
      return MOCK_SERVICES
    }
    return rawServices.map((s) => ({
      id: s.id || s.slug,
      title: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      category: s.modality === 'whatsapp' ? 'Tarot' : 'Carta Natal',
    }))
  } catch (error) {
    console.error('Error fetching services catalog:', error)
    return MOCK_SERVICES
  }
}

export default async function ServicesPage() {
  const services = await getServicesData()
  return <ServicesCatalogClient services={services} />
}
