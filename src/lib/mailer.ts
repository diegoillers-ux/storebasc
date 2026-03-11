import nodemailer from 'nodemailer';

import { getSaleTypeLabel, type SaleType } from '@/lib/sales';

function getMailerConfigError() {
    if (!process.env.GMAIL_USER) return 'Falta GMAIL_USER en variables de entorno.';
    if (!process.env.GMAIL_APP_PASSWORD) return 'Falta GMAIL_APP_PASSWORD en variables de entorno.';
    return null;
}

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

function getPendingCopy(saleType: SaleType, itemName: string) {
    if (saleType === 'raffle') {
        return {
            subject: `Numero reservado pendiente de pago - ${itemName}`,
            body: `Hemos separado temporalmente tu numero para ${itemName}.`,
            followUp: 'Adjunta tu comprobante desde la pagina para que podamos validar la compra manualmente.',
        };
    }

    if (saleType === 'product') {
        return {
            subject: `Pedido pendiente de pago - ${itemName}`,
            body: `Recibimos tu solicitud para ${itemName} y el pedido quedo pendiente de validacion manual.`,
            followUp: 'Sube el comprobante desde la pagina para completar la validacion del pedido.',
        };
    }

    return {
        subject: `Reserva pendiente de pago - ${itemName}`,
        body: `Gracias por reservar con nuestra tienda tu sesion de ${itemName}.`,
        followUp: 'Si ya realizaste el pago, usa el boton de confirmacion en pantalla y adjunta el comprobante.',
    };
}

function getApprovedCopy(saleType: SaleType, itemName: string, meetingLink = '') {
    if (saleType === 'raffle') {
        return {
            subject: `Compra confirmada - ${itemName}`,
            body: `Tu numero para ${itemName} ya fue confirmado.`,
            extra: '<p>Guardaremos tu participacion y te avisaremos por los canales registrados cuando se realice el sorteo.</p>',
        };
    }

    if (saleType === 'product') {
        return {
            subject: `Pedido confirmado - ${itemName}`,
            body: `Tu pedido de ${itemName} ya fue aprobado.`,
            extra: '<p>Nos pondremos en contacto contigo para entrega, envio o coordinacion final.</p>',
        };
    }

    return {
        subject: `Reserva confirmada - ${itemName}`,
        body: `Hemos verificado tu pago. Tu sesion de ${itemName} ya fue confirmada.`,
        extra: meetingLink
            ? `<p>Aqui tienes el enlace para conectarnos ese dia:<br/><br/><a href="${meetingLink}" style="background-color: #D5BDA9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Unirse a la sesion</a></p>`
            : '<p>Recibiras por correo los detalles finales de la atencion.</p>',
    };
}

type PendingSaleEmailPayload = {
    toEmail: string;
    clientName: string;
    itemName: string;
    dateTime: string;
    reservationCode?: string;
    saleType?: SaleType;
};

type ApprovedSaleEmailPayload = {
    toEmail: string;
    clientName: string;
    itemName: string;
    dateTime: string;
    meetingLink?: string;
    saleType?: SaleType;
};

export async function sendPendingSaleEmail(payload: PendingSaleEmailPayload) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const saleType = payload.saleType || 'service';
    const copy = getPendingCopy(saleType, payload.itemName);

    const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: payload.toEmail,
        subject: `${copy.subject}${payload.reservationCode ? ` (${payload.reservationCode})` : ''}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #D5BDA9; text-align: center;">Hola ${payload.clientName}</h2>
        <p>${copy.body}</p>
        <p>Referencia: <strong>${payload.itemName}</strong>.</p>
        <p>Fecha asociada: <strong>${payload.dateTime}</strong>.</p>
        ${payload.reservationCode ? `<p><strong>Codigo de transaccion:</strong> ${payload.reservationCode}</p>` : ''}
        <div style="background-color: #fcfbf9; padding: 15px; border-left: 4px solid #D5BDA9; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Importante:</p>
          <p style="margin: 5px 0 0 0;">Tienes <strong>30 minutos</strong> para completar la consignacion y reportar el comprobante.</p>
        </div>
        <p>${copy.followUp}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Saludos,<br/>Equipo de soporte</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Pending ${saleType} to: ${payload.toEmail}`);
    } catch (error) {
        console.error('Error sending pending email:', error);
    }
}

export async function sendApprovedSaleEmail(payload: ApprovedSaleEmailPayload) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const saleType = payload.saleType || 'service';
    const copy = getApprovedCopy(saleType, payload.itemName, payload.meetingLink || '');

    const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: payload.toEmail,
        subject: copy.subject,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #a4c9b3; text-align: center;">Pago validado</h2>
        <p>Hola ${payload.clientName},</p>
        <p>${copy.body}</p>
        <p>Referencia: <strong>${payload.itemName}</strong>.</p>
        <p>Fecha asociada: <strong>${payload.dateTime}</strong>.</p>
        ${copy.extra}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Nos vemos pronto.<br/>Equipo de soporte</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Approved ${saleType} to: ${payload.toEmail}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

export async function sendPendingReservationEmail(
    toEmail: string,
    clientName: string,
    serviceName: string,
    dateTime: string,
    reservationCode = ''
) {
    return sendPendingSaleEmail({
        toEmail,
        clientName,
        itemName: serviceName,
        dateTime,
        reservationCode,
        saleType: 'service',
    });
}

export async function sendConfirmationEmail(
    toEmail: string,
    clientName: string,
    serviceName: string,
    dateTime: string,
    meetingLink = ''
) {
    return sendApprovedSaleEmail({
        toEmail,
        clientName,
        itemName: serviceName,
        dateTime,
        meetingLink,
        saleType: 'service',
    });
}

type AdminProofPayload = {
    eventId: string;
    reservationCode: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    dateTime: string;
    paymentNote: string;
    filename: string;
    contentType: string;
    content: Buffer;
    saleType?: SaleType;
};

export async function sendAdminPaymentProofEmail(payload: AdminProofPayload) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0) {
        console.error('[Mailer Config Error] Faltan ADMIN_EMAILS para notificar comprobantes.');
        return;
    }

    const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: adminEmails.join(','),
        subject: `Pago reportado por cliente - ${payload.serviceName}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 640px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #D5BDA9; text-align: center;">Nuevo comprobante recibido</h2>
                <p><strong>Tipo de venta:</strong> ${getSaleTypeLabel(payload.saleType || 'service')}</p>
        <p><strong>Reserva ID:</strong> ${payload.eventId}</p>
        <p><strong>Codigo de reserva:</strong> ${payload.reservationCode || 'No disponible'}</p>
        <p><strong>Cliente:</strong> ${payload.clientName}</p>
        <p><strong>Email:</strong> ${payload.clientEmail}</p>
        <p><strong>Servicio:</strong> ${payload.serviceName}</p>
        <p><strong>Fecha reservada:</strong> ${payload.dateTime}</p>
        <p><strong>Nota del cliente:</strong> ${payload.paymentNote || 'Sin nota adicional'}</p>
        <p>Se adjunta comprobante para validacion manual en banco y aprobacion desde el portal.</p>
      </div>
    `,
        attachments: [
            {
                filename: payload.filename,
                content: payload.content,
                contentType: payload.contentType,
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Payment proof to admins: ${adminEmails.join(',')}`);
    } catch (error) {
        console.error('Error sending admin payment proof email:', error);
    }
}
