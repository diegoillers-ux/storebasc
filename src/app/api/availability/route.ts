import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const monthStr = searchParams.get('month')
    const serviceId = searchParams.get('serviceId')

    if (isDemoMode() || !monthStr) {
      // Generar días disponibles mock para el mes solicitado
      return NextResponse.json({
        availableSlots: [
          { date: '2026-07-23', times: ['09:00', '10:30', '14:00', '15:30', '17:00'] },
          { date: '2026-07-24', times: ['09:00', '11:00', '14:30', '16:00'] },
          { date: '2026-07-27', times: ['10:00', '11:30', '15:00', '16:30'] },
          { date: '2026-07-28', times: ['09:30', '11:00', '14:00', '17:00'] },
        ],
      })
    }

    return NextResponse.json({
      serviceId,
      month: monthStr,
      availableSlots: [
        { date: `${monthStr}-10`, times: ['09:00', '10:30', '14:00', '15:30'] },
        { date: `${monthStr}-11`, times: ['09:00', '11:00', '15:00'] },
      ],
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Error al consultar disponibilidad', details }, { status: 500 })
  }
}
