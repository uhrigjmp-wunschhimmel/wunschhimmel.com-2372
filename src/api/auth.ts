import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import * as schema from "./database/schema";

const db = drizzle(env.DB, { schema });

export const createAuth = (baseURL: string) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }) {
        const resend = new Resend(env.RESEND_API_KEY);
        const firstName = user.name?.split(" ")[0] || "dort";
        await resend.emails.send({
          from: "Wunschhimmel <noreply@wunschhimmel.com>",
          to: user.email,
          subject: "Passwort zurücksetzen – Wunschhimmel",
          html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Passwort zurücksetzen</title></head>
<body style="margin:0;padding:0;background-color:#fdf4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf4f5;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#FF6B8A 0%,#FF8FA3 100%);padding:40px 40px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:32px;">🌸</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Wunschhimmel</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">Hallo ${firstName},</h2>
          <p style="margin:0 0 16px;color:#4a4a68;font-size:15px;line-height:1.6;">
            wir haben eine Anfrage erhalten, das Passwort für dein Wunschhimmel-Konto zurückzusetzen.
          </p>
          <p style="margin:0 0 28px;color:#4a4a68;font-size:15px;line-height:1.6;">
            Klicke auf den Button unten, um ein neues Passwort zu vergeben. Der Link ist <strong>1 Stunde</strong> gültig.
          </p>

          <!-- CTA Button -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:28px;">
              <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#FF6B8A 0%,#FF8FA3 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                Passwort jetzt zurücksetzen
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 12px;color:#8888aa;font-size:13px;line-height:1.6;">
            Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
          </p>
          <p style="margin:0 0 28px;word-break:break-all;">
            <a href="${url}" style="color:#FF6B8A;font-size:12px;">${url}</a>
          </p>

          <hr style="border:none;border-top:1px solid #f0e8ea;margin:0 0 24px;">

          <p style="margin:0;color:#aaaacc;font-size:13px;line-height:1.6;">
            Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fdf4f5;padding:24px 40px;text-align:center;border-top:1px solid #f0e8ea;">
          <p style="margin:0;color:#aaaacc;font-size:12px;">© 2025 Wunschhimmel · <a href="https://wunschhimmel.com" style="color:#FF6B8A;text-decoration:none;">wunschhimmel.com</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: async (request) => {
      const origin = request?.headers.get("origin");
      if (origin) return [origin];
      return [];
    },
  });

// Static export for CLI schema generation
export const auth = createAuth("http://localhost:6976");
