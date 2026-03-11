'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    LayoutDashboard,
    LogOut,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Settings,
    ShoppingCart,
    Sparkles,
    Tag,
    Ticket,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';

import { db } from '@/lib/firebase';
import adminStyles from './page.module.css';

type TabType = 'dashboard' | 'ventas' | 'agenda' | 'disponibilidad' | 'servicios' | 'productos' | 'sorteos' | 'promos' | 'mensajeria' | 'config';

type SettingsState = {
    workDays: number[];
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    blockedDates: string[];
};

type CatalogItem = {
    id: string;
    title?: string;
    description?: string;
    price?: string;
    priceNumber?: number;
    icon?: string;
    imagePlaceholder?: string;
    code?: string;
    applicableTo?: string;
    totalNumbers?: number;
    soldNumbers?: number[];
    active?: boolean;
    createdAt?: unknown;
};

type CatalogFormItem = Partial<CatalogItem> & {
    soldNumbersInput?: string;
};

type SaleRecord = {
    id: string;
    summary: string;
    description: string;
    previewDescription: string;
    status: string;
    createdAt: string;
    start: string;
    end: string;
    location: string;
    saleType: string;
    saleTypeLabel: string;
    itemId: string;
    itemTitle: string;
    amountLabel: string;
    amountNumber: number;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    reservationCode: string;
    selectedNumber: string;
    requiresScheduling: boolean;
    scheduledDateLabel: string;
    paymentReported: boolean;
    paymentNote: string;
    paymentProofUrl: string;
    paymentReportedAt: string;
};

type MailTemplate = {
    id: string;
    subject: string;
    body: string;
};

type DashboardState = {
    services: CatalogItem[];
    products: CatalogItem[];
    raffles: CatalogItem[];
    promos: CatalogItem[];
    pendingSales: SaleRecord[];
    confirmedSales: SaleRecord[];
    mailTemplates: MailTemplate[];
    settings: SettingsState;
};

const DEFAULT_SETTINGS: SettingsState = {
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    blockedDates: [],
};

const INITIAL_STATE: DashboardState = {
    services: [],
    products: [],
    raffles: [],
    promos: [],
    pendingSales: [],
    confirmedSales: [],
    mailTemplates: [],
    settings: DEFAULT_SETTINGS,
};

const dayOptions = [
    { id: 1, label: 'Lunes', short: 'L' },
    { id: 2, label: 'Martes', short: 'M' },
    { id: 3, label: 'Miercoles', short: 'X' },
    { id: 4, label: 'Jueves', short: 'J' },
    { id: 5, label: 'Viernes', short: 'V' },
    { id: 6, label: 'Sabado', short: 'S' },
    { id: 0, label: 'Domingo', short: 'D' },
];

const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'General' },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, section: 'General' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, section: 'General' },
    { id: 'disponibilidad', label: 'Disponibilidad', icon: Settings, section: 'General' },
    { id: 'servicios', label: 'Servicios', icon: Sparkles, section: 'Catalogo' },
    { id: 'productos', label: 'Productos', icon: ShoppingCart, section: 'Catalogo' },
    { id: 'sorteos', label: 'Rifas', icon: Ticket, section: 'Catalogo' },
    { id: 'promos', label: 'Promociones', icon: Tag, section: 'Catalogo' },
    { id: 'mensajeria', label: 'Mensajeria', icon: Sparkles, section: 'Operacion' },
    { id: 'config', label: 'Sistema', icon: Settings, section: 'Operacion' },
] as const;

function getCollectionName(tab: TabType) {
    if (tab === 'servicios') return 'services';
    if (tab === 'productos') return 'products';
    if (tab === 'sorteos') return 'raffles';
    if (tab === 'promos') return 'promotions';
    return tab;
}

