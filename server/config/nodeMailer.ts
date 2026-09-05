import { createTransport } from "nodemailer";

// Create a transporter using SMTP
const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
}

const sendEmail = async ({ to, subject, body }: SendEmailOptions) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL || '"GrocerNet" <noreply@grocernet.com>',
        to,
        subject,
        html: body,
    });
    return response;
};

export default sendEmail;
