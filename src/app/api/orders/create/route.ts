import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { orderRepository } from '@/lib/supabase/repositories/orders'
import { customerRepository } from '@/lib/supabase/repositories/customers'
import { productRepository } from '@/lib/supabase/repositories/products'
import { getRequestIp, isRateLimited } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shippingData, shippingCost, deferStockAdjustment } = body

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingData || !shippingData.name || !shippingData.email) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para registrar el pedido.' }, { status: 400 })
    }

    const ip = getRequestIp(req.headers.get('x-forwarded-for'), req.headers.get('x-real-ip'), req.headers.get('cf-connecting-ip'))
    if (isRateLimited(`orders-create:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 })
    }

    if (!EMAIL_RE.test(String(shippingData.email))) {
      return NextResponse.json({ error: 'El correo de contacto no es vÃ¡lido.' }, { status: 400 })
    }

    if (isDemoMode()) {
      const mockOrderId = `ORD-DEMO-${Math.floor(1000 + Math.random() * 9000)}`
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        message: 'Pedido simulado registrado exitosamente.',
      })
    }

    // â”€â”€â”€ Validar y recomponer precios/stock desde la BD (nunca confiar en el cliente) â”€â”€â”€
    const shipping = Number(shippingCost || 0)
    if (!Number.isFinite(shipping) || shipping < 0) {
      return NextResponse.json({ error: 'Costo de envÃ­o invÃ¡lido.' }, { status: 400 })
    }

    const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = []
    let subtotal = 0

    for (const item of items) {
      const productId = String(item.productId || item.id || '').trim()
      const quantity = Number(item.quantity)

      if (!productId) {
        return NextResponse.json({ error: 'Falta el identificador de un producto.' }, { status: 400 })
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: `Cantidad invÃ¡lida para el producto ${productId}.` }, { status: 400 })
      }

      const product = await productRepository.getById(productId)
      if (!product || !product.active) {
        return NextResponse.json({ error: `Producto no encontrado o inactivo: ${productId}` }, { status: 400 })
      }
      if (product.stock < quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}.` }, { status: 400 })
      }

      const lineTotal = Number(product.price) * quantity
      orderItems.push({ productId, quantity, unitPrice: Number(product.price), total: lineTotal })
      subtotal += lineTotal
    }

    const total = subtotal + shipping

    let customerId = ''
    const existingCustomers = await customerRepository.getByEmail(shippingData.email)

    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id!
      await customerRepository.update(customerId, {
        name: shippingData.name,
        phone: shippingData.phone || existingCustomers[0].phone,
        notes: shippingData.notes || existingCustomers[0].notes,
      })
    } else {
      const newCustomer = await customerRepository.create({
        name: shippingData.name,
        email: shippingData.email,
        phone: shippingData.phone || '',
        notes: shippingData.notes || null,
        source: 'tienda-web',
        active: true,
      })
      customerId = newCustomer.id!
    }

    const fullAddress = `${shippingData.address}, Barrio: ${shippingData.neighborhood}, ${shippingData.city}`

    const initialStatus = deferStockAdjustment ? 'PAYMENT_PENDING' : 'PAYMENT_SUBMITTED'

    const newOrder = await orderRepository.create(
      {
        customerId,
        adminId: null,
        status: initialStatus,
        subtotal,
        shipping,
        total,
        currency: 'COP',
        delivery: 'shipping',
        address: fullAddress,
        notes: shippingData.notes || null,
      },
      orderItems
    )

    if (!deferStockAdjustment) {
      for (const item of orderItems) {
        try {
          await productRepository.adjustStock(item.productId, -item.quantity, 'venta', newOrder.id!)
        } catch (err) {
          console.warn(`No se pudo ajustar stock para producto ${item.productId}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      message: 'Pedido registrado exitosamente.',
      totals: { subtotal, shipping, total },
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error al registrar el pedido.', details }, { status: 500 })
  }
}
