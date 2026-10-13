export interface CustomerSummary {
  id: string
  name: string
  phone: string
  email?: string
  totalBookings: number
  totalOrders: number
  lastActivity?: Date
}