function currencyFromValue(value: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function saleBadgeClass(type: string) {
    if (type === 'raffle') return adminStyles.badgeRaffle;
    if (type === 'product') return adminStyles.badgeProduct;
    return adminStyles.badgeService;
}

export default function AdminCRM() {
    const { data: session, status } = useSession();
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const authenticated = demoMode || status === 'authenticated';

    const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newBlockedDate, setNewBlockedDate] = useState('');
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formItem, setFormItem] = useState<CatalogFormItem>({});
    const [data, setData] = useState<DashboardState>(INITIAL_STATE);

    const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

    useEffect(() => {
        if (!authenticated) return;

        const subscriptions = [
            onSnapshot(collection(db, 'services'), (snapshot) => setData((prev) => ({ ...prev, services: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }))),
            onSnapshot(collection(db, 'products'), (snapshot) => setData((prev) => ({ ...prev, products: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }))),
            onSnapshot(collection(db, 'raffles'), (snapshot) => setData((prev) => ({ ...prev, raffles: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }))),
            onSnapshot(collection(db, 'promotions'), (snapshot) => setData((prev) => ({ ...prev, promos: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }))),
            onSnapshot(collection(db, 'mail_templates'), (snapshot) => setData((prev) => ({
                ...prev,
                mailTemplates: snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<MailTemplate, 'id'>) })),
            }))),
            onSnapshot(doc(db, 'settings', 'availability'), (documentSnapshot) => {
                if (documentSnapshot.exists()) {
                    setData((prev) => ({ ...prev, settings: documentSnapshot.data() as SettingsState }));
                }
            }),
        ];

        void fetchVentasYAgenda();

        return () => subscriptions.forEach((unsubscribe) => unsubscribe());
    }, [authenticated]);

    const fetchVentasYAgenda = async () => {
        setLoading(true);
        try {
            const [salesResponse, agendaResponse] = await Promise.all([fetch('/api/admin/reservas'), fetch('/api/admin/calendar')]);
            const salesData = await salesResponse.json();
            const agendaData = await agendaResponse.json();
            setData((prev) => ({
                ...prev,
                pendingSales: salesData.events || [],
                confirmedSales: agendaData.events || [],
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (item?: CatalogItem) => {
        const base = item
            ? {
                ...item,
                soldNumbersInput: Array.isArray(item.soldNumbers) ? item.soldNumbers.join(', ') : '',
            }
            : {
                active: true,
                soldNumbersInput: '',
                totalNumbers: currentTab === 'sorteos' ? 100 : undefined,
                applicableTo: currentTab === 'promos' ? 'all' : undefined,
            };

        setEditingItem(item || null);
        setFormItem(base);
        setShowModal(true);
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);

        const collectionName = getCollectionName(currentTab);

        const payload: CatalogFormItem = { ...formItem };
        delete payload.soldNumbersInput;

        if (currentTab === 'sorteos') {
            payload.totalNumbers = Number(payload.totalNumbers || 100);
            payload.soldNumbers = String(formItem.soldNumbersInput || '')
                .split(',')
                .map((value) => Number(value.trim()))
                .filter((value) => !Number.isNaN(value));
        }

        if (currentTab === 'promos') {
            payload.priceNumber = Number(payload.priceNumber || 0);
        }

        if (['servicios', 'productos'].includes(currentTab)) {
            payload.priceNumber = Number(payload.priceNumber || 0);
        }

        if (currentTab !== 'sorteos') {
            delete payload.totalNumbers;
            delete payload.soldNumbers;
        }

        if (currentTab !== 'promos') {
            delete payload.code;
            delete payload.applicableTo;
        }

        if (currentTab !== 'servicios') {
            delete payload.icon;
        }

        if (currentTab !== 'productos') {
            delete payload.imagePlaceholder;
        }

        const sanitizedPayload = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        );

        try {
            if (editingItem?.id) {
                await updateDoc(doc(db, collectionName, editingItem.id), sanitizedPayload);
            } else {
                await addDoc(collection(db, collectionName), { ...sanitizedPayload, createdAt: serverTimestamp() });
            }

            setShowModal(false);
            setEditingItem(null);
            setFormItem({});
        } catch (error) {
            console.error(error);
            alert('No se pudo guardar el elemento.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string, collectionName: string) => {
        if (!confirm('Esta accion eliminara el elemento del catalogo.')) return;
        await deleteDoc(doc(db, collectionName, id));
    };

    const handleApproveSale = async (eventId: string) => {
        if (!confirm('Confirmar esta venta y moverla al estado aprobado?')) return;
        setProcessing(true);
        try {
            const response = await fetch('/api/admin/approve-reserva', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });

            if (!response.ok) {
                const result = await response.json();
                alert(result?.error || 'No se pudo confirmar la venta.');
                return;
            }

            await fetchVentasYAgenda();
        } catch (error) {
            console.error(error);
            alert('Error de conexion al confirmar la venta.');
        } finally {
            setProcessing(false);
        }
    };

    const saveAvailability = async () => {
        setProcessing(true);
        try {
            await setDoc(doc(db, 'settings', 'availability'), data.settings, { merge: true });
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: data.settings }),
            });
        } catch (error) {
            console.error(error);
            alert('No se pudo guardar la disponibilidad.');
        } finally {
            setProcessing(false);
        }
    };

    const runManualCleanup = async () => {
        if (!confirm('Ejecutar la limpieza manual de ventas pendientes vencidas?')) return;
        setProcessing(true);
        try {
            const response = await fetch('/api/cron/cleanup');
            const result = await response.json();
            alert(result.message || 'Limpieza ejecutada.');
            await fetchVentasYAgenda();
        } catch (error) {
            console.error(error);
            alert('No se pudo ejecutar la limpieza.');
        } finally {
            setProcessing(false);
        }
    };

    const toggleWorkDay = (dayId: number) => {
        const nextDays = data.settings.workDays.includes(dayId)
            ? data.settings.workDays.filter((value) => value !== dayId)
            : [...data.settings.workDays, dayId].sort();

        setData((prev) => ({ ...prev, settings: { ...prev.settings, workDays: nextDays } }));
    };

    const addBlockedDate = () => {
        if (!newBlockedDate) return;

        const blockedDates = [...new Set([...(data.settings.blockedDates || []), newBlockedDate])].sort();
        setData((prev) => ({ ...prev, settings: { ...prev.settings, blockedDates } }));
        setNewBlockedDate('');
    };

    const removeBlockedDate = (date: string) => {
        setData((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                blockedDates: prev.settings.blockedDates.filter((value) => value !== date),
            },
        }));
    };

    const updateMailTemplate = async (id: string, body: string, subject: string) => {
        setProcessing(true);
        try {
            await updateDoc(doc(db, 'mail_templates', id), { body, subject });
        } catch (error) {
            console.error(error);
            alert('No se pudo actualizar la plantilla.');
        } finally {
            setProcessing(false);
        }
    };

    const generatePromoCode = () => {
        const seeds = ['LUNA', 'ASTRO', 'DESTINO', 'MAGIA', 'SUERTE'];
        setFormItem((prev) => ({
            ...prev,
            code: `${seeds[Math.floor(Math.random() * seeds.length)]}${Math.floor(Math.random() * 900 + 100)}`,
        }));
    };

    const pendingSales = useMemo(() => {
        if (!deferredSearch) return data.pendingSales;
        return data.pendingSales.filter((sale) => {
            const haystack = [sale.summary, sale.clientName, sale.clientEmail, sale.reservationCode, sale.saleTypeLabel]
                .join(' ')
                .toLowerCase();
            return haystack.includes(deferredSearch);
        });
    }, [data.pendingSales, deferredSearch]);

    const confirmedSales = useMemo(() => {
        if (!deferredSearch) return data.confirmedSales;
        return data.confirmedSales.filter((sale) => {
            const haystack = [sale.summary, sale.clientName, sale.clientEmail, sale.reservationCode]
                .join(' ')
                .toLowerCase();
            return haystack.includes(deferredSearch);
        });
    }, [data.confirmedSales, deferredSearch]);

    const catalogItems = useMemo(() => {
        if (currentTab === 'servicios') return data.services;
        if (currentTab === 'productos') return data.products;
        if (currentTab === 'sorteos') return data.raffles;
        return data.promos;
    }, [currentTab, data.services, data.products, data.raffles, data.promos]);

    const filteredCatalog = useMemo(() => {
        if (!deferredSearch) return catalogItems;
        return catalogItems.filter((item) => {
            const haystack = [item.title, item.description, item.code, item.price]
                .join(' ')
                .toLowerCase();
            return haystack.includes(deferredSearch);
        });
    }, [catalogItems, deferredSearch]);

    const dashboardStats = useMemo(() => {
        const pipelineValue = data.pendingSales.reduce((total, sale) => total + (sale.amountNumber || 0), 0);
        const confirmedValue = data.confirmedSales.reduce((total, sale) => total + (sale.amountNumber || 0), 0);

        return [
            {
                label: 'Ventas por validar',
                value: data.pendingSales.length,
                hint: `${data.pendingSales.filter((sale) => sale.paymentReported).length} con comprobante cargado`,
                icon: ShoppingCart,
            },
            {
                label: 'Agenda confirmada',
                value: data.confirmedSales.length,
                hint: 'Solo servicios con fecha programada',
                icon: Calendar,
            },
            {
                label: 'Catalogo activo',
                value: data.services.length + data.products.length + data.raffles.length,
                hint: `${data.promos.length} promociones disponibles`,
                icon: Sparkles,
            },
            {
                label: 'Pipeline manual',
                value: pipelineValue > 0 ? currencyFromValue(pipelineValue) : 'Manual',
                hint: confirmedValue > 0 ? `Confirmado: ${currencyFromValue(confirmedValue)}` : 'Se calcula con items nuevos',
                icon: TrendingUp,
            },
        ];
    }, [data]);

    const tabCopy: Record<TabType, { title: string; description: string }> = {
        dashboard: {
            title: 'Panel central del emprendimiento',
            description: 'Vista operativa para revisar validaciones, agenda, catalogo y capacidad disponible sin depender de datos mockeados.',
        },
        ventas: {
            title: 'Ventas manuales pendientes',
            description: 'Aqui aterrizan servicios, rifas y productos que ya reportaron o estan por reportar su comprobante de pago.',
        },
        agenda: {
            title: 'Agenda confirmada',
            description: 'Se listan solamente las ventas confirmadas que requieren fecha y hora, para que el calendario operativo siga limpio.',
        },
        disponibilidad: {
            title: 'Disponibilidad y bloqueos',
            description: 'Controla dias laborales, franja horaria, duracion de slots y fechas cerradas sin tocar codigo.',
        },
        servicios: {
            title: 'Catalogo de servicios',
            description: 'Gestiona tus atenciones agendables, sus precios y su narrativa comercial.',
        },
        productos: {
            title: 'Catalogo de productos',
            description: 'Productos con flujo de consignacion y comprobante, listos para entrar al circuito administrativo.',
        },
        sorteos: {
            title: 'Catalogo de rifas',
            description: 'Configura rifas, valor por numero y el inventario visible de participaciones.',
        },
        promos: {
            title: 'Promociones activas',
            description: 'Codigos y descuentos para empujar conversion sin perder control del catalogo.',
        },
        mensajeria: {
            title: 'Plantillas de mensajeria',
            description: 'Ajusta los mensajes operativos enviados cuando entra una venta o se aprueba manualmente.',
        },
        config: {
            title: 'Sistema y mantenimiento',
            description: 'Estado del acceso, conexiones y herramientas de soporte para mantener la operacion ordenada.',
        },
    };

    if (!demoMode && status === 'loading') {
        return (
            <div className={adminStyles.loadingWrap}>
                <div className={adminStyles.loadingCard}>
                    <RefreshCw size={34} className="animate-spin" />
                    <h2 className={adminStyles.loginTitle}>Validando acceso</h2>
                    <p className={adminStyles.loginText}>Estamos preparando el panel administrativo y comprobando tu sesion.</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className={adminStyles.loginWrap}>
                <div className={adminStyles.loginCard}>
                    <div className={adminStyles.brandMark} style={{ margin: '0 auto' }}>
                        <Sparkles size={24} />
                    </div>
                    <h1 className={`${adminStyles.loginTitle} gradient-text`}>El Nexo Admin</h1>
                    <p className={adminStyles.loginText}>
                        Centro de control para ventas manuales, agenda, rifas, productos y promociones. El acceso vuelve a depender de tu sesion real.
                    </p>
                    <button onClick={() => signIn('google')} className={adminStyles.primaryButton}>
                        <Sparkles size={18} /> Ingresar con Google
                    </button>
                </div>
            </div>
        );
    }

    const sectionGroupedNav = navigation.reduce<Record<string, Array<(typeof navigation)[number]>>>((acc, item) => {
        acc[item.section] = [...(acc[item.section] || []), item];
        return acc;
    }, {});

    const shouldShowCatalog = ['servicios', 'productos', 'sorteos', 'promos'].includes(currentTab);
    const adminLabel = demoMode ? 'Modo demo' : session?.user?.email || 'Sesion activa';

    return (
        <div className={adminStyles.shell}>
            <aside className={adminStyles.sidebar}>
                <div className={adminStyles.brand}>
                    <div className={adminStyles.brandMark}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className={adminStyles.brandTitle}>EL NEXO CRM</div>
                        <div className={adminStyles.brandSubtitle}>Ventas manuales, agenda y catalogo</div>
                    </div>
                </div>

                {Object.entries(sectionGroupedNav).map(([section, items]) => (
                    <div key={section}>
                        <div className={adminStyles.navSection}>{section}</div>
                        <nav className={adminStyles.nav}>
                            {items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        className={`${adminStyles.navButton} ${currentTab === item.id ? adminStyles.navButtonActive : ''}`}
                                        onClick={() => startTransition(() => setCurrentTab(item.id))}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                ))}

                <div className={adminStyles.sideFooter}>
                    <button className={`${adminStyles.ghostButton} ${adminStyles.logoutButton}`} onClick={() => signOut()}>
                        <LogOut size={18} /> Cerrar sesion
                    </button>
                </div>
            </aside>

            <main className={adminStyles.content}>
                <header className={adminStyles.topbar}>
                    <div className={adminStyles.titleBlock}>
                        <h1>{tabCopy[currentTab].title}</h1>
                        <p>{tabCopy[currentTab].description}</p>
                    </div>

                    <div className={adminStyles.topActions}>
                        <label className={adminStyles.searchBox}>
                            <Search size={18} />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Buscar por cliente, item o codigo"
                            />
                        </label>
                        {shouldShowCatalog && (
                            <button className={adminStyles.primaryButton} onClick={() => openModal()}>
                                <Plus size={18} /> Crear item
                            </button>
                        )}
                    </div>
                </header>

                <section className={adminStyles.hero}>
                    <div className={adminStyles.heroInfo}>
                        <h2>Operacion centralizada con consignacion y comprobante</h2>
                        <p>
                            El flujo comercial se mantiene manual por decision del negocio: el cliente ve los medios de pago, consigna, sube el comprobante y el sistema genera su codigo de transaccion para validacion interna.
                        </p>
                    </div>
                    <div className={adminStyles.heroMeta}>
                        <span className={adminStyles.pill}><Users size={16} /> {adminLabel}</span>
                        <span className={adminStyles.pill}><CheckCircle2 size={16} /> {loading ? 'Sincronizando...' : 'Datos al dia'}</span>
                        <span className={adminStyles.pill}><Settings size={16} /> {demoMode ? 'Demo activa' : 'Sesion protegida'}</span>
                    </div>
                </section>

                {currentTab === 'dashboard' && (
                    <>
                        <section className={adminStyles.metricGrid}>
                            {dashboardStats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <article key={stat.label} className={adminStyles.metric}>
                                        <div className={adminStyles.metricHeader}>
                                            <span className={adminStyles.metricLabel}>{stat.label}</span>
                                            <Icon size={20} />
                                        </div>
                                        <div className={adminStyles.metricValue}>{stat.value}</div>
                                        <div className={adminStyles.metricSubvalue}>{stat.hint}</div>
                                    </article>
                                );
                            })}
                        </section>

                        <section className={adminStyles.splitGrid}>
                            <div className={adminStyles.panel}>
                                <div className={adminStyles.panelHeader}>
                                    <div>
                                        <div className={adminStyles.panelTitle}><ShoppingCart size={18} /> Embudo de validacion</div>
                                        <div className={adminStyles.panelHint}>Resumen inmediato de lo que exige accion humana.</div>
                                    </div>
                                </div>
                                <div className={adminStyles.stack}>
                                    {data.pendingSales.slice(0, 4).map((sale) => (
                                        <article key={sale.id} className={adminStyles.card}>
                                            <div className={adminStyles.saleHeader}>
                                                <div>
                                                    <div className={adminStyles.saleMeta}>
                                                        <span className={`${adminStyles.badge} ${saleBadgeClass(sale.saleType)}`}>{sale.saleTypeLabel}</span>
                                                        <span className={`${adminStyles.badge} ${sale.paymentReported ? adminStyles.badgeApproved : adminStyles.badgePending}`}>
                                                            {sale.paymentReported ? 'Con comprobante' : 'Pendiente de reporte'}
                                                        </span>
                                                    </div>
                                                    <h3 className={adminStyles.cardTitle}>{sale.itemTitle || sale.summary}</h3>
                                                    <p className={adminStyles.muted}>{sale.clientName || 'Cliente sin nombre'} · {sale.clientEmail || 'Sin correo'}</p>
                                                </div>
                                                <button className={adminStyles.secondaryButton} onClick={() => startTransition(() => setCurrentTab('ventas'))}>Ver detalle</button>
                                            </div>
                                        </article>
                                    ))}
                                    {data.pendingSales.length === 0 && <div className={adminStyles.emptyState}>No tienes ventas pendientes por validar.</div>}
                                </div>
                            </div>

                            <div className={adminStyles.panel}>
                                <div className={adminStyles.panelHeader}>
                                    <div>
                                        <div className={adminStyles.panelTitle}><Calendar size={18} /> Proximas citas</div>
                                        <div className={adminStyles.panelHint}>Agenda ya aprobada para operacion diaria.</div>
                                    </div>
                                </div>
                                <div className={adminStyles.stack}>
                                    {data.confirmedSales.slice(0, 4).map((sale) => (
                                        <article key={sale.id} className={adminStyles.card}>
                                            <div className={adminStyles.agendaHeader}>
                                                <div>
                                                    <h3 className={adminStyles.cardTitle}>{sale.itemTitle || sale.summary}</h3>
                                                    <p className={adminStyles.muted}>{sale.clientName || sale.clientEmail || 'Cliente confirmado'}</p>
                                                </div>
                                                <span className={`${adminStyles.badge} ${adminStyles.badgeApproved}`}>Aprobada</span>
                                            </div>
                                            <div className={adminStyles.detailGrid}>
                                                <div className={adminStyles.detailItem}>
                                                    <div className={adminStyles.detailLabel}>Fecha</div>
                                                    <div className={adminStyles.detailValue}>{sale.scheduledDateLabel || new Date(sale.start).toLocaleString()}</div>
                                                </div>
                                                <div className={adminStyles.detailItem}>
                                                    <div className={adminStyles.detailLabel}>Codigo</div>
                                                    <div className={adminStyles.detailValue}>{sale.reservationCode || 'Sin codigo'}</div>
                                                </div>
                                                <div className={adminStyles.detailItem}>
                                                    <div className={adminStyles.detailLabel}>Canal</div>
                                                    <div className={adminStyles.detailValue}>Agenda operativa</div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                    {data.confirmedSales.length === 0 && <div className={adminStyles.emptyState}>No hay servicios confirmados en la agenda.</div>}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {currentTab === 'ventas' && (
                    <section className={adminStyles.panel}>
                        <div className={adminStyles.panelHeader}>
                            <div>
                                <div className={adminStyles.panelTitle}><AlertCircle size={18} /> Ventas pendientes de aprobacion</div>
                                <div className={adminStyles.panelHint}>Unifica servicios, productos y rifas bajo el mismo circuito manual.</div>
                            </div>
                            <button className={adminStyles.secondaryButton} onClick={() => void fetchVentasYAgenda()}>
                                <RefreshCw size={16} /> Actualizar
                            </button>
                        </div>

                        <div className={adminStyles.stack}>
                            {pendingSales.map((sale) => (
                                <article key={sale.id} className={adminStyles.card}>
                                    <div className={adminStyles.saleHeader}>
                                        <div>
                                            <div className={adminStyles.saleMeta}>
                                                <span className={`${adminStyles.badge} ${saleBadgeClass(sale.saleType)}`}>{sale.saleTypeLabel}</span>
                                                <span className={`${adminStyles.badge} ${sale.paymentReported ? adminStyles.badgeApproved : adminStyles.badgePending}`}>
                                                    {sale.paymentReported ? 'Comprobante cargado' : 'Esperando comprobante'}
                                                </span>
                                            </div>
                                            <h3 className={adminStyles.cardTitle}>{sale.itemTitle || sale.summary}</h3>
                                            <p className={adminStyles.muted}>{sale.previewDescription || 'Venta generada desde el flujo comercial.'}</p>
                                        </div>
                                        <button className={adminStyles.primaryButton} onClick={() => handleApproveSale(sale.id)} disabled={processing}>
                                            <CheckCircle2 size={16} /> Confirmar venta
                                        </button>
                                    </div>

                                    <div className={adminStyles.detailGrid}>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Cliente</div>
                                            <div className={adminStyles.detailValue}>{sale.clientName || 'Sin nombre'}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Correo</div>
                                            <div className={adminStyles.detailValue}>{sale.clientEmail || 'Sin correo'}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Codigo</div>
                                            <div className={adminStyles.detailValue}>{sale.reservationCode || 'Sin codigo'}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Importe</div>
                                            <div className={adminStyles.detailValue}>{sale.amountLabel || 'Manual'}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Fecha asociada</div>
                                            <div className={adminStyles.detailValue}>{sale.scheduledDateLabel || (sale.start ? new Date(sale.start).toLocaleString() : 'Sin agenda')}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Referencia extra</div>
                                            <div className={adminStyles.detailValue}>{sale.selectedNumber ? `Numero ${sale.selectedNumber}` : sale.clientPhone || 'Sin dato extra'}</div>
                                        </div>
                                    </div>

                                    <div className={adminStyles.actionsRow}>
                                        {sale.paymentProofUrl && sale.paymentProofUrl !== 'NO_DISPONIBLE' && (
                                            <a className={adminStyles.linkButton} href={sale.paymentProofUrl} target="_blank" rel="noreferrer">
                                                Ver comprobante
                                            </a>
                                        )}
                                        {sale.paymentNote && <span className={adminStyles.muted}>Nota: {sale.paymentNote}</span>}
                                    </div>
                                </article>
                            ))}
                            {pendingSales.length === 0 && <div className={adminStyles.emptyState}>No hay coincidencias en ventas pendientes.</div>}
                        </div>
                    </section>
                )}

                {currentTab === 'agenda' && (
                    <section className={adminStyles.panel}>
                        <div className={adminStyles.panelHeader}>
                            <div>
                                <div className={adminStyles.panelTitle}><Calendar size={18} /> Agenda de servicios vendidos</div>
                                <div className={adminStyles.panelHint}>Solo muestra ventas confirmadas que requieren atencion calendarizada.</div>
                            </div>
                        </div>
                        <div className={adminStyles.stack}>
                            {confirmedSales.map((sale) => (
                                <article key={sale.id} className={adminStyles.card}>
                                    <div className={adminStyles.agendaHeader}>
                                        <div>
                                            <div className={adminStyles.saleMeta}>
                                                <span className={`${adminStyles.badge} ${adminStyles.badgeService}`}>Servicio confirmado</span>
                                            </div>
                                            <h3 className={adminStyles.cardTitle}>{sale.itemTitle || sale.summary}</h3>
                                            <p className={adminStyles.muted}>{sale.clientName || sale.clientEmail || 'Cliente confirmado'}</p>
                                        </div>
                                        <span className={`${adminStyles.badge} ${adminStyles.badgeApproved}`}>OK</span>
                                    </div>
                                    <div className={adminStyles.detailGrid}>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Fecha</div>
                                            <div className={adminStyles.detailValue}>{sale.scheduledDateLabel || new Date(sale.start).toLocaleString()}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Correo</div>
                                            <div className={adminStyles.detailValue}>{sale.clientEmail || 'Sin correo'}</div>
                                        </div>
                                        <div className={adminStyles.detailItem}>
                                            <div className={adminStyles.detailLabel}>Codigo</div>
                                            <div className={adminStyles.detailValue}>{sale.reservationCode || 'Sin codigo'}</div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {confirmedSales.length === 0 && <div className={adminStyles.emptyState}>No hay servicios confirmados para mostrar.</div>}
                        </div>
                    </section>
                )}

                {currentTab === 'disponibilidad' && (
                    <section className={adminStyles.availabilityGrid}>
                        <article className={adminStyles.panel}>
                            <div className={adminStyles.panelHeader}>
                                <div>
                                    <div className={adminStyles.panelTitle}><Calendar size={18} /> Regla semanal</div>
                                    <div className={adminStyles.panelHint}>Estos datos controlan el calendario publico de servicios.</div>
                                </div>
                            </div>
                            <div className={adminStyles.field}>
                                <span className={adminStyles.label}>Dias laborables</span>
                                <div className={adminStyles.dayGrid}>
                                    {dayOptions.map((day) => (
                                        <button
                                            key={day.id}
                                            className={`${adminStyles.dayButton} ${data.settings.workDays.includes(day.id) ? adminStyles.dayButtonActive : ''}`}
                                            onClick={() => toggleWorkDay(day.id)}
                                        >
                                            {day.short} · {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={adminStyles.formColumns} style={{ marginTop: '1rem' }}>
                                <label className={adminStyles.field}>
                                    <span className={adminStyles.label}>Hora inicio</span>
                                    <input className={adminStyles.input} type="time" value={data.settings.startTime} onChange={(event) => setData((prev) => ({ ...prev, settings: { ...prev.settings, startTime: event.target.value } }))} />
                                </label>
                                <label className={adminStyles.field}>
                                    <span className={adminStyles.label}>Hora fin</span>
                                    <input className={adminStyles.input} type="time" value={data.settings.endTime} onChange={(event) => setData((prev) => ({ ...prev, settings: { ...prev.settings, endTime: event.target.value } }))} />
                                </label>
                            </div>
                            <label className={adminStyles.field} style={{ marginTop: '1rem' }}>
                                <span className={adminStyles.label}>Duracion de slot</span>
                                <input className={adminStyles.input} type="number" min={15} step={15} value={data.settings.slotDurationMinutes} onChange={(event) => setData((prev) => ({ ...prev, settings: { ...prev.settings, slotDurationMinutes: Number(event.target.value || 60) } }))} />
                            </label>
                        </article>

                        <article className={adminStyles.panel}>
                            <div className={adminStyles.panelHeader}>
                                <div>
                                    <div className={adminStyles.panelTitle}><AlertCircle size={18} /> Fechas bloqueadas</div>
                                    <div className={adminStyles.panelHint}>Vacaciones, feriados o dias fuera de operacion.</div>
                                </div>
                            </div>
                            <div className={adminStyles.formColumns}>
                                <label className={adminStyles.field}>
                                    <span className={adminStyles.label}>Nueva fecha bloqueada</span>
                                    <input className={adminStyles.input} type="date" value={newBlockedDate} onChange={(event) => setNewBlockedDate(event.target.value)} />
                                </label>
                                <div className={adminStyles.field} style={{ justifyContent: 'flex-end' }}>
                                    <span className={adminStyles.label}>Accion</span>
                                    <button className={adminStyles.secondaryButton} onClick={addBlockedDate}>Agregar bloqueo</button>
                                </div>
                            </div>
                            <div className={adminStyles.chipGrid} style={{ marginTop: '1rem' }}>
                                {data.settings.blockedDates.map((date) => (
                                    <span key={date} className={adminStyles.chip}>
                                        {date}
                                        <button className={adminStyles.iconButton} onClick={() => removeBlockedDate(date)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </span>
                                ))}
                                {data.settings.blockedDates.length === 0 && <div className={adminStyles.emptyState}>No hay fechas bloqueadas.</div>}
                            </div>
                            <div className={adminStyles.formActions}>
                                <button className={adminStyles.primaryButton} onClick={saveAvailability} disabled={processing}>
                                    <CheckCircle2 size={16} /> Guardar disponibilidad
                                </button>
                            </div>
                        </article>
                    </section>
                )}

                {shouldShowCatalog && (
                    <section className={adminStyles.catalogGrid}>
                        {filteredCatalog.map((item) => (
                            <article key={item.id} className={adminStyles.card}>
                                <div className={adminStyles.catalogHeader}>
                                    <div>
                                        <div className={adminStyles.saleMeta}>
                                            <span className={`${adminStyles.badge} ${currentTab === 'servicios' ? adminStyles.badgeService : currentTab === 'productos' ? adminStyles.badgeProduct : currentTab === 'sorteos' ? adminStyles.badgeRaffle : ''}`}>
                                                {currentTab === 'servicios' ? 'Servicio' : currentTab === 'productos' ? 'Producto' : currentTab === 'sorteos' ? 'Rifa' : 'Promo'}
                                            </span>
                                            {currentTab === 'sorteos' && <span className={adminStyles.badge}>{item.active === false ? 'Inactiva' : 'Activa'}</span>}
                                        </div>
                                        <h3 className={adminStyles.cardTitle}>{item.title || item.code}</h3>
                                        <p className={adminStyles.muted}>{item.description || 'Sin descripcion comercial.'}</p>
                                    </div>
                                    <div className={adminStyles.actionsRow}>
                                        <button className={adminStyles.iconButton} onClick={() => openModal(item)}>
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className={`${adminStyles.iconButton} ${adminStyles.iconDanger}`}
                                            onClick={() => handleDelete(item.id, getCollectionName(currentTab))}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className={adminStyles.detailGrid}>
                                    <div className={adminStyles.detailItem}>
                                        <div className={adminStyles.detailLabel}>Visible</div>
                                        <div className={adminStyles.detailValue}>{item.price || item.code || 'Sin valor visible'}</div>
                                    </div>
                                    <div className={adminStyles.detailItem}>
                                        <div className={adminStyles.detailLabel}>Valor interno</div>
                                        <div className={adminStyles.detailValue}>{item.priceNumber || item.totalNumbers || 'Sin dato'}</div>
                                    </div>
                                    <div className={adminStyles.detailItem}>
                                        <div className={adminStyles.detailLabel}>Dato extra</div>
                                        <div className={adminStyles.detailValue}>
                                            {currentTab === 'sorteos'
                                                ? `${item.soldNumbers?.length || 0}/${item.totalNumbers || 0} vendidos`
                                                : currentTab === 'promos'
                                                    ? item.applicableTo || 'all'
                                                    : item.imagePlaceholder || item.icon || 'Catalogo'}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {filteredCatalog.length === 0 && <div className={adminStyles.emptyState}>No hay elementos coincidentes en esta seccion.</div>}
                    </section>
                )}

                {currentTab === 'mensajeria' && (
                    <section className={adminStyles.messageGrid}>
                        {data.mailTemplates.map((template) => (
                            <article key={template.id} className={adminStyles.panel}>
                                <div className={adminStyles.panelHeader}>
                                    <div>
                                        <div className={adminStyles.panelTitle}><Sparkles size={18} /> {template.id}</div>
                                        <div className={adminStyles.panelHint}>Variables sugeridas: cliente, servicio, fecha, codigo.</div>
                                    </div>
                                </div>
                                <label className={adminStyles.field}>
                                    <span className={adminStyles.label}>Asunto</span>
                                    <input className={adminStyles.input} value={template.subject} onChange={(event) => {
                                        const nextTemplates = data.mailTemplates.map((item) => item.id === template.id ? { ...item, subject: event.target.value } : item);
                                        setData((prev) => ({ ...prev, mailTemplates: nextTemplates }));
                                    }} />
                                </label>
                                <label className={adminStyles.field} style={{ marginTop: '1rem' }}>
                                    <span className={adminStyles.label}>Cuerpo</span>
                                    <textarea className={adminStyles.textarea} value={template.body} onChange={(event) => {
                                        const nextTemplates = data.mailTemplates.map((item) => item.id === template.id ? { ...item, body: event.target.value } : item);
                                        setData((prev) => ({ ...prev, mailTemplates: nextTemplates }));
                                    }} />
                                </label>
                                <div className={adminStyles.formActions}>
                                    <button className={adminStyles.primaryButton} onClick={() => updateMailTemplate(template.id, template.body, template.subject)} disabled={processing}>
                                        Guardar plantilla
                                    </button>
                                </div>
                            </article>
                        ))}
                        {data.mailTemplates.length === 0 && <div className={adminStyles.emptyState}>No hay plantillas configuradas en Firebase.</div>}
                    </section>
                )}

                {currentTab === 'config' && (
                    <section className={adminStyles.configGrid}>
                        <article className={adminStyles.panel}>
                            <div className={adminStyles.panelHeader}>
                                <div>
                                    <div className={adminStyles.panelTitle}><RefreshCw size={18} /> Mantenimiento operativo</div>
                                    <div className={adminStyles.panelHint}>Libera cupos vencidos cuando una venta no reporta pago a tiempo.</div>
                                </div>
                            </div>
                            <button className={adminStyles.primaryButton} onClick={runManualCleanup} disabled={processing}>
                                <RefreshCw size={16} /> Ejecutar limpieza manual
                            </button>
                        </article>

                        <article className={adminStyles.panel}>
                            <div className={adminStyles.panelHeader}>
                                <div>
                                    <div className={adminStyles.panelTitle}><Settings size={18} /> Estado del sistema</div>
                                    <div className={adminStyles.panelHint}>Resumen rapido del modo operativo actual.</div>
                                </div>
                            </div>
                            <div className={adminStyles.detailGrid}>
                                <div className={adminStyles.detailItem}>
                                    <div className={adminStyles.detailLabel}>Sesion</div>
                                    <div className={adminStyles.detailValue}>{demoMode ? 'Demo' : 'Protegida con Google'}</div>
                                </div>
                                <div className={adminStyles.detailItem}>
                                    <div className={adminStyles.detailLabel}>Backoffice</div>
                                    <div className={adminStyles.detailValue}>Firestore + Calendar</div>
                                </div>
                                <div className={adminStyles.detailItem}>
                                    <div className={adminStyles.detailLabel}>Metodo de cobro</div>
                                    <div className={adminStyles.detailValue}>Consignacion manual</div>
                                </div>
                            </div>
                        </article>
                    </section>
                )}

                {showModal && (
                    <div className={adminStyles.modalOverlay}>
                        <div className={adminStyles.modal}>
                            <div className={adminStyles.modalHeader}>
                                <div>
                                    <h2>{editingItem ? 'Editar elemento del catalogo' : 'Crear elemento del catalogo'}</h2>
                                    <p className={adminStyles.muted}>El formulario se adapta a la seccion activa para mantener orden operativo.</p>
                                </div>
                                <button className={adminStyles.iconButton} onClick={() => setShowModal(false)}>
                                    <AlertCircle size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className={adminStyles.modalForm}>
                                <div className={adminStyles.formColumns}>
                                    {currentTab !== 'promos' && (
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Titulo</span>
                                            <input className={adminStyles.input} value={formItem.title || ''} onChange={(event) => setFormItem({ ...formItem, title: event.target.value })} required />
                                        </label>
                                    )}

                                    <label className={adminStyles.field}>
                                        <span className={adminStyles.label}>{currentTab === 'promos' ? 'Codigo' : 'Precio visible'}</span>
                                        <input
                                            className={adminStyles.input}
                                            value={currentTab === 'promos' ? formItem.code || '' : formItem.price || ''}
                                            onChange={(event) => setFormItem({ ...formItem, [currentTab === 'promos' ? 'code' : 'price']: event.target.value })}
                                            required
                                        />
                                    </label>
                                </div>

                                <label className={adminStyles.field}>
                                    <span className={adminStyles.label}>Descripcion</span>
                                    <textarea className={adminStyles.textarea} value={formItem.description || ''} onChange={(event) => setFormItem({ ...formItem, description: event.target.value })} required />
                                </label>

                                <div className={adminStyles.formColumns}>
                                    <label className={adminStyles.field}>
                                        <span className={adminStyles.label}>{currentTab === 'promos' ? 'Descuento / valor' : 'Valor interno'}</span>
                                        <input className={adminStyles.input} type="number" value={formItem.priceNumber || ''} onChange={(event) => setFormItem({ ...formItem, priceNumber: Number(event.target.value || 0) })} required />
                                    </label>

                                    {currentTab === 'servicios' && (
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Icono</span>
                                            <input className={adminStyles.input} value={formItem.icon || ''} onChange={(event) => setFormItem({ ...formItem, icon: event.target.value })} />
                                        </label>
                                    )}

                                    {currentTab === 'productos' && (
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Placeholder visual</span>
                                            <input className={adminStyles.input} value={formItem.imagePlaceholder || ''} onChange={(event) => setFormItem({ ...formItem, imagePlaceholder: event.target.value })} />
                                        </label>
                                    )}

                                    {currentTab === 'sorteos' && (
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Total de numeros</span>
                                            <input className={adminStyles.input} type="number" value={formItem.totalNumbers || 100} onChange={(event) => setFormItem({ ...formItem, totalNumbers: Number(event.target.value || 100) })} />
                                        </label>
                                    )}

                                    {currentTab === 'promos' && (
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Aplica a</span>
                                            <select className={adminStyles.select} value={formItem.applicableTo || 'all'} onChange={(event) => setFormItem({ ...formItem, applicableTo: event.target.value })}>
                                                <option value="all">Todo</option>
                                                <option value="services">Servicios</option>
                                                <option value="products">Productos</option>
                                                <option value="raffles">Rifas</option>
                                            </select>
                                        </label>
                                    )}
                                </div>

                                {currentTab === 'sorteos' && (
                                    <div className={adminStyles.formColumns}>
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Numeros vendidos</span>
                                            <textarea className={adminStyles.textarea} value={formItem.soldNumbersInput || ''} onChange={(event) => setFormItem({ ...formItem, soldNumbersInput: event.target.value })} placeholder="Ejemplo: 1, 2, 15, 77" />
                                        </label>
                                        <label className={adminStyles.field}>
                                            <span className={adminStyles.label}>Estado</span>
                                            <select className={adminStyles.select} value={String(formItem.active !== false)} onChange={(event) => setFormItem({ ...formItem, active: event.target.value === 'true' })}>
                                                <option value="true">Activa</option>
                                                <option value="false">Inactiva</option>
                                            </select>
                                        </label>
                                    </div>
                                )}

                                {currentTab === 'promos' && (
                                    <div className={adminStyles.formActions}>
                                        <button type="button" className={adminStyles.secondaryButton} onClick={generatePromoCode}>
                                            <RefreshCw size={16} /> Generar codigo
                                        </button>
                                    </div>
                                )}

                                <div className={adminStyles.formActions}>
                                    <button type="button" className={adminStyles.ghostButton} onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className={adminStyles.primaryButton} disabled={processing}>
                                        <CheckCircle2 size={16} /> Guardar cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
