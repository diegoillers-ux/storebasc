import { NextRequest, NextResponse } from 'next/server'
import { orderRepository } from '@/lib/supabase/repositories/orders'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: 'No autorizado para ejecutar cron' }, { status: 401 })
    }

    const allOrders = await orderRepository.list()
    const now = Date.now()
    const THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 horas

    let cleanedCount = 0

    for (const order of allOrders) {
      if ((order.status === 'PAYMENT_PENDING' || (order.status as string) === 'PENDING') && order.id) {
        const orderAge = now - new Date(order.createdAt).getTime()
        if (orderAge > THRESHOLD_MS) {
          await orderRepository.updateStatus(order.id, 'CANCELLED', null)
          cleanedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      cleanedOrdersCount: cleanedCount,
      message: `Se cancelaron ${cleanedCount} órdenes abandonadas.`,
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error en cron orders-cleanup:', error)
    return NextResponse.json({ error: 'Error ejecutando orders-cleanup', details }, { status: 500 })
  }
}
