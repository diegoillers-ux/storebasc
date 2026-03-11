import nodemailer from 'nodemailer';

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

export async function sendPendingReservationEmail(
    toEmail: string,
    clientName: string,
    serviceName: string,
    dateTime: string,
    reservationCode = ''
) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Reserva pendiente de pago - ${serviceName}${reservationCode ? ` (${reservationCode})` : ''}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #D5BDA9; text-align: center;">Hola ${clientName}</h2>
        <p>Gracias por reservar con nuestra tienda tu sesion de <strong>${serviceName}</strong>.</p>
        <p>Hemos separado tu cupo para el <strong>${dateTime}</strong>.</p>
        ${reservationCode ? `<p><strong>Codigo de reserva:</strong> ${reservationCode}</p>` : ''}
        <div style="background-color: #fcfbf9; padding: 15px; border-left: 4px solid #D5BDA9; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Importante:</p>
          <p style="margin: 5px 0 0 0;">Este es un bloqueo temporal. Tienes <strong>30 minutos</strong> para realizar la transferencia y asegurar tu espacio. Si no, el sistema liberara la hora automaticamente.</p>
        </div>
        <p>Si ya realizaste el pago, usa el boton de confirmacion en pantalla y adjunta el comprobante.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Saludos,<br/>Equipo de soporte</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Pending reservation to: ${toEmail}`);
    } catch (error) {
        console.error('Error sending pending email:', error);
    }
}

export async function sendConfirmationEmail(
    toEmail: string,
    clientName: string,
    serviceName: string,
    dateTime: string,
    meetingLink = ''
) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const extraInfo = meetingLink
        ? `<p>Aqui tienes el enlace para conectarnos ese dia:<br/><br/><a href="${meetingLink}" style="background-color: #D5BDA9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Unirse a la sesion</a></p>`
        : '<p>Recibiras por correo los detalles finales de la atencion.</p>';

    const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Reserva confirmada - ${serviceName}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #a4c9b3; text-align: center;">Pago validado</h2>
        <p>Hola ${clientName},</p>
        <p>Hemos verificado tu pago. Tu sesion de <strong>${serviceName}</strong> para el <strong>${dateTime}</strong> ya fue confirmada.</p>
        ${extraInfo}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Nos vemos pronto.<br/>Equipo de soporte</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Confirmation to: ${toEmail}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
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
