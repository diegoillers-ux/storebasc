export type SaleType = 'service' | 'product' | 'raffle';

export type SaleMetadata = {
    saleType: SaleType;
    itemId?: string;
    itemTitle?: string;
    amountLabel?: string;
    amountNumber?: number;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    reservationCode?: string;
    selectedNumber?: string;
    requiresScheduling?: boolean;
    scheduledDateLabel?: string;
};

type PaymentReport = {
    reported: boolean;
    note: string;
    proofUrl: string;
    reportDate: string;
    clientEmail: string;
};

type EventInput = {
    id?: string | null;
    summary?: string | null;
    description?: string | null;
    status?: string | null;
    created?: string | null;
    location?: string | null;
    start?: { dateTime?: string | null; date?: string | null } | string | null;
    end?: { dateTime?: string | null; date?: string | null } | string | null;
};

const META_MARKER = '[CRM_META]';

function getStartValue(value: EventInput['start']) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.dateTime || value.date || '';
}

function getEndValue(value: EventInput['end']) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.dateTime || value.date || '';
}

export function appendSaleMetadata(description: string, metadata: SaleMetadata) {
    const trimmed = description.trim();
    return `${trimmed}\n\n${META_MARKER}\n${JSON.stringify(metadata, null, 2)}`;
}

export function extractSaleMetadata(description = ''): SaleMetadata | null {
    const match = description.match(/\[CRM_META\]\s*\n([\s\S]*?)(?:\n\n---|\n\n\[PAGO_REPORTADO\]|$)/);
    if (!match?.[1]) return null;

    try {
        return JSON.parse(match[1]) as SaleMetadata;
    } catch {
        return null;
    }
}

export function extractPaymentReport(description = ''): PaymentReport {
    const match = description.match(/\[PAGO_REPORTADO\]([\s\S]*)$/);
    if (!match?.[1]) {
        return { reported: false, note: '', proofUrl: '', reportDate: '', clientEmail: '' };
    }

    const block = match[1];
    const getField = (label: string) => {
        const result = block.match(new RegExp(`${label}:\\s*(.+)`));
        return result?.[1]?.trim() || '';
    };

    return {
        reported: true,
        note: getField('Nota'),
        proofUrl: getField('Comprobante URL'),
        reportDate: getField('Fecha Reporte'),
        clientEmail: getField('Email'),
    };
}

export function extractPublicDescription(description = '') {
    return description
        .replace(/\n\n\[CRM_META\][\s\S]*$/m, '')
        .replace(/\n\n\[PAGO_REPORTADO\][\s\S]*$/m, '')
        .replace(/\n\n---[\s\S]*$/m, '')
        .trim();
}

function extractField(description = '', label: string) {
    const match = description.match(new RegExp(`${label}:\\s*(.+)`));
    return match?.[1]?.trim() || '';
}

export function inferSaleType(summary = '', metadata?: SaleMetadata | null): SaleType {
    if (metadata?.saleType) return metadata.saleType;

    const normalized = summary.toUpperCase();
    if (normalized.includes('RIFA')) return 'raffle';
    if (normalized.includes('PRODUCTO')) return 'product';
    return 'service';
}

export function getSaleTypeLabel(type: SaleType) {
    if (type === 'raffle') return 'Rifa';
    if (type === 'product') return 'Producto';
    return 'Servicio';
}

export function mapCalendarEventToSale(event: EventInput) {
    const description = event.description || '';
    const metadata = extractSaleMetadata(description);
    const payment = extractPaymentReport(description);
    const saleType = inferSaleType(event.summary || '', metadata);
    const summary = (event.summary || '').replace('[PENDIENTE] ', '').replace('[PENDIENTE]', '').trim();
    const fallbackClientName = summary.includes(' - ') ? summary.split(' - ').pop()?.trim() || '' : '';

    return {
        id: event.id || '',
        summary,
        description,
        previewDescription: extractPublicDescription(description),
        status: event.status || '',
        createdAt: event.created || '',
        start: getStartValue(event.start),
        end: getEndValue(event.end),
        location: event.location || '',
        saleType,
        saleTypeLabel: getSaleTypeLabel(saleType),
        itemId: metadata?.itemId || '',
        itemTitle: metadata?.itemTitle || summary,
        amountLabel: metadata?.amountLabel || '',
        amountNumber: metadata?.amountNumber || 0,
        clientName: metadata?.clientName || fallbackClientName,
        clientEmail: metadata?.clientEmail || extractField(description, 'Email') || payment.clientEmail,
        clientPhone: metadata?.clientPhone || extractField(description, 'WhatsApp') || '',
        reservationCode: metadata?.reservationCode || extractField(description, 'Codigo de reserva'),
        selectedNumber: metadata?.selectedNumber || '',
        requiresScheduling: metadata?.requiresScheduling ?? saleType === 'service',
        scheduledDateLabel: metadata?.scheduledDateLabel || '',
        paymentReported: payment.reported,
        paymentNote: payment.note,
        paymentProofUrl: payment.proofUrl,
        paymentReportedAt: payment.reportDate,
    };
}