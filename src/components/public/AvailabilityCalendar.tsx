'use client'

import { useState, useEffect } from 'react'

export interface AvailabilityCalendarProps {
  serviceId: string
  serviceName: string
  onConfirmSchedule: (date: string, time: string) => void
}

interface AvailableDay {
  dateStr: string // YYYY-MM-DD
  dayName: string // lun, mar, mié, etc.
  dayNumber: number
  monthName: string
  isAvailable: boolean
}

export default function AvailabilityCalendar({
  serviceId,
  serviceName,
  onConfirmSchedule,
}: AvailabilityCalendarProps) {
  const [days, setDays] = useState<AvailableDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Generar días disponibles para los próximos 14 días (excluyendo domingos)
  useEffect(() => {
    const generated: AvailableDay[] = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayOfWeek = d.getDay() // 0 = Domingo
      
      if (dayOfWeek !== 0) { // Excluir domingos
        const YYYY = d.getFullYear()
        const MM = String(d.getMonth() + 1).padStart(2, '0')
        const DD = String(d.getDate()).padStart(2, '0')
        const dateStr = `${YYYY}-${MM}-${DD}`
        
        const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        
        generated.push({
          dateStr,
          dayName: dayNames[dayOfWeek],
          dayNumber: d.getDate(),
          monthName: monthNames[d.getMonth()],
          isAvailable: true,
        })
      }
    }

    setDays(generated)
    if (generated.length > 0) {
      setSelectedDate(generated[0].dateStr)
    }
  }, [])

  // Consultar disponibilidad al cambiar la fecha seleccionada
  useEffect(() => {
    if (!selectedDate) return

    async function fetchSlots() {
      setLoading(true)
      try {
        const res = await fetch(`/api/calendar/free-busy?date=${selectedDate}&serviceId=${serviceId}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.availableSlots)) {
            setAvailableSlots(Array.isArray(data.availableSlots) ? data.availableSlots : [])
          } else {
            setAvailableSlots([])
          }
        } else {
          setAvailableSlots([])
        }
      } catch {
        setAvailableSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate, serviceId])

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirmSchedule(selectedDate, selectedTime)
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector Horizontal de Fechas */}
      <div>
        <label className="block text-xs font-bold text-ananda-900 uppercase mb-3">
          1. Selecciona un día disponible *
        </label>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {days.map((day) => {
            const isSelected = selectedDate === day.dateStr
            return (
              <button
                key={day.dateStr}
                onClick={() => {
                  setSelectedDate(day.dateStr)
                  setSelectedTime('')
                }}
                className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                  isSelected
                    ? 'bg-ananda-500 text-white font-bold border-ananda-500 shadow-md scale-105'
                    : 'bg-white text-ananda-900 border-ananda-200 hover:border-ananda-400 hover:bg-ananda-50'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider opacity-80">
                  {day.dayName}
                </span>
                <span className="font-display text-xl font-bold my-0.5">
                  {day.dayNumber}
                </span>
                <span className="text-[10px] opacity-75">{day.monthName}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selector de Horarios (Chips) */}
      <div>
        <label className="block text-xs font-bold text-ananda-900 uppercase mb-3">
          2. Selecciona la hora de tu sesión *
        </label>
        {loading ? (
          <div className="flex gap-3 animate-pulse">
            <div className="h-10 w-20 bg-ananda-200/60 rounded-full" />
            <div className="h-10 w-20 bg-ananda-200/60 rounded-full" />
            <div className="h-10 w-20 bg-ananda-200/60 rounded-full" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availableSlots.map((time) => {
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 transform active:scale-95 ${
                    isSelected
                      ? 'bg-ananda-900 text-white shadow-md ring-2 ring-ananda-500/50'
                      : 'bg-white border border-ananda-300 text-ananda-900 hover:bg-ananda-100 hover:border-ananda-400'
                  }`}
                >
                  ⏰ {time}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Botón de Confirmación */}
      <button
        type="button"
        disabled={!selectedDate || !selectedTime}
        onClick={handleConfirm}
        className="w-full py-4 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 disabled:opacity-40 disabled:hover:bg-ananda-900 transition-all duration-300 shadow-lg shadow-ananda-900/20 mt-6 active:scale-98"
      >
        Continuar al Paso de Pago →
      </button>
    </div>
  )
}
