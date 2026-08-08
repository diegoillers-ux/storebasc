import { isDemoMode } from '@/lib/demoMode'
import { productRepository } from '@/lib/supabase/repositories/products'
import StoreCatalogClient from './StoreCatalogClient'

export interface StoreProduct {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category: string
}

const MOCK_PRODUCTS: StoreProduct[] = [
  {
    id: 'sahumerio-copal',
    name: 'Sahumerio Sagrado de Copal',
    description: 'Varitas de copal silvestre y resinas aromáticas para purificación energética de espacios.',
    price: 35000,
    stock: 12,
    imageUrl: null,
    category: 'Sahumerios',
  },
  {
    id: 'kit-cuarzo-rosa',
    name: 'Kit de Cristales de Cuarzo Rosa',
    description: 'Cristales de cuarzo rosa seleccionados a mano para atraer el amor incondicional y la paz interior.',
    price: 45000,
    stock: 3,
    imageUrl: null,
    category: 'Piedras y Cristales',
  },
  {
    id: 'vela-sandalo-lavanda',
    name: 'Vela de Sándalo & Lavanda',
    description: 'Vela de cera de soya intencionada en luna llena para inducir calma y potenciar meditaciones.',
    price: 40000,
    stock: 8,
    imageUrl: null,
    category: 'Velas',
  },
  {
    id: 'bruma-astral',
    name: 'Bruma Cúralotodo Astral',
    description: 'Elixir de aceites esenciales para armonización rápida del campo áurico y los chakras.',
    price: 32000,
    stock: 10,
    imageUrl: null,
    category: 'Aceites',
  },
  {
    id: 'palo-santo-salvia',
    name: 'Atado de Palo Santo & Salvia',
    description: 'Limpiador áurico ancestral para saumar ambientes y eliminar densidades estancadas.',
    price: 25000,
    stock: 2,
    imageUrl: null,
    category: 'Sahumerios',
  },
  {
    id: 'aceite-mirra-oro',
    name: 'Aceite Esencial de Mirra & Oro',
    description: 'Extracto aromático consagrado para ungir velas, amuletos o puntos de pulso.',
    price: 55000,
    stock: 6,
    imageUrl: null,
    category: 'Aceites',
  },
]

async function getProductsData(): Promise<StoreProduct[]> {
  try {
    if (isDemoMode()) {
      return MOCK_PRODUCTS
    }
    const rawProducts = await productRepository.list(true)
    const inStock = rawProducts.filter((p) => p.stock > 0)
    if (!inStock || inStock.length === 0) {
      return MOCK_PRODUCTS
    }
    return inStock.map((p) => ({
      id: p.id || p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      category: p.category || 'Artesanal',
    }))
  } catch (error) {
    console.error('Error fetching store products:', error)
    return MOCK_PRODUCTS
  }
}

export default async function TiendaPage() {
  const products = await getProductsData()
  return <StoreCatalogClient products={products} />
}
