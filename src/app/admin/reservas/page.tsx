'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Sparkles, 
  Calendar, 
  Ticket, 
  Tag, 
  Settings, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  Users,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// --- ESTILOS PROFESIONALES (TIPO CRM/SAAS) ---
const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#0a0510', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '260px', background: '#160d26', borderRight: '1px solid rgba(212, 175, 55, 0.2)', padding: '1.5rem', display: 'flex', flexDirection: 'column' as const, position: 'fixed' as const, height: '100vh', zIndex: 50 },
    main: { flex: 1, marginLeft: '260px', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    
    navItem: (active: boolean) => ({
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
        background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
        color: active ? '#d4af37' : '#a0aec0',
        fontWeight: active ? '600' : '400',
        marginBottom: '4px'
    }),

    statCard: { background: 'linear-gradient(145deg, #1f1433, #160d26)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)', position: 'relative' as const, overflow: 'hidden' as const },
    itemCard: { background: '#1f1433', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', marginBottom: '1rem' },
    
    badge: (type: string) => ({
        padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' as const,
        background: type === 'service' ? '#7e57c222' : '#d4af3722',
        color: type === 'service' ? '#b39ddb' : '#d4af37',
        border: `1px solid ${type === 'service' ? '#7e57c244' : '#d4af3744'}`
    }),

    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', transition: 'border 0.2s' },
    buttonPrimary: { background: '#d4af37', color: '#0a0510', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    buttonIcon: { background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
    
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { background: '#160d26', width: '90%', maxWidth: '600px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', maxHeight: '90vh', overflowY: 'auto' as const }
};

type TabType = 'dashboard' | 'ventas' | 'agenda' | 'disponibilidad' | 'servicios' | 'productos' | 'sorteos' | 'promos' | 'mensajeria' | 'config';

export default function AdminCRM() {
    const { data: session, status } = useSession();
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const authenticated = demoMode || status === 'authenticated';

    const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // --- DATOS REAL-TIME ---
    const [data, setData] = useState<any>({ 
        services: [], 
        products: [], 
        raffles: [], 
        promos: [], 
        pendingSales: [], 
        confirmedSales: [],
        mailTemplates: [],
        settings: { workDays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00', slotDurationMinutes: 60, blockedDates: [] }
    });
    
    const [newBlockedDate, setNewBlockedDate] = useState('');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [formItem, setFormItem] = useState<any>({});

    useEffect(() => {
        if (!authenticated) return;

        const subs = [
            onSnapshot(collection(db, 'services'), snap => setData((prev: any) => ({ ...prev, services: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))),
            onSnapshot(collection(db, 'products'), snap => setData((prev: any) => ({ ...prev, products: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))),
            onSnapshot(collection(db, 'raffles'), snap => setData((prev: any) => ({ ...prev, raffles: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))),
            onSnapshot(collection(db, 'promotions'), snap => setData((prev: any) => ({ ...prev, promos: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))),
            onSnapshot(collection(db, 'mail_templates'), snap => setData((prev: any) => ({ ...prev, mailTemplates: snap.docs.map(d => ({ id: d.id, ...d.data() })) }))),
            onSnapshot(doc(db, 'settings', 'availability'), (docSnap) => {
                if (docSnap.exists()) {
                    setData((prev: any) => ({ ...prev, settings: docSnap.data() }));
                }
            })
        ];

        void fetchVentasYAgenda();
        return () => subs.forEach(unsub => unsub());
    }, [authenticated]);

    // --- LOGICA DE MENSAJERIA ---
    const updateMailTemplate = async (id: string, body: string, subject: string) => {
        setProcessing(true);
        try {
            await updateDoc(doc(db, 'mail_templates', id), { body, subject });
            alert('¡Hechizo de correo actualizado!');
        } catch (err) {
            alert('Error al actualizar plantilla.');
        } finally {
            setProcessing(false);
        }
    };

    const fetchVentasYAgenda = async () => {
        setLoading(true);
        try {
            const [resVentas, resAgenda] = await Promise.all([
                fetch('/api/admin/reservas'),
                fetch('/api/admin/calendar')
            ]);
            const dataVentas = await resVentas.json();
            const dataAgenda = await resAgenda.json();
            
            setData((prev: any) => ({
                ...prev,
                pendingSales: dataVentas.events || [],
                confirmedSales: dataAgenda.events || []
            }));
        } catch (error) {
            console.error("Error cargando agenda:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReserva = async (eventId: string) => {
        if (!confirm('¿Aprobar pago y confirmar cita en el calendario?')) return;
        setProcessing(true);
        try {
            const res = await fetch('/api/admin/approve-reserva', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId })
            });
            if (res.ok) {
                alert('¡Cita consagrada y confirmada!');
                void fetchVentasYAgenda();
            }
        } catch (error) {
            alert('Error al aprobar.');
        } finally {
            setProcessing(false);
        }
    };

    const runManualCleanup = async () => {
        if (!confirm('¿Activar bot de limpieza? Se borrarán reservas pendientes de más de 30 min.')) return;
        setProcessing(true);
        try {
            const res = await fetch('/api/cron/cleanup');
            const result = await res.json();
            alert(result.message || 'Limpieza completada.');
            void fetchVentasYAgenda();
        } catch (error) {
            alert('Error en el bot.');
        } finally {
            setProcessing(false);
        }
    };

    // --- LOGICA DE GESTION ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const col = currentTab === 'sorteos' ? 'raffles' : currentTab === 'promos' ? 'promotions' : currentTab;
        
        try {
            if (editingItem) {
                await updateDoc(doc(db, col, editingItem.id), formItem);
            } else {
                await addDoc(collection(db, col), { ...formItem, createdAt: serverTimestamp() });
            }
            setShowModal(false);
            setEditingItem(null);
            setFormItem({});
        } catch (err) {
            alert('Error al guardar: ' + err);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string, col: string) => {
        if (confirm('¿Eliminar este elemento del universo?')) {
            await deleteDoc(doc(db, col, id));
        }
    };

    const generatePromoCode = () => {
        const codes = ['LUNA', 'ASTRO', 'DESTINO', 'MAGIA', 'SUERTE'];
        const random = Math.floor(Math.random() * 999);
        setFormItem({ ...formItem, code: `${codes[Math.floor(Math.random() * codes.length)]}${random}` });
    };

    if (!authenticated) return (
        <div style={{ ...styles.layout, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#160d26', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #d4af37' }}>
                <Sparkles size={48} color="#d4af37" style={{ marginBottom: '1rem' }} />
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>El Nexo Admin</h1>
                <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Portal de gestión del Oráculo</p>
                <button onClick={() => signIn('google')} style={{ ...styles.buttonPrimary, width: '100%', justifyContent: 'center' }}>Entrar al Centro de Control</button>
            </div>
        </div>
    );

    return (
        <div style={styles.layout}>
            {/* SIDEBAR CRM */}
            <aside style={styles.sidebar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', padding: '0 10px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#d4af37', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles color="#0a0510" size={24} />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '0.5px' }}>EL NEXO</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <div style={styles.navItem(currentTab === 'dashboard')} onClick={() => setCurrentTab('dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
                    <div style={styles.navItem(currentTab === 'ventas')} onClick={() => setCurrentTab('ventas')}><ShoppingCart size={20} /> Ventas</div>
                    <div style={styles.navItem(currentTab === 'agenda')} onClick={() => setCurrentTab('agenda')}><Calendar size={20} /> Agenda</div>
                    <div style={styles.navItem(currentTab === 'disponibilidad')} onClick={() => setCurrentTab('disponibilidad')}><Settings size={20} /> Disponibilidad</div>
                    
                    <div style={{ margin: '1.5rem 0 0.8rem 1rem', fontSize: '0.75rem', color: '#4a5568', fontWeight: 'bold', textTransform: 'uppercase' }}>Catálogo Místico</div>
                    <div style={styles.navItem(currentTab === 'servicios')} onClick={() => setCurrentTab('servicios')}><Sparkles size={20} /> Servicios</div>
                    <div style={styles.navItem(currentTab === 'productos')} onClick={() => setCurrentTab('productos')}><ShoppingCart size={20} /> Bazar</div>
                    <div style={styles.navItem(currentTab === 'sorteos')} onClick={() => setCurrentTab('sorteos')}><Ticket size={20} /> Sorteos</div>
                    <div style={styles.navItem(currentTab === 'promos')} onClick={() => setCurrentTab('promos')}><Tag size={20} /> Promociones</div>
                    <div style={styles.navItem(currentTab === 'mensajeria')} onClick={() => setCurrentTab('mensajeria')}><Sparkles size={20} /> Mensajería</div>
                    
                    <div style={{ margin: '1.5rem 0 0.8rem 1rem', fontSize: '0.75rem', color: '#4a5568', fontWeight: 'bold', textTransform: 'uppercase' }}>Sistema</div>
                    <div style={styles.navItem(currentTab === 'config')} onClick={() => setCurrentTab('config')}><Settings size={20} /> Configuración</div>
                </nav>

                <button onClick={() => signOut()} style={{ ...styles.navItem(false), border: 'none', width: '100%', background: 'transparent', marginTop: 'auto' }}><LogOut size={20} /> Cerrar Sesión</button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{currentTab === 'dashboard' ? 'Oráculo de Control' : currentTab}</h1>
                        <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Bienvenido de nuevo, Maestro del Destino.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input placeholder="Buscar en el cosmos..." style={{ ...styles.input, width: '240px', paddingLeft: '40px', fontSize: '0.85rem' }} />
                        </div>
                        {['servicios', 'productos', 'sorteos', 'promos'].includes(currentTab) && (
                            <button onClick={() => { setEditingItem(null); setFormItem({}); setShowModal(true); }} style={styles.buttonPrimary}><Plus size={20} /> Nuevo {currentTab.slice(0,-1)}</button>
                        )}
                    </div>
                </header>

                {/* DASHBOARD WIDGETS */}
                {currentTab === 'dashboard' && (
                    <>
                        <div style={styles.oracleContainer}>
                            <div style={styles.statCard}>
                                <TrendingUp size={24} color="#d4af37" style={{ marginBottom: '1rem' }} />
                                <div style={styles.oracleLabel}>Ventas Totales</div>
                                <div style={styles.oracleValue}>$2.450.000</div>
                                <div style={{ fontSize: '0.75rem', color: '#48bb78' }}>+12% vs mes anterior</div>
                            </div>
                            <div style={styles.statCard}>
                                <Users size={24} color="#d4af37" style={{ marginBottom: '1rem' }} />
                                <div style={styles.oracleLabel}>Almas Atendidas</div>
                                <div style={styles.oracleValue}>156</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Clientes este mes</div>
                            </div>
                            <div style={styles.statCard}>
                                <Ticket size={24} color="#d4af37" style={{ marginBottom: '1rem' }} />
                                <div style={styles.oracleLabel}>Tickets Rifa</div>
                                <div style={styles.oracleValue}>84</div>
                                <div style={{ fontSize: '0.75rem', color: '#d4af37' }}>3 Sorteos activos</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
                            <div style={{ background: '#160d26', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCw size={20} color="#d4af37" /> Actividad Reciente</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[1,2,3].map(i => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Venta de Producto: Kit Purificación</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Hace 15 minutos</div>
                                            </div>
                                            <div style={{ color: '#48bb78', fontWeight: 'bold' }}>+$65.000</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#160d26', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Estatus Agenda</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <CheckCircle2 size={24} color="#48bb78" />
                                        <div><div style={{ fontWeight: 'bold' }}>12</div><div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Confirmadas hoy</div></div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <AlertCircle size={24} color="#f6ad55" />
                                        <div><div style={{ fontWeight: 'bold' }}>5</div><div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Pendientes pago</div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* VENTAS PENDIENTES (RESERVAS) */}
                {currentTab === 'ventas' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.pendingSales.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No hay ventas pendientes de validación.</div>
                        ) : (
                            data.pendingSales.map((sale: any) => (
                                <div key={sale.id} style={styles.itemCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                <span style={styles.badge('product')}>PENDIENTE PAGO</span>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(sale.start).toLocaleString()}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{sale.summary}</h3>
                                            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '4px' }}>{sale.description?.split('---')[0]}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleApproveReserva(sale.id)}
                                            style={styles.buttonPrimary}
                                            disabled={processing}
                                        >
                                            <CheckCircle2 size={18} /> Confirmar Pago
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* AGENDA CONFIRMADA */}
                {currentTab === 'agenda' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.confirmedSales.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No tienes citas programadas para el futuro.</div>
                        ) : (
                            data.confirmedSales.map((event: any) => (
                                <div key={event.id} style={{ ...styles.itemCard, borderLeft: '4px solid #48bb78' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#48bb78', fontWeight: 'bold' }}>CONFIRMADA</span>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '4px' }}>{event.summary}</h3>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Cliente: {event.clientEmail || 'No disponible'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: '#d4af37' }}>{new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(event.start).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* DISPONIBILIDAD Y HORARIOS */}
                {currentTab === 'disponibilidad' && (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ ...styles.itemCard, marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={24} color="#d4af37" /> Reglas de Tiempo</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#d4af37', marginBottom: '1rem' }}>Días Laborales</h4>
                                    {[
                                        {id: 1, n: 'Lunes'}, {id: 2, n: 'Martes'}, {id: 3, n: 'Miércoles'}, 
                                        {id: 4, n: 'Jueves'}, {id: 5, n: 'Viernes'}, {id: 6, n: 'Sábado'}, {id: 0, n: 'Domingo'}
                                    ].map(day => (
                                        <label key={day.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={data.settings.workDays.includes(day.id)} onChange={() => toggleWorkDay(day.id)} />
                                            <span style={{ fontSize: '0.9rem' }}>{day.n}</span>
                                        </label>
                                    ))}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#d4af37', marginBottom: '1rem' }}>Rango de Energía (Horas)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Inicio Jornada:
                                            <input type="time" style={styles.input} value={data.settings.startTime} onChange={e => setData((prev: any) => ({ ...prev, settings: { ...prev.settings, startTime: e.target.value } }))} />
                                        </label>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Fin Jornada:
                                            <input type="time" style={styles.input} value={data.settings.endTime} onChange={e => setData((prev: any) => ({ ...prev, settings: { ...prev.settings, endTime: e.target.value } }))} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.itemCard}>
                            <h3 style={{ marginBottom: '1.5rem', color: '#ff6b6b' }}>Bloqueo Astral (Días Off)</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>Selecciona fechas específicas donde NO quieres recibir ninguna cita (Vacaciones, Festivos, Retiros).</p>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                                <input type="date" style={{ ...styles.input, flex: 1 }} value={newBlockedDate} onChange={e => setNewBlockedDate(e.target.value)} />
                                <button onClick={addBlockedDate} style={styles.buttonPrimary}>Bloquear Día</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.settings.blockedDates?.map((date: string) => (
                                    <div key={date} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {date}
                                        <Trash2 size={14} style={{ cursor: 'pointer' }} onClick={() => removeBlockedDate(date)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={saveAvailability} style={{ ...styles.buttonPrimary, width: '100%', marginTop: '2rem', justifyContent: 'center', height: '55px', fontSize: '1.1rem' }} disabled={processing}>
                            {processing ? 'Sincronizando con el Cosmos...' : 'Consagrar Cambios de Agenda'}
                        </button>
                    </div>
                )}

                {/* MENSAJERÍA Y PLANTILLAS */}
                {currentTab === 'mensajeria' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {data.mailTemplates.length === 0 ? (
                            <div style={styles.itemCard}>
                                <h3 style={{ marginBottom: '1rem' }}>Inicializar Mensajería</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>No se encontraron plantillas. Debes crear los documentos 'reserva_pendiente', 'pago_confirmado' y 'rifa_reservada' en la colección 'mail_templates' de Firebase.</p>
                            </div>
                        ) : (
                            data.mailTemplates.map((template: any) => (
                                <div key={template.id} style={styles.itemCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ color: '#d4af37', textTransform: 'uppercase', fontSize: '1rem' }}>{template.id.replace('_', ' ')}</h3>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Variables disponibles: {'{cliente}, {servicio}, {fecha}, {monto}'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Asunto del Correo:
                                            <input 
                                                style={styles.input} 
                                                value={template.subject} 
                                                onChange={e => {
                                                    const newData = data.mailTemplates.map((t: any) => t.id === template.id ? {...t, subject: e.target.value} : t);
                                                    setData((prev: any) => ({...prev, mailTemplates: newData}));
                                                }}
                                            />
                                        </label>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Cuerpo del Mensaje (HTML permitido):
                                            <textarea 
                                                style={{ ...styles.input, height: '200px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                                                value={template.body} 
                                                onChange={e => {
                                                    const newData = data.mailTemplates.map((t: any) => t.id === template.id ? {...t, body: e.target.value} : t);
                                                    setData((prev: any) => ({...prev, mailTemplates: newData}));
                                                }}
                                            />
                                        </label>
                                        <button 
                                            onClick={() => updateMailTemplate(template.id, template.body, template.subject)} 
                                            style={{ ...styles.buttonPrimary, width: '200px', alignSelf: 'flex-end' }}
                                            disabled={processing}
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* CONFIGURACIÓN Y BOT DE LIMPIEZA */}
                {currentTab === 'config' && (
                    <div style={{ maxWidth: '600px' }}>
                        <div style={styles.itemCard}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCw size={20} color="#d4af37" /> Mantenimiento del Oráculo</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
                                El Bot de Limpieza libera automáticamente los espacios de reservas que no reportaron pago en 30 minutos.
                            </p>
                            <button onClick={runManualCleanup} style={{ ...styles.buttonPrimary, background: '#2d3748', color: 'white' }} disabled={processing}>
                                <RefreshCw size={18} className={processing ? 'animate-spin' : ''} /> Ejecutar Limpieza Manual Ahora
                            </button>
                        </div>
                        
                        <div style={{ ...styles.itemCard, marginTop: '2rem', opacity: 0.5 }}>
                            <h3 style={{ marginBottom: '1rem' }}><Settings size={20} /> Ajustes de Sistema</h3>
                            <p style={{ fontSize: '0.8rem' }}>Versión del Nexo: 2.0.0 (Estelar)<br/>Base de Datos: Firebase Firestore<br/>Agenda: Google Calendar API</p>
                        </div>
                    </div>
                )}

                {/* LISTADOS CRM */}
                {['servicios', 'productos', 'sorteos', 'promos'].includes(currentTab) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {(currentTab === 'servicios' ? data.services : currentTab === 'productos' ? data.products : currentTab === 'sorteos' ? data.raffles : data.promos).map((item: any) => (
                            <div key={item.id} style={styles.itemCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={styles.badge(currentTab === 'servicios' ? 'service' : 'product')}>{currentTab === 'sorteos' ? 'RIFA' : currentTab.toUpperCase().slice(0,-1)}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { setEditingItem(item); setFormItem(item); setShowModal(true); }} style={styles.buttonIcon} title="Editar"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(item.id, currentTab === 'sorteos' ? 'raffles' : currentTab === 'promos' ? 'promotions' : currentTab)} style={{ ...styles.buttonIcon, color: '#ff6b6b' }} title="Eliminar"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{item.title || item.code}</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem', lineHeight: 1.5 }}>{item.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d4af37' }}>{item.price || `${item.priceNumber}% OFF`}</span>
                                    {currentTab === 'sorteos' && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Ventas: {item.soldNumbers?.length || 0}/{item.totalNumbers}</span>}
                                    {currentTab === 'promos' && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>CÓDIGO: <strong style={{color:'#d4af37'}}>{item.code}</strong></span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL DE EDICIÓN / CREACIÓN PRO */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }} className="gradient-text">
                            {editingItem ? `Editar ${currentTab.slice(0,-1)}` : `Invocar Nuevo ${currentTab.slice(0,-1)}`}
                        </h2>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>Título / Nombre</label>
                                    <input required style={styles.input} value={formItem.title || ''} onChange={e => setFormItem({...formItem, title: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>{currentTab === 'promos' ? 'Código' : 'Precio Visible'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input required style={styles.input} placeholder={currentTab === 'promos' ? 'ASTRO10' : '$35.000 COP'} value={formItem.price || formItem.code || ''} onChange={e => setFormItem({...formItem, [currentTab === 'promos' ? 'code' : 'price']: e.target.value})} />
                                        {currentTab === 'promos' && <button type="button" onClick={generatePromoCode} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer' }}><RefreshCw size={18} /></button>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>Descripción Detallada</label>
                                <textarea required style={{ ...styles.input, height: '100px', fontFamily: 'inherit' }} value={formItem.description || ''} onChange={e => setFormItem({...formItem, description: e.target.value})} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>{currentTab === 'promos' ? 'Descuento (%)' : 'Valor Numérico'}</label>
                                    <input required type="number" style={styles.input} value={formItem.priceNumber || ''} onChange={e => setFormItem({...formItem, priceNumber: parseInt(e.target.value) || 0})} />
                                </div>
                                {currentTab === 'sorteos' && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>Total Números</label>
                                        <select style={styles.input} value={formItem.totalNumbers || 100} onChange={e => setFormItem({...formItem, totalNumbers: parseInt(e.target.value)})}>
                                            <option value={100}>100 (Dos Cifras)</option>
                                            <option value={1000}>1000 (Tres Cifras)</option>
                                        </select>
                                    </div>
                                )}
                                {currentTab === 'promos' && (
                                    <div>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '6px', display: 'block' }}>Aplicable a</label>
                                        <select style={styles.input} value={formItem.applicableTo || 'all'} onChange={e => setFormItem({...formItem, applicableTo: e.target.value})}>
                                            <option value="all">Todo el Catálogo</option>
                                            <option value="services">Solo Servicios</option>
                                            <option value="products">Solo Productos</option>
                                            <option value="raffles">Solo Rifas</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.buttonIcon, padding: '12px', flex: 1 }}>Cancelar</button>
                                <button type="submit" style={{ ...styles.buttonPrimary, flex: 2, justifyContent: 'center' }} disabled={processing}>
                                    {processing ? 'Sincronizando...' : editingItem ? 'Actualizar Cosmos' : 'Inmortalizar Elemento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
