import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend üzerinden tek bir email gönderir; API anahtarı yoksa kontrollü şekilde hata verir.
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY tanımlı değil');
  const result = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? 'Zyqwax ID <onboarding@resend.dev>', to, subject, html });
  if (result.error) throw new Error(result.error.message);
}
