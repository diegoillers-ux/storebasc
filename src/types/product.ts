export interface ProductWithStock {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  stock: number
  imageUrl?: string
  active: boolean
  featured: boolean
}

export type StockMovementReason = 'sale' | 'adjustment' | 'return' | 'initial'
