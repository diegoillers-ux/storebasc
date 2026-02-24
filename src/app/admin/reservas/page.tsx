'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const styles = {
    container: { minHeight: '100vh', background: '#f5f0ec', color: '#333', fontFamily: 'sans-serif', padding: '2rem' },
    header: { textAlign: 'center' as const, marginBottom: '2rem' },
    card: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1rem', borderLeft: '5px solid #E8CAED' },
    cardConfirmed: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1rem', borderLeft: '5px solid #a4c9b3' },
    cardSettings: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1rem', borderTop: '5px solid #D5BDA9' },
    button: { background: '#D5BDA9', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const, transition: '0.2s' },
    buttonSecondary: { background: '#a4c9b3', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const },
    loginBox: { background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', margin: '10vh auto', textAlign: 'center' as const, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' },
    tabs: { display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' as const },
    tabActive: { padding: '0.8rem 1.5rem', borderRadius: '8px', background: '#D5BDA9', color: 'white', fontWeight: 'bold' as const, cursor: 'pointer', border: 'none' },
    tabInactive: { padding: '0.8rem 1.5rem', borderRadius: '8px', background: '#ebdcd0', color: '#555', cursor: 'pointer', border: 'none' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' },
    grid2Col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }
};

type PendingEvent = { id: string; summary: string; description: string; start: string; end: string; };
type ConfirmedEvent = { id: string; summary: string; start: string; end: string; location: string; description: string; clientEmail: string; };
type Settings = { workDays: number[]; startTime: string; endTime: string; slotDurationMinutes: number; blockedDates: string[]; };

