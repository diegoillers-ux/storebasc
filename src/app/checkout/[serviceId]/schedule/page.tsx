'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../page.module.css';

import { getServiceById } from '@/lib/data';
import { format, addDays, startOfToday, parse, addMinutes, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

type Settings = { workDays: number[]; startTime: string; endTime: string; slotDurationMinutes: number; blockedDates: string[]; };

export default function SchedulePage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params?.serviceId as string;
    const service = getServiceById(serviceId);

    // State
    const [settings, setSettings] = useState<Settings | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [creatingEvent, setCreatingEvent] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !sessionStorage.getItem('booking_name')) {
            router.push(`/checkout/${serviceId}`);
        }

        // Fetch Admin Settings
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.settings) setSettings(data.settings);
            } catch (error) {
                console.error("Error cargando configuración", error);
            }
        };
        loadSettings();
    }, [router, serviceId]);

    // Fetch de disponibilidad inter-cruzada
    useEffect(() => {
        if (selectedDate && settings) {
            setLoadingSlots(true);
            setSelectedTime(null);

            const fetchAvailability = async () => {
                try {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const response = await fetch(`/api/calendar/free-busy?date=${dateStr}`);
                    const data = await response.json();

                    // 1. Generar los slots base según la configuración del Admin
                    const slotStart = parse(settings.startTime, 'HH:mm', selectedDate);
                    const slotEnd = parse(settings.endTime, 'HH:mm', selectedDate);
                    const duration = settings.slotDurationMinutes || 60;

                    const possibleSlots: Date[] = [];
                    let currentSlot = slotStart;

                    while (currentSlot < slotEnd) {
                        // Solo agregar si la duración total cabe antes de la hora de cierre
                        if (addMinutes(currentSlot, duration) <= slotEnd) {
                            possibleSlots.push(currentSlot);
                        }
                        currentSlot = addMinutes(currentSlot, duration);
                    }

                    // 2. Filtrar slots colisionando con eventos reales de Google Calendar
                    const busyPeriods = data.busy || [];

                    const finalSlots = possibleSlots.filter(slot => {
                        const slotStartT = slot.getTime();
                        const slotEndT = addMinutes(slot, duration).getTime();

                        // Verificar colisión con cada periodo ocupado
                        for (const period of busyPeriods) {
                            const busyStart = new Date(period.start).getTime();
                            const busyEnd = new Date(period.end).getTime();

                            // Lógica de Solapamiento
                            if (slotStartT < busyEnd && slotEndT > busyStart) {
                                return false; // El slot se cruza, descartar
                            }
                        }

                        // Si es HOY, no mostrar slots que ya pasaron
                        if (isSameDay(slot, new Date()) && slotStartT < new Date().getTime()) {
                            return false;
                        }

                        return true;
                    });

                    // Convertir a formato AM/PM para UI
                    setAvailableTimes(finalSlots.map(d => format(d, 'hh:mm a')));

                } catch (error) {
                    console.error("Error fetching slots", error);
                    setAvailableTimes([]);
                } finally {
                    setLoadingSlots(false);
                }
            };

            fetchAvailability();
        }
    }, [selectedDate, settings]);

    if (!service || !settings) {
        return <div className={styles.container}><div style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando agenda mágica...</div></div>;
    }

    // Generar próximos días dinámicamente según reglas del Admin
    const today = startOfToday();
    const nextDays: Date[] = [];
    let i = 1;
    // Buscar los próximos 7 días laborales reales
    while (nextDays.length < 7 && i < 30) {
        const potentialDay = addDays(today, i);
        const dayOfWeek = parseInt(format(potentialDay, 'i')) % 7; // 0=Domingo, 1=Lunes
        const dateStr = format(potentialDay, 'yyyy-MM-dd');

        // Si el día de la semana está validado y no está bloqueado por vacaciones
        if (settings.workDays.includes(dayOfWeek) && !settings.blockedDates.includes(dateStr)) {
            nextDays.push(potentialDay);
        }
        i++;
    }

    const handleProceedToPay = async () => {
        if (selectedDate && selectedTime && service) {
            setCreatingEvent(true);
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');

                // Convert AM/PM back to 24h
                let hour = parseInt(selectedTime.split(':')[0]);
                const isPM = selectedTime.includes('PM');
                if (isPM && hour !== 12) hour += 12;
                if (!isPM && hour === 12) hour = 0;

                const startDateTime = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:${selectedTime.split(':')[1].substring(0, 2)}:00-05:00`).toISOString();

                // Sumar los minutos dinámicos reales en vez de 90 estáticos
                const endDateTimeObj = new Date(new Date(startDateTime).getTime() + (settings.slotDurationMinutes * 60000));
                const endDateTime = endDateTimeObj.toISOString();

                const userName = sessionStorage.getItem('booking_name') || 'Cliente';
                const userEmail = sessionStorage.getItem('booking_email') || '';

                const response = await fetch('/api/calendar/create-pending', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: `${service.title} - ${userName}`,
                        description: `Sesión agendada de ${service.title}.\nEmail: ${userEmail}\nContexto: ${sessionStorage.getItem('booking_context') || ''}`,
                        startDateTime,
                        endDateTime
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionStorage.setItem('booking_date', dateStr);
                    sessionStorage.setItem('booking_time', selectedTime);
                    if (data?.eventId) {
                        sessionStorage.setItem('booking_event_id', data.eventId);
                    }
                    if (data?.reservationCode) {
                        sessionStorage.setItem('booking_reference', data.reservationCode);
                    }
                    router.push(`/checkout/${serviceId}/pay`);
                } else {
                    alert("Ese horario acaba de ser ocupado. Por favor, selecciona otro.");
                }
            } catch (error) {
                console.error(error);
                alert("Error de conexión al agendar.");
            } finally {
                setCreatingEvent(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '750px', width: '100%', padding: '2rem' }}>

                {/* Progress Indicator */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>1. Tus Datos</div>
                    <div className={styles.progressLine} style={{ opacity: 1, backgroundColor: 'var(--primary)' }}></div>
                    <div className={styles.progressStep} style={{ opacity: 1 }}>2. Agendar</div>
                    <div className={styles.progressLine} style={{ opacity: 0.5 }}></div>
                    <div className={styles.progressStep} style={{ opacity: 0.5 }}>3. Pago Seguro</div>
                </div>

                <h1 className={`${styles.title} gradient-text`}>Elige tu Momento</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
                    Selecciona una fecha y hora para tu sesión de <strong>{service.title}</strong>.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>1. Selecciona el Día</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
                        {nextDays.length === 0 ? (
                            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No hay días disponibles en el futuro cercano.</p>
                        ) : (
                            nextDays.map((day, i) => {
                                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(day)}
                                        style={{
                                            minWidth: '80px', padding: '1rem', borderRadius: '12px',
                                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                            background: isSelected ? 'rgba(213, 189, 169, 0.2)' : 'transparent',
                                            color: 'var(--foreground)', cursor: 'pointer', display: 'flex',
                                            flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                            {format(day, 'EEEE', { locale: es }).substring(0, 3)}
                                        </span>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {format(day, 'd')}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {selectedDate && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>2. Selecciona la Hora</h3>
                            {loadingSlots ? (
                                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Buscando espacios en el calendario...</p>
                            ) : availableTimes.length === 0 ? (
                                <p style={{ opacity: 0.7, fontSize: '0.9rem', color: '#888' }}>No hay espacios libres este día.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.8rem' }}>
                                    {availableTimes.map((time, i) => {
                                        const isSelected = selectedTime === time;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedTime(time)}
                                                style={{
                                                    padding: '0.8rem', borderRadius: '8px',
                                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                                    background: isSelected ? 'var(--primary)' : 'transparent',
                                                    color: isSelected ? 'white' : 'var(--foreground)',
                                                    cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleProceedToPay}
                        className={styles.submitBtn}
                        style={{
                            width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            opacity: (selectedDate && selectedTime && !creatingEvent) ? 1 : 0.5,
                            cursor: (selectedDate && selectedTime && !creatingEvent) ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!selectedDate || !selectedTime || creatingEvent}
                    >
                        {creatingEvent ? 'Bloqueando Cupo...' : 'Separar Cupo y Pagar'}
                    </button>
                    <p style={{ opacity: 0.6, fontSize: '0.8rem', textAlign: 'center' }}>
                        Aseguraremos este horario mientras completas el pago seguro en el último paso.
                    </p>
                </div>
            </div>
        </div>
    );
}
