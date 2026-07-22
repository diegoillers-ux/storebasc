import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { orderRepository } from '@/lib/firebase/repositories/orders'
import { customerRepository } from '@/lib/firebase/repositories/customers'
import { productRepository } from '@/lib/firebase/repositories/products'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shippingData, subtotal, shippingCost, total, paymentProof } = body

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingData || !shippingData.name || !shippingData.email) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para registrar el pedido.' }, { status: 400 })
    }

    if (isDemoMode()) {
      const mockOrderId = `ORD-DEMO-${Math.floor(1000 + Math.random() * 9000)}`
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        message: 'Pedido simulado registrado exitosamente.',
      })
    }

    // 1. Crear o actualizar cliente
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

    // 2. Formatear dirección completa
    const fullAddress = `${shippingData.address}, Barrio: ${shippingData.neighborhood}, ${shippingData.city}`

    // 3. Formatear ítems para la orden
    const orderItems = items.map((item: any) => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    }))

    // 4. Crear Order en Firestore
    const newOrder = await orderRepository.create(
      {
        customerId,
        adminId: null,
        status: 'PAYMENT_SUBMITTED',
        subtotal: subtotal || total,
        shipping: shippingCost || 0,
        total: total || subtotal,
        currency: 'COP',
        delivery: 'shipping',
        address: fullAddress,
        notes: shippingData.notes || null,
      },
      orderItems
    )

    // 5. Reducir stock atómicamente por cada producto
    for (const item of items) {
      const prodId = item.productId || item.id
      try {
        await productRepository.adjustStock(prodId, -item.quantity, 'venta', newOrder.id!)
      } catch (err) {
        console.warn(`No se pudo ajustar stock para producto ${prodId}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      message: 'Pedido registrado exitosamente.',
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error al registrar el pedido.', details }, { status: 500 })
  }
}
