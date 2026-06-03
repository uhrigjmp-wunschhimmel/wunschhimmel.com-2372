import { Hono } from 'hono';
import { Resend } from 'resend';

type Bindings = {
  RESEND_API_KEY: string;
};

const contactRoute = new Hono<{ Bindings: Bindings }>();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validate(body: unknown): { name: string; email: string; message: string } | null {
  if (!body || typeof body !== 'object') return null;
  const { name, email, message } = body as Record<string, unknown>;
  if (
    typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000
  ) return null;
  return { name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() };
}

contactRoute.post('/', async (c) => {
  const resend = new Resend(c.env.RESEND_API_KEY);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Ungültige Anfrage.' }, 400);
  }

  const data = validate(body);
  if (!data) {
    return c.json({ error: 'Bitte fülle alle Felder korrekt aus.' }, 400);
  }

  const { name, email, message } = data;

  try {
    const { error } = await resend.emails.send({
      from: 'Wunschhimmel <no-reply@wunschhimmel.com>',
      to: ['kontakt@wunschhimmel.com'],
      replyTo: email,
      subject: `Kontaktanfrage: ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;color:#1a1a3e;">
          <h2 style="color:#e84393;margin-top:0;">Neue Kontaktanfrage</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <hr style="border:none;border-top:1px solid #ddd5f0;margin:16px 0;" />
          <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return c.json({ error: 'E-Mail konnte nicht gesendet werden.' }, 500);
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return c.json({ error: 'Serverfehler. Bitte versuche es später.' }, 500);
  }
});

export { contactRoute };
