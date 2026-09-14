import { isDemoMode } from '@/lib/demoMode'
import { serviceRepository } from '@/lib/supabase/repositories/services'
import Step1ClientForm from './Step1ClientForm'

async function getServiceDetails(serviceId: string) {
  try {
    if (isDemoMode()) {
      return {
        id: serviceId,
        name: serviceId === 'tarot-express' ? 'Lectura de Tarot Express' : 'Lectura de Carta Natal Completa',
        price: serviceId === 'tarot-express' ? 50000 : 150000,
        duration: 60,
      }
    }
    const service = await serviceRepository.getById(serviceId)
    if (service) {
      return {
        id: service.id || serviceId,
        name: service.name,
        price: service.price,
        duration: service.duration,
      }
    }
    const bySlug = await serviceRepository.getBySlug(serviceId)
    if (bySlug) {
      return {
        id: bySlug.id || serviceId,
        name: bySlug.name,
        price: bySlug.price,
        duration: bySlug.duration,
      }
    }
    return {
      id: serviceId,
      name: 'Lectura Astral Personalizada',
      price: 150000,
      duration: 60,
    }
  } catch {
    return {
      id: serviceId,
      name: 'Lectura Astral Personalizada',
      price: 150000,
      duration: 60,
    }
  }
}

export default async function CheckoutStep1Page({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const resolvedParams = await params
  const service = await getServiceDetails(resolvedParams.serviceId)

  return <Step1ClientForm service={service} />
}
