type DemoEvent = {
    id: string;
    summary: string;
    description: string;
    start: string;
    end: string;
    location?: string;
    status: 'pending' | 'confirmed';
};

type DemoStore = {
    events: DemoEvent[];
    settings: {
        workDays: number[];
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
        blockedDates: string[];
    };
};

declare global {
    // eslint-disable-next-line no-var
    var __codebasicstor_demo_store__: DemoStore | undefined;
}

function getStore(): DemoStore {
    if (!global.__codebasicstor_demo_store__) {
        global.__codebasicstor_demo_store__ = {
            events: [],
            settings: {
                workDays: [1, 2, 3, 4, 5],
                startTime: '09:00',
                endTime: '18:00',
                slotDurationMinutes: 60,
                blockedDates: [],
            },
        };
    }
    return global.__codebasicstor_demo_store__;
}

export function demoCreatePendingEvent(input: { title: string; description: string; start: string; end: string }) {
    const store = getStore();
    const id = `demo-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const event: DemoEvent = {
        id,
        summary: `[PENDIENTE] ${input.title}`,
        description: `${input.description}\n\n---\n*Cita pendiente de pago. Si no se aprueba en el panel admin, se eliminara automaticamente.*`,
        start: input.start,
        end: input.end,
        status: 'pending',
    };
    store.events.push(event);
    return event;
}

export function demoListPendingEvents() {
    const store = getStore();
    return store.events.filter((e) => e.status === 'pending');
}

export function demoListConfirmedEvents() {
    const store = getStore();
    return store.events.filter((e) => e.status === 'confirmed');
}

export function demoGetEventById(eventId: string) {
    const store = getStore();
    return store.events.find((e) => e.id === eventId) || null;
}

export function demoUpdateEvent(eventId: string, patch: Partial<DemoEvent>) {
    const store = getStore();
    const idx = store.events.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;
    store.events[idx] = { ...store.events[idx], ...patch };
    return store.events[idx];
}

export function demoGetSettings() {
    return getStore().settings;
}

export function demoSetSettings(settings: DemoStore['settings']) {
    getStore().settings = settings;
    return settings;
}
