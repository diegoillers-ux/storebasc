import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { orderRepository } from '@/lib/supabase/repositories/orders'
import { customerRepository } from '@/lib/supabase/repositories/customers'
import { productRepository } from '@/lib/supabase/repositories/products'
import { getRequestIp, isRateLimited } from '@/lib/rateLimit'
import { paymentRepository, type PaymentMethod } from '@/lib/supabase/repositories/payments'
import { uploadPaymentProof } from '@/lib/payments/proof'
import { sendAdminPaymentProofEmail, sendPendingSaleEmail } from '@/lib/mailer'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type OrderItemInput = {
  id?: string
  productId?: string
  quantity?: number | string
}

type ShippingDataInput = {
  name: string
  email: string
  phone?: string
  address?: string
  neighborhood?: string
  city?: string
  notes?: string
}

type OrderRequestBody = {
  items?: OrderItemInput[]
  shippingData?: ShippingDataInput
  shippingCost?: number | string
  deferStockAdjustment?: boolean
  paymentMethod?: PaymentMethod
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: OrderRequestBody
    let proofFile: File | null = null
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      body = JSON.parse(String(formData.get('payload') || '{}')) as OrderRequestBody
      const submittedProof = formData.get('proof')
      proofFile = submittedProof instanceof File ? submittedProof : null
    } else {
      body = await req.json() as OrderRequestBody
    }

    const { items, shippingData, shippingCost, deferStockAdjustment, paymentMethod = 'TRANSFER' } = body

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

    const allowedPaymentMethods: PaymentMethod[] = ['TRANSFER', 'NEQUI', 'DAVIPLATA', 'CASH', 'GATEWAY']
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Medio de pago no válido.' }, { status: 400 })
    }
    if (contentType.includes('multipart/form-data') && !proofFile) {
      return NextResponse.json({ error: 'Debes adjuntar un comprobante.' }, { status: 400 })
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
        } catch {
          // Sin stock real (carrera con otra venta): anular el pedido en vez
          // de dejarlo creado sin movimiento de inventario.
          await orderRepository.updateStatus(newOrder.id!, 'CANCELLED', null)
          return NextResponse.json({ error: `Stock insuficiente para ${item.productId}. Pedido anulado.` }, { status: 400 })
        }
      }
    }

    if (proofFile) {
      try {
        const uploadedProof = await uploadPaymentProof(proofFile, `order-${newOrder.id}`)
        await paymentRepository.create({
          customerId,
          bookingId: null,
          orderId: newOrder.id!,
          method: paymentMethod,
          provider: 'manual',
          amount: total,
          currency: 'COP',
          status: 'SUBMITTED',
          reference: null,
          receiptUrl: uploadedProof.url,
          providerData: { filename: proofFile.name, contentType: proofFile.type },
          verifiedAt: null,
          verifiedBy: null,
        })

        const paymentNote = `${shippingData.notes || 'Sin nota adicional'}\nEntrega: ${fullAddress}`
        await sendAdminPaymentProofEmail({
          eventId: newOrder.id!,
          reservationCode: newOrder.id!,
          clientName: shippingData.name,
          clientEmail: shippingData.email,
          serviceName: `Pedido de productos (${orderItems.length} ítems)`,
          dateTime: 'Pedido sin agenda',
          paymentNote,
          filename: proofFile.name,
          contentType: proofFile.type,
          content: uploadedProof.buffer,
          saleType: 'product',
        })
        sendPendingSaleEmail({
          toEmail: shippingData.email,
          clientName: shippingData.name,
          itemName: `Pedido de productos (${orderItems.length} ítems)`,
          dateTime: 'Pedido sin agenda',
          reservationCode: newOrder.id!,
          saleType: 'product',
        }).catch(console.error)
      } catch (proofError) {
        console.error('Error processing order payment proof:', proofError)
        return NextResponse.json({
          error: proofError instanceof Error ? proofError.message : 'No se pudo guardar el comprobante.',
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      paymentSubmitted: Boolean(proofFile),
      message: 'Pedido registrado exitosamente.',
      totals: { subtotal, shipping, total },
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error al registrar el pedido.', details }, { status: 500 })
  }
}
