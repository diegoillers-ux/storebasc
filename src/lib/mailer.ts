import nodemailer from 'nodemailer';

function getMailerConfigError() {
    if (!process.env.GMAIL_USER) return 'Falta GMAIL_USER en variables de entorno.';
    if (!process.env.GMAIL_APP_PASSWORD) return 'Falta GMAIL_APP_PASSWORD en variables de entorno.';
    return null;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendPendingReservationEmail(toEmail: string, clientName: string, serviceName: string, dateTime: string) {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const mailOptions = {
        from: `"Ananda" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Reserva pendiente de pago - ${serviceName}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #D5BDA9; text-align: center;">Hola ${clientName}</h2>
        <p>Gracias por elegir Ananda para tu sesion de <strong>${serviceName}</strong>.</p>
        <p>Hemos separado tu cupo para el <strong>${dateTime}</strong>.</p>
        <div style="background-color: #fcfbf9; padding: 15px; border-left: 4px solid #D5BDA9; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Importante:</p>
          <p style="margin: 5px 0 0 0;">Este es un bloqueo temporal. Tienes <strong>30 minutos</strong> para realizar la transferencia bancaria y asegurar tu espacio. Si no, el sistema liberara la hora automaticamente.</p>
        </div>
        <p>Si ya realizaste el pago, ignora este mensaje. Recibiras confirmacion cuando validemos la transferencia.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Con amor,<br/>El equipo de Ananda</p>
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

export async function sendConfirmationEmail(toEmail: string, clientName: string, serviceName: string, dateTime: string, meetingLink = '') {
    const configError = getMailerConfigError();
    if (configError) {
        console.error(`[Mailer Config Error] ${configError}`);
        return;
    }

    const extraInfo = meetingLink
        ? `<p>Aqui tienes el enlace para conectarnos ese dia:<br/><br/><a href="${meetingLink}" style="background-color: #D5BDA9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Unirse a Google Meet</a></p>`
        : '<p>Nos pondremos en contacto contigo pronto con el enlace o la direccion del encuentro.</p>';

    const mailOptions = {
        from: `"Ananda" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Cita confirmada - ${serviceName}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
        <h2 style="color: #a4c9b3; text-align: center;">Transferencia recibida</h2>
        <p>Hola ${clientName},</p>
        <p>Hemos verificado tu pago. Tu sesion de <strong>${serviceName}</strong> para el <strong>${dateTime}</strong> ya fue confirmada.</p>
        ${extraInfo}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 0.8em; color: #888; text-align: center;">Nos vemos pronto.<br/>El equipo de Ananda</p>
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