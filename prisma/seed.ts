import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos iniciales de Ananda V2...')

  // ── Servicios iniciales ─────────────────────────────────────────
  const servicios = await db.service.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Lectura Astral Completa',
        slug: 'lectura-astral-completa',
        description:
          'Lectura profunda de tu carta natal. Incluye análisis de planetas, casas, aspectos y tránsitos actuales. Se realiza por WhatsApp con audio + resumen escrito.',
        duration: 90,
        price: 120000,
        currency: 'COP',
        modality: 'whatsapp',
        preparation: 'Necesitamos tu fecha, hora y lugar de nacimiento exactos.',
        active: true,
        featured: true,
      },
      {
        name: 'Lectura de Tarot',
        slug: 'lectura-de-tarot',
        description:
          'Consulta de tarot para orientación en situaciones específicas: amor, trabajo, decisiones o camino de vida. Por WhatsApp con fotos de las cartas y explicación detallada.',
        duration: 60,
        price: 75000,
        currency: 'COP',
        modality: 'whatsapp',
        preparation: 'Ten lista tu pregunta o situación a consultar.',
        active: true,
        featured: true,
      },
      {
        name: 'Tránsitos del Mes',
        slug: 'transitos-del-mes',
        description:
          'Análisis de los tránsitos planetarios de los próximos 30 días sobre tu carta natal. Guía práctica para aprovechar energías y navegar desafíos.',
        duration: 45,
        price: 55000,
        currency: 'COP',
        modality: 'whatsapp',
        preparation: 'Necesitamos tu fecha, hora y lugar de nacimiento.',
        active: true,
        featured: false,
      },
      {
        name: 'Compatibilidad de Pareja',
        slug: 'compatibilidad-de-pareja',
        description:
          'Análisis sinástrico de dos cartas natales. Dinámicas, fortalezas, desafíos y potencial de la relación.',
        duration: 75,
        price: 95000,
        currency: 'COP',
        modality: 'whatsapp',
        preparation:
          'Necesitamos fecha, hora y lugar de nacimiento de ambas personas.',
        active: true,
        featured: false,
      },
    ],
  })

  // ── Disponibilidad semanal ──────────────────────────────────────
  // Lunes a viernes: 9am - 6pm, bloques de 60 min
  const diasLaborables = [1, 2, 3, 4, 5]
  for (const dia of diasLaborables) {
    await db.availability.upsert({
      where: {
        // Usamos un compound único si lo hay, si no crear directamente
        id: `avail-${dia}`,
      },
      create: {
        id: `avail-${dia}`,
        dayOfWeek: dia,
        startTime: '09:00',
        endTime: '18:00',
        slotMinutes: 60,
        active: true,
      },
      update: {
        startTime: '09:00',
        endTime: '18:00',
        slotMinutes: 60,
        active: true,
      },
    })
  }

  // Sábados: 10am - 2pm
  await db.availability.upsert({
    where: { id: 'avail-6' },
    create: {
      id: 'avail-6',
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '14:00',
      slotMinutes: 60,
      active: true,
    },
    update: {
      startTime: '10:00',
      endTime: '14:00',
      active: true,
    },
  })

  console.log(`✅ ${servicios.count} servicios creados`)
  console.log('✅ Disponibilidad semanal configurada (Lun-Vie 9-18h, Sáb 10-14h)')
  console.log('🎉 Seed completado — Ananda V2 lista para operar')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