const DAYS_OF_WEEK = [
    { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miercoles' },
    { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sabado' }, { id: 0, name: 'Domingo' }
];

export default function AdminReservas() {
    const { data: session, status } = useSession();
    const authenticated = status === 'authenticated';

    const [currentTab, setCurrentTab] = useState<'pendientes' | 'agenda' | 'settings'>('pendientes');
    const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
    const [confirmedEvents, setConfirmedEvents] = useState<ConfirmedEvent[]>([]);
    const [settings, setSettings] = useState<Settings>({ workDays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00', slotDurationMinutes: 60, blockedDates: [] });
    const [newBlockedDate, setNewBlockedDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [meetLinks, setMeetLinks] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (authenticated) {
            if (currentTab === 'pendientes') void fetchPendingEvents();
            if (currentTab === 'agenda') void fetchConfirmedEvents();
            if (currentTab === 'settings') void fetchSettings();
        }
    }, [currentTab, authenticated]);

    const fetchPendingEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reservas');
            const data = await res.json();
            if (data.events) setPendingEvents(data.events);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfirmedEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/calendar');
            const data = await res.json();
            if (data.events) {
                setConfirmedEvents(data.events);
                const links: { [key: string]: string } = {};
                data.events.forEach((ev: ConfirmedEvent) => { links[ev.id] = ev.location || ''; });
                setMeetLinks(links);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.settings) setSettings(data.settings);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId: string) => {
        if (!confirm('Aprobar pago y enviar confirmacion al cliente?')) return;
        setProcessingId(eventId);
        try {
            const res = await fetch('/api/admin/approve-reserva', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId })
            });
            const data = await res.json();
            if (res.ok) {
                if (data?.meetingLink) {
                    alert('Cita aprobada. Meet generado automaticamente.');
                } else if (data?.warning) {
                    alert(`Cita aprobada. ${data.warning}`);
                } else {
                    alert('Cita aprobada.');
                }
                setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
            } else {
                alert(data?.details || data?.error || 'Error al aprobar');
            }
        } catch {
            alert('Error de conexion.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveMeet = async (event: ConfirmedEvent) => {
        const link = meetLinks[event.id];
        if (!link) return alert('Escribe un enlace valido.');
        if (!confirm('Enviar enlace por correo?')) return;
        setProcessingId(event.id);
        const parts = event.summary.split(' - ');
        try {
            const res = await fetch('/api/admin/update-meet', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id, meetLink: link, clientEmail: event.clientEmail,
                    clientName: parts[1] || 'Cliente', serviceName: parts[0] || 'Sesion',
                    dateStr: new Date(event.start).toLocaleString('es-CO')
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Enviado.');
            } else {
                alert(data?.details || data?.error || 'Error al enviar.');
            }
        } catch {
            alert('Error de conexion.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleGenerateMeet = async (event: ConfirmedEvent) => {
        if (!confirm('Generar enlace de Google Meet y enviarlo al cliente?')) return;
        setProcessingId(event.id);
        const parts = event.summary.split(' - ');
        try {
            const res = await fetch('/api/admin/update-meet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    generateMeet: true,
                    clientEmail: event.clientEmail,
                    clientName: parts[1] || 'Cliente',
                    serviceName: parts[0] || 'Sesion',
                    dateStr: new Date(event.start).toLocaleString('es-CO'),
                }),
            });

            const data = await res.json();
            if (res.ok && data?.meetingLink) {
                setMeetLinks((prev) => ({ ...prev, [event.id]: data.meetingLink }));
                alert('Meet generado y enviado.');
            } else {
                alert(data?.details || data?.error || 'Error al generar Meet.');
            }
        } catch {
            alert('Error de conexion.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveSettings = async () => {
        if (settings.startTime >= settings.endTime) {
            alert('La hora de fin debe ser mayor a la hora de inicio. Ejemplo: 09:00 a 12:00 (mediodia) o 09:00 a 18:00.');
            return;
        }

        setProcessingId('settings');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            if (res.ok) alert('Horario guardado en Google Calendar.');
            else alert('Hubo un error al guardar.');
        } catch {
            alert('Error de conexion.');
        } finally {
            setProcessingId(null);
        }
    };

    const toggleWorkDay = (dayId: number) => {
        setSettings((prev) => {
            const days = prev.workDays.includes(dayId)
                ? prev.workDays.filter((d) => d !== dayId)
                : [...prev.workDays, dayId];
            return { ...prev, workDays: days };
        });
    };

    const addBlockedDate = () => {
        if (!newBlockedDate) return;
        if (!settings.blockedDates.includes(newBlockedDate)) {
            setSettings((prev) => ({ ...prev, blockedDates: [...prev.blockedDates, newBlockedDate] }));
        }
        setNewBlockedDate('');
    };

    const removeBlockedDate = (date: string) => {
        setSettings((prev) => ({ ...prev, blockedDates: prev.blockedDates.filter((d) => d !== date) }));
    };

    if (status === 'loading') {
        return (
            <div style={{ ...styles.container, display: 'grid', placeItems: 'center' }}>
                <p>Validando sesion...</p>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div style={{ ...styles.container, display: 'flex' }}>
                <div style={styles.loginBox}>
                    <h2 style={{ marginBottom: '1rem', color: '#D5BDA9' }}>Acceso Admin</h2>
                    <p style={{ opacity: 0.7, marginBottom: '1rem' }}>Inicia sesion con Google para continuar.</p>
                    <button
                        type="button"
                        style={{ ...styles.button, width: '100%' }}
                        onClick={() => signIn('google', { callbackUrl: '/admin/reservas' })}
                    >
                        Entrar con Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ color: '#D5BDA9', marginBottom: '0.5rem' }}>Panel de Administracion</h1>
                <p style={{ opacity: 0.7, marginBottom: '0.8rem' }}>{session?.user?.email}</p>
                <button
                    type="button"
                    style={styles.tabInactive}
                    onClick={() => signOut({ callbackUrl: '/admin/reservas' })}
                >
                    Cerrar sesion
                </button>
            </div>

            <div style={styles.tabs}>
                <button style={currentTab === 'pendientes' ? styles.tabActive : styles.tabInactive} onClick={() => setCurrentTab('pendientes')}>
                    Pagos Pendientes ({pendingEvents.length})
                </button>
                <button style={currentTab === 'agenda' ? styles.tabActive : styles.tabInactive} onClick={() => setCurrentTab('agenda')}>
                    Agenda Confirmada
                </button>
                <button style={currentTab === 'settings' ? styles.tabActive : styles.tabInactive} onClick={() => setCurrentTab('settings')}>
                    Horario Base
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Cargando datos...</p>
                ) : currentTab === 'pendientes' ? (
                    pendingEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', opacity: 0.6 }}>
                            <h3>No hay pagos pendientes</h3>
                        </div>
                    ) : (
                        pendingEvents.map((event) => (
                            <div key={event.id} style={styles.card}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#D5BDA9' }}>{event.summary}</h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                                    <strong>Fecha:</strong> {new Date(event.start).toLocaleString('es-CO')}<br /><br />{event.description}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleApprove(event.id)} style={{ ...styles.button, opacity: processingId === event.id ? 0.5 : 1 }} disabled={processingId === event.id}>
                                        {processingId === event.id ? 'Aprobando...' : 'Aprobar Transferencia'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                ) : currentTab === 'agenda' ? (
                    confirmedEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', opacity: 0.6 }}>
                            <h3>No hay citas confirmadas futuras</h3>
                        </div>
                    ) : (
                        confirmedEvents.map((event) => (
                            <div key={event.id} style={styles.cardConfirmed}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#a4c9b3' }}>{event.summary}</h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
                                    <strong>Dia:</strong> {new Date(event.start).toLocaleString('es-CO')}<br />
                                    <strong>Email Cliente:</strong> {event.clientEmail || 'No registrado'}<br />
                                </div>
                                <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Link de Google Meet / Zoom:</p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" placeholder="Pega aqui el enlace..." value={meetLinks[event.id] || ''} onChange={(e) => setMeetLinks({ ...meetLinks, [event.id]: e.target.value })} style={{ ...styles.input, marginBottom: 0, flex: 1 }} />
                                        <button
                                            onClick={() => handleGenerateMeet(event)}
                                            disabled={processingId === event.id}
                                            style={{ ...styles.tabInactive, opacity: processingId === event.id ? 0.5 : 1 }}
                                        >
                                            Generar Meet
                                        </button>
                                        <button onClick={() => handleSaveMeet(event)} disabled={processingId === event.id} style={{ ...styles.buttonSecondary, opacity: processingId === event.id ? 0.5 : 1 }}>
                                            {processingId === event.id ? 'Enviando...' : 'Enviar Cliente'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    <div style={styles.cardSettings}>
                        <h2 style={{ color: '#D5BDA9', marginBottom: '1.5rem' }}>Reglas de Disponibilidad</h2>
                        <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Nota: Estos horarios se cruzaran con tu Calendar. Si pones que trabajas a las 10am, pero creaste un evento de 10am a 11am, la pagina ocultara la hora automaticamente.
                        </p>

                        <div style={styles.grid2Col}>
                            <div>
                                <strong>Dias Laborales</strong>
                                <div style={{ marginTop: '0.8rem' }}>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <label key={day.id} style={styles.checkboxLabel}>
                                            <input type="checkbox" checked={settings.workDays.includes(day.id)} onChange={() => toggleWorkDay(day.id)} />
                                            {day.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <strong>Horario Fijo Base</strong>
                                <p style={{ opacity: 0.7, marginTop: '0.4rem', marginBottom: '0.8rem', fontSize: '0.82rem' }}>
                                    Tip: 12:00 a. m. = medianoche (00:00). 12:00 p. m. = mediodia (12:00).
                                </p>
                                <div style={{ marginTop: '0.8rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Hora Inicio Jornada:
                                        <input type="time" value={settings.startTime} onChange={(e) => setSettings({ ...settings, startTime: e.target.value })} style={{ ...styles.input, marginTop: '0.3rem' }} />
                                    </label>
                                    <label style={{ display: 'block', fontSize: '0.9rem' }}>
                                        Hora Fin Jornada:
                                        <input type="time" value={settings.endTime} onChange={(e) => setSettings({ ...settings, endTime: e.target.value })} style={{ ...styles.input, marginTop: '0.3rem' }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />

                        <div>
                            <strong>Bloqueo Manual de Fechas (Vacaciones / Festivos)</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', maxWidth: '300px' }}>
                                <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} style={{ ...styles.input, marginBottom: 0 }} />
                                <button onClick={addBlockedDate} style={styles.buttonSecondary}>Anadir</button>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {settings.blockedDates.map((date) => (
                                    <span key={date} style={{ background: '#ffeeee', color: '#ff6b6b', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {date}
                                        <button onClick={() => removeBlockedDate(date)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
                                    </span>
                                ))}
                                {settings.blockedDates.length === 0 && <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>Ninguna fecha bloqueada.</span>}
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <button onClick={handleSaveSettings} disabled={processingId === 'settings'} style={{ ...styles.button, width: '100%', fontSize: '1.1rem' }}>
                                {processingId === 'settings' ? 'Guardando en Calendario...' : 'Guardar Configuracion en Google'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
