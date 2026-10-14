export interface AvailableDay {
  dateStr: string
  dayName: string
  dayNumber: number
  monthName: string
  isAvailable: boolean
}

const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getBogotaCalendarDate(now: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  }
}

export function generateAvailableDays(now: Date = new Date()): AvailableDay[] {
  const today = getBogotaCalendarDate(now)
  const generated: AvailableDay[] = []

  for (let i = 1; i <= 14; i++) {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + i))
    const dayOfWeek = date.getUTCDay()
    if (dayOfWeek === 0) continue

    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    generated.push({
      dateStr,
      dayName: dayNames[dayOfWeek],
      dayNumber: day,
      monthName: monthNames[month - 1],
      isAvailable: true,
    })
  }

  return generated
}
