const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const fromName = process.env.FROM_NAME || 'RIDEHUB';
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;

        const message = {
            from: `"${fromName}" <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
            attachments: options.attachments
        };

        console.log(`Attempting to send email to: ${options.email} with subject: ${options.subject}`);

        const info = await transporter.sendMail(message);
        console.log('Email sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw error;
    }
};

module.exports = sendEmail;
