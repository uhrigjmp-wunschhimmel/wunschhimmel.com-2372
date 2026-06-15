import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc, sql as drizzleSql, count, gte, inArray } from "drizzle-orm";
import { createAuth } from "./auth";
import { authMiddleware, authenticatedOnly, adminOnly } from "./middleware/authentication";
import { wishlists, wishes, shareInvitations, userProfiles, listUpdates, updateLikes, updateComments } from "./database/schema";

import { Resend } from "resend";
import * as schema from "./database/schema";
import { agentRoutes } from "./routes/agent";
import { contactRoute } from './routes/contact.route';

type Bindings = { DB: D1Database; BETTER_AUTH_SECRET: string; RUNABLE_URL: string; RESEND_API_KEY: string; BUCKET: R2Bucket };
type Variables = { user: any; session: any };

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath("api");

app.use(cors({ origin: "*", credentials: true }));
app.use("*", authMiddleware);

app.route("/agent", agentRoutes);
app.route('/contact', contactRoute);

// ── Auth routes ──────────────────────────────────────────────────────────────
app.all("/auth/*", async (c) => {
  const auth = createAuth(`${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`);
  return auth.handler(c.req.raw);
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function nanoid(len = 21) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// ── Scrape product URL for metadata ─────────────────────────────────────────
app.post("/scrape", authenticatedOnly, async (c) => {
  const { url } = await c.req.json<{ url: string }>();
  if (!url) return c.json({ error: "url required" }, 400);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const getMeta = (property: string) => {
      const m =
        html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i")) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i")) ||
        html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i")) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i"));
      return m ? m[1] : null;
    };

    // Title: og:title → meta[name=title] → <title>
    const title =
      getMeta("og:title") ||
      getMeta("title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      "";

    // Image: og:image → twitter:image → Amazon data-old-hires → landingImage
    let image =
      getMeta("og:image") ||
      getMeta("twitter:image") ||
      "";

    if (!image) {
      const hiresMatch = html.match(/data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/);
      if (hiresMatch) {
        image = hiresMatch[1];
      } else {
        const landingMatch = html.match(/id="landingImage"[^>]*src="([^"]+)"/);
        if (landingMatch) image = landingMatch[1];
      }
    }

    // Price: Amazon-spezifisch → itemprop → JSON-LD (neben priceCurrency)
    let price: number | null = null;

    // Amazon: Ganzzahl + Nachkommastellen getrennt in a-price-whole / a-price-fraction
    // Suche im corePrice-Bereich oder apex_desktop-Bereich
    const amazonSection =
      html.match(/id="corePrice_feature_div"([\s\S]{0,1000})/) ||
      html.match(/id="apex_desktop"([\s\S]{0,1200})/);

    if (amazonSection) {
      const section = amazonSection[1];
      const wholeMatch = section.match(/a-price-whole[^>]*>\s*(\d+)/);
      const fracMatch = section.match(/a-price-fraction[^>]*>\s*(\d+)/);
      if (wholeMatch) {
        const whole = wholeMatch[1];
        const frac = fracMatch ? fracMatch[1].padEnd(2, "0") : "00";
        price = parseFloat(`${whole}.${frac}`);
      }
    }

    if (price === null) {
      // Fallback 1: itemprop="price" content="..."
      const itempropMatch = html.match(/itemprop="price"[^>]*content="([\d.,]+)"/);
      if (itempropMatch) {
        price = parseFloat(itempropMatch[1].replace(",", "."));
      }
    }

    if (price === null) {
      // Fallback 2: JSON-LD — nur Schema.org Offer mit explizitem priceCurrency direkt daneben
      // Sehr streng: nur wenn price UND priceCurrency innerhalb von 30 Zeichen nebeneinander stehen
      const jsonLdMatch =
        html.match(/"price"\s*:\s*"([\d.]+)"\s*,\s*"priceCurrency"/) ||
        html.match(/"priceCurrency"\s*:\s*"[A-Z]{3}"\s*,\s*"price"\s*:\s*"([\d.]+)"/);
      if (jsonLdMatch) {
        const candidate = parseFloat(jsonLdMatch[1]);
        // Nur akzeptieren wenn realistischer Produktpreis (0.50 - 9999)
        if (candidate >= 0.5 && candidate <= 9999) {
          price = candidate;
        }
      }
    }

    const description = getMeta("og:description") || getMeta("description") || "";

    return c.json({ title, image, price, description });
  } catch {
    return c.json({ title: "", image: "", price: null, description: "" });
  }
});

// ── Wishlists ─────────────────────────────────────────────────────────────────
app.get("/wishlists", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const lists = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, user.id))
    .orderBy(desc(wishlists.createdAt));
  return c.json(lists);
});

app.post("/wishlists", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const { title, description, emoji, isPublic } = await c.req.json<{
    title: string;
    description?: string;
    emoji?: string;
    isPublic?: boolean;
  }>();
  if (!title) return c.json({ error: "title required" }, 400);
  const id = nanoid();
  const shareToken = nanoid(32);
  await db.insert(wishlists).values({
    id,
    userId: user.id,
    title,
    description: description || null,
    emoji: emoji || "🎁",
    isPublic: isPublic || false,
    shareToken,
  });
  const list = await db.select().from(wishlists).where(eq(wishlists.id, id)).get();
  return c.json(list, 201);
});

app.get("/wishlists/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  if (list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const items = await db.select().from(wishes).where(eq(wishes.wishlistId, list.id)).orderBy(desc(wishes.createdAt));
  return c.json({ ...list, wishes: items });
});

app.patch("/wishlists/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  if (list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const body = await c.req.json<{ title?: string; description?: string; emoji?: string; isPublic?: boolean }>();
 if (typeof body.isPublic === "boolean" && body.isPublic !== list.isPublic) {
    await db.insert(schema.publicListConsents).values({
      id: nanoid(),
      userId: user.id,
      wishlistId: list.id,
      action: body.isPublic ? "granted" : "revoked",
      ip: c.req.header("cf-connecting-ip") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
   });
    }
  await db.update(wishlists).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(wishlists.id, list.id));
  const updated = await db.select().from(wishlists).where(eq(wishlists.id, list.id)).get();
  return c.json(updated);
});

app.delete("/wishlists/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  if (list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  await db.delete(wishes).where(eq(wishes.wishlistId, list.id));
  await db.delete(wishlists).where(eq(wishlists.id, list.id));
  return c.json({ success: true });
});

// ── Amazon Affiliate helper ───────────────────────────────────────────────────
const AMAZON_AFFILIATE_TAG = "wunschhimme00-21";
const AMAZON_DOMAINS = /^(www\.)?(amazon\.(de|com|co\.uk|fr|it|es|nl|pl|se|co\.jp|ca|com\.au|com\.br|com\.mx|in|sg|ae|sa|com\.tr)|(amzn\.(to|eu)))/i;

function injectAmazonTag(url: string): string {
  try {
    const u = new URL(url);
    if (!AMAZON_DOMAINS.test(u.hostname)) return url;
    if (u.hostname.includes("amzn.to") || u.hostname.includes("amzn.eu")) return url;
    u.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
    u.searchParams.delete("ref");
    return u.toString();
  } catch {
    return url;
  }
}

// ── Wishes ────────────────────────────────────────────────────────────────────
app.post("/wishlists/:id/wishes", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  if (list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const body = await c.req.json<{
    title: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    productUrl?: string;
    url?: string;
    note?: string;
    priority?: string;
  }>();
  if (!body.title) return c.json({ error: "title required" }, 400);
  // Support both "url" and "productUrl" field names
  if (body.url && !body.productUrl) body.productUrl = body.url;
  if (body.productUrl) body.productUrl = injectAmazonTag(body.productUrl);
  const id = nanoid();
  await db.insert(wishes).values({ id, wishlistId: list.id, ...body });
  const wish = await db.select().from(wishes).where(eq(wishes.id, id)).get();
  return c.json(wish, 201);
});

app.patch("/wishes/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const wish = await db.select().from(wishes).where(eq(wishes.id, c.req.param("id"))).get();
  if (!wish) return c.json({ error: "not found" }, 404);
  const list = await db.select().from(wishlists).where(eq(wishlists.id, wish.wishlistId)).get();
  if (!list || list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const body = await c.req.json();
  if (body.productUrl) body.productUrl = injectAmazonTag(body.productUrl);
  await db.update(wishes).set(body).where(eq(wishes.id, wish.id));
  const updated = await db.select().from(wishes).where(eq(wishes.id, wish.id)).get();
  return c.json(updated);
});

app.delete("/wishes/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const wish = await db.select().from(wishes).where(eq(wishes.id, c.req.param("id"))).get();
  if (!wish) return c.json({ error: "not found" }, 404);
  const list = await db.select().from(wishlists).where(eq(wishlists.id, wish.wishlistId)).get();
  if (!list || list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  await db.delete(wishes).where(eq(wishes.id, wish.id));
  return c.json({ success: true });
});

// ── Email share ───────────────────────────────────────────────────────────────
app.post("/wishlists/:id/share", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  if (list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const { emails, message } = await c.req.json<{ emails: string[]; message?: string }>();
  if (!emails?.length) return c.json({ error: "emails required" }, 400);

  const baseUrl = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`;
  const shareUrl = `${baseUrl}/shared/${list.shareToken}`;

  for (const email of emails) {
    await db.insert(shareInvitations).values({
      id: nanoid(),
      wishlistId: list.id,
      sentByUserId: user.id,
      recipientEmail: email,
    });
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Wunschhimmel <inspiration@wunschhimmel.com>",
      to: email,
      subject: `${user.name || "Jemand"} hat eine Wunschliste mit dir geteilt 🎁`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FFF8F0; border-radius: 16px; overflow: hidden;">
          <div style="background: #1A1A4E; padding: 32px; text-align: center;">
            <h1 style="color: #FFD6D6; font-family: Georgia, serif; font-size: 28px; margin: 0;">✨ Wunschhimmel</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1A1A4E; font-family: Georgia, serif;">${user.name || "Jemand"} teilt eine Wunschliste mit dir</h2>
            <p style="color: #6B6B9A;">${list.emoji} <strong>${list.title}</strong></p>
            ${message ? `<p style="color: #444; background: #FFD6D6; padding: 16px; border-radius: 12px; font-style: italic;">"${message}"</p>` : ""}
            <a href="${shareUrl}" style="display: inline-block; background: #FF6B8A; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 16px;">Wunschliste ansehen 🎁</a>
          </div>
          <div style="padding: 16px 32px; text-align: center; color: #aaa; font-size: 12px;">
            Du kannst Wünsche reservieren damit keine doppelten Geschenke entstehen.
          </div>
        </div>
      `,
    });
  }
  return c.json({ success: true, sent: emails.length });
});

// ── Public list view (by share token) ────────────────────────────────────────
app.get("/shared/:token", async (c) => {
  const db = drizzle(env.DB, { schema });
  const list = await db.select().from(wishlists).where(eq(wishlists.shareToken, c.req.param("token"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  const items = await db.select().from(wishes).where(eq(wishes.wishlistId, list.id)).orderBy(desc(wishes.createdAt));

  // Prüfen ob Nutzer eingeloggt ist
  const user = c.get("user");
  const isLoggedIn = !!user;

  // Profildaten nur für eingeloggte Nutzer laden
let ownerProfile = null;
let ownerUser = null;
if (isLoggedIn && list.isPublic) {
  const { user: authUser } = await import("./database/auth-schema");
  ownerProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, list.userId)).get();
  ownerUser = await db.select({ name: authUser.name }).from(authUser).where(eq(authUser.id, list.userId)).get();
}

return c.json({
  ...list,
  wishes: items,
  ownerName: isLoggedIn ? ownerUser?.name ?? null : null,
  ownerAvatar: isLoggedIn ? ownerProfile?.avatarUrl ?? null : null,
});
});

// ── Reserve a wish (public, no auth) ─────────────────────────────────────────
app.post("/shared/:token/wishes/:wishId/reserve", async (c) => {
  const db = drizzle(env.DB, { schema });
  const list = await db.select().from(wishlists).where(eq(wishlists.shareToken, c.req.param("token"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  const wish = await db.select().from(wishes).where(
    and(eq(wishes.id, c.req.param("wishId")), eq(wishes.wishlistId, list.id))
  ).get();
  if (!wish) return c.json({ error: "not found" }, 404);
  if (wish.isReserved) return c.json({ error: "already reserved" }, 409);
  const { name } = await c.req.json<{ name: string }>();
  await db.update(wishes).set({
    isReserved: true,
    reservedByName: name || "Anonym",
    reservedAt: new Date().toISOString(),
  }).where(eq(wishes.id, wish.id));

  try {
    const { user: authUser } = await import("./database/auth-schema");
    const owner = await db.select().from(authUser).where(eq(authUser.id, list.userId)).get();
    if (owner?.email) {
      const baseUrl = `${new URL(c.req.url).protocol}//${new URL(c.req.url).host}`;
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Wunschhimmel <noreply@wunschhimmel.com>",
        to: owner.email,
        subject: `🎁 Jemand hat einen deiner Wünsche reserviert!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FFF8F0; border-radius: 16px; overflow: hidden;">
            <div style="background: #1A1A4E; padding: 32px; text-align: center;">
              <h1 style="color: #FFD6D6; font-family: Georgia, serif; font-size: 24px; margin: 0;">✨ Wunschhimmel</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1A1A4E; font-family: Georgia, serif;">Ein Wunsch wurde reserviert! 🎉</h2>
              <p style="color: #6B6B9A;"><strong>${name || "Jemand"}</strong> hat <strong>${wish.title}</strong> aus deiner Liste <strong>${list.emoji} ${list.title}</strong> reserviert.</p>
              <a href="${baseUrl}/list/${list.id}" style="display: inline-block; background: #FF6B8A; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 16px;">Liste ansehen</a>
            </div>
          </div>
        `,
      });
    }
  } catch { /* email errors don't block the response */ }

  return c.json({ success: true });
});

// ── Unreserve a wish ──────────────────────────────────────────────────────────
app.post("/shared/:token/wishes/:wishId/unreserve", async (c) => {
  const db = drizzle(env.DB, { schema });
  const list = await db.select().from(wishlists).where(eq(wishlists.shareToken, c.req.param("token"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  const wish = await db.select().from(wishes).where(
    and(eq(wishes.id, c.req.param("wishId")), eq(wishes.wishlistId, list.id))
  ).get();
  if (!wish) return c.json({ error: "not found" }, 404);
  await db.update(wishes).set({ isReserved: false, reservedByName: null, reservedAt: null }).where(eq(wishes.id, wish.id));
  return c.json({ success: true });
});

// ── Explore public lists ──────────────────────────────────────────────────────
app.get("/explore", async (c) => {
  const db = drizzle(env.DB, { schema });
  const lists = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.isPublic, true))
    .orderBy(desc(wishlists.createdAt))
    .limit(50);

  const user = c.get("user");
  const isLoggedIn = !!user;

  if (!isLoggedIn) return c.json(lists);

  const { user: authUser } = await import("./database/auth-schema");
  const enriched = await Promise.all(lists.map(async (list) => {
    const ownerUser = await db.select({ name: authUser.name }).from(authUser).where(eq(authUser.id, list.userId)).get();
   const ownerProfile = await db.select({ avatarUrl: userProfiles.avatarUrl }).from(userProfiles).where(eq(userProfiles.userId, list.userId)).get();
const wishCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(wishes).where(eq(wishes.wishlistId, list.id)).get();
return {
  ...list,
  ownerName: ownerUser?.name ?? null,
  ownerAvatar: ownerProfile?.avatarUrl ?? null,
  wishCount: wishCount?.count ?? 0,
};
  }));
  return c.json(enriched);
});

// ── User profile / theme ──────────────────────────────────────────────────────
app.get("/profile", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  let profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  if (profile && user.email === "kontakt@wunschhimmel.com" && !profile.isAdmin) {
    await db.update(userProfiles).set({ isAdmin: true }).where(eq(userProfiles.userId, user.id));
    profile = { ...profile, isAdmin: true };
  }
  return c.json(profile || { userId: user.id, theme: "rose", isAdmin: false });
});

app.post("/profile/theme", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const { theme } = await c.req.json<{ theme: string }>();
  if (!["rose", "teal"].includes(theme)) return c.json({ error: "invalid theme" }, 400);
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  if (existing) {
    await db.update(userProfiles).set({ theme }).where(eq(userProfiles.userId, user.id));
  } else {
    await db.insert(userProfiles).values({ userId: user.id, theme });
  }
  return c.json({ theme });
});

app.post("/profile/init", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const { theme } = await c.req.json<{ theme: string }>();
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  const isAdmin = user.email === "kontakt@wunschhimmel.com";
  if (!existing) {
    await db.insert(userProfiles).values({ userId: user.id, theme: ["rose", "teal"].includes(theme) ? theme : "rose", isAdmin });
  } else if (isAdmin && !existing.isAdmin) {
    await db.update(userProfiles).set({ isAdmin: true }).where(eq(userProfiles.userId, user.id));
  }
  return c.json({ theme });
});

// ── Wish image upload ─────────────────────────────────────────────────────────
app.post("/wishes/:id/image", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const wish = await db.select().from(wishes).where(eq(wishes.id, c.req.param("id"))).get();
  if (!wish) return c.json({ error: "not found" }, 404);
  const list = await db.select().from(wishlists).where(eq(wishlists.id, wish.wishlistId)).get();
  if (!list || list.userId !== user.id) return c.json({ error: "forbidden" }, 403);

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "file required" }, 400);

  const ext = file.name.split(".").pop() || "jpg";
  const key = `wishes/${wish.id}.${ext}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  const imageUrl = `/api/files/${key}`;
  await db.update(wishes).set({ imageUrl }).where(eq(wishes.id, wish.id));
  return c.json({ imageUrl });
});

// ── Avatar upload ─────────────────────────────────────────────────────────────
app.post("/profile/avatar", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "file required" }, 400);

  const ext = file.name.split(".").pop() || "jpg";
  const key = `avatars/${user.id}.${ext}`;
  const buffer = await file.arrayBuffer();
  await env.BUCKET.put(key, buffer, { httpMetadata: { contentType: file.type } });

  const avatarUrl = `/api/files/${key}`;
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  if (existing) {
    await db.update(userProfiles).set({ avatarUrl }).where(eq(userProfiles.userId, user.id));
  } else {
    await db.insert(userProfiles).values({ userId: user.id, theme: "rose", avatarUrl });
  }
  return c.json({ avatarUrl });
});

// ── Serve R2 files ────────────────────────────────────────────────────────────
app.get("/files/*", async (c) => {
  const key = c.req.path.replace("/api/files/", "");
  const obj = await env.BUCKET.get(key);
  if (!obj) return c.json({ error: "not found" }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000");
  return new Response(obj.body, { headers });
});

// ── Public profile ────────────────────────────────────────────────────────────
app.get("/users/:userId/profile", async (c) => {
  const db = drizzle(env.DB, { schema });
  const { user: authUser } = await import("./database/auth-schema");
  const [u, profile] = await Promise.all([
    db.select({ id: authUser.id, name: authUser.name }).from(authUser).where(eq(authUser.id, c.req.param("userId"))).get(),
    db.select().from(userProfiles).where(eq(userProfiles.userId, c.req.param("userId"))).get(),
  ]);
  if (!u) return c.json({ error: "not found" }, 404);
  return c.json({ ...u, avatarUrl: profile?.avatarUrl || null, bio: profile?.bio || null });
});

// ── List updates (celebration posts) ─────────────────────────────────────────
app.get("/wishlists/:id/updates", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list || list.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  const updates = await db.select().from(listUpdates).where(eq(listUpdates.wishlistId, list.id)).orderBy(desc(listUpdates.createdAt));
  return c.json(updates);
});

app.post("/wishlists/:id/updates", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const list = await db.select().from(wishlists).where(eq(wishlists.id, c.req.param("id"))).get();
  if (!list || list.userId !== user.id) return c.json({ error: "forbidden" }, 403);

  const formData = await c.req.formData();
  const text = formData.get("text") as string;
  const file = formData.get("photo") as File | null;
  if (!text?.trim()) return c.json({ error: "text required" }, 400);

  let photoUrl: string | null = null;
  if (file && file.size > 0) {
    const id = nanoid();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `updates/${id}.${ext}`;
    await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    photoUrl = `/api/files/${key}`;
  }

  const updateId = nanoid();
  await db.insert(listUpdates).values({ id: updateId, wishlistId: list.id, userId: user.id, text, photoUrl });
  const update = await db.select().from(listUpdates).where(eq(listUpdates.id, updateId)).get();
  return c.json(update, 201);
});

app.delete("/updates/:id", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const update = await db.select().from(listUpdates).where(eq(listUpdates.id, c.req.param("id"))).get();
  if (!update) return c.json({ error: "not found" }, 404);
  if (update.userId !== user.id) return c.json({ error: "forbidden" }, 403);
  await db.delete(listUpdates).where(eq(listUpdates.id, update.id));
  return c.json({ success: true });
});

// ── Public updates (via share token) ─────────────────────────────────────────
app.get("/shared/:token/updates", async (c) => {
  const db = drizzle(env.DB, { schema });
  const list = await db.select().from(wishlists).where(eq(wishlists.shareToken, c.req.param("token"))).get();
  if (!list) return c.json({ error: "not found" }, 404);
  const updates = await db.select().from(listUpdates).where(eq(listUpdates.wishlistId, list.id)).orderBy(desc(listUpdates.createdAt));
  const enriched = await Promise.all(updates.map(async (u) => {
    const likes = await db.select().from(updateLikes).where(eq(updateLikes.updateId, u.id));
    const comments = await db.select().from(updateComments).where(eq(updateComments.updateId, u.id)).orderBy(desc(updateComments.createdAt));
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, u.userId)).get();
    return { ...u, likeCount: likes.length, likes, comments, avatarUrl: profile?.avatarUrl || null };
  }));
  return c.json(enriched);
});

// ── Likes ─────────────────────────────────────────────────────────────────────
app.post("/updates/:id/like", async (c) => {
  const db = drizzle(env.DB, { schema });
  const update = await db.select().from(listUpdates).where(eq(listUpdates.id, c.req.param("id"))).get();
  if (!update) return c.json({ error: "not found" }, 404);
  const { name } = await c.req.json<{ name: string }>();
  await db.insert(updateLikes).values({ id: nanoid(), updateId: update.id, likerName: name || "Anonym" });
  const count = (await db.select().from(updateLikes).where(eq(updateLikes.updateId, update.id))).length;
  return c.json({ likeCount: count });
});

// ── Comments ──────────────────────────────────────────────────────────────────
app.post("/updates/:id/comments", async (c) => {
  const db = drizzle(env.DB, { schema });
  const update = await db.select().from(listUpdates).where(eq(listUpdates.id, c.req.param("id"))).get();
  if (!update) return c.json({ error: "not found" }, 404);
  const { authorName, text } = await c.req.json<{ authorName: string; text: string }>();
  if (!text?.trim()) return c.json({ error: "text required" }, 400);
  const id = nanoid();
  await db.insert(updateComments).values({ id, updateId: update.id, authorName: authorName || "Anonym", text });
  const comment = await db.select().from(updateComments).where(eq(updateComments.id, id)).get();
  return c.json(comment, 201);
});

// ── Global feed (public updates) ──────────────────────────────────────────────
app.get("/feed", async (c) => {
  const db = drizzle(env.DB, { schema });
  const publicLists = await db.select({ id: wishlists.id, title: wishlists.title, emoji: wishlists.emoji, shareToken: wishlists.shareToken, userId: wishlists.userId })
    .from(wishlists).where(eq(wishlists.isPublic, true));
  const publicListIds = publicLists.map(l => l.id);
  if (!publicListIds.length) return c.json([]);

  const allUpdates = await db.select().from(listUpdates).orderBy(desc(listUpdates.createdAt)).limit(50);
  const filtered = allUpdates.filter(u => publicListIds.includes(u.wishlistId));

  const { user: authUser } = await import("./database/auth-schema");
  const enriched = await Promise.all(filtered.map(async (u) => {
    const list = publicLists.find(l => l.id === u.wishlistId)!;
    const likes = await db.select().from(updateLikes).where(eq(updateLikes.updateId, u.id));
    const comments = await db.select().from(updateComments).where(eq(updateComments.updateId, u.id)).orderBy(desc(updateComments.createdAt));
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, u.userId)).get();
    const owner = await db.select({ name: authUser.name }).from(authUser).where(eq(authUser.id, u.userId)).get();
    return { ...u, list, likeCount: likes.length, likes, comments, avatarUrl: profile?.avatarUrl || null, ownerName: owner?.name || "Anonym" };
  }));
  return c.json(enriched);
});

// ── Admin stats ───────────────────────────────────────────────────────────────
app.get("/admin/stats", authenticatedOnly, adminOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const { user: authUser } = await import("./database/auth-schema");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    allUsers, allWishlists, allWishes, allShares, allUpdates, allLikes, allComments, recentWishlists, publicLists,
  ] = await Promise.all([
    db.select({ id: authUser.id, name: authUser.name, email: authUser.email, createdAt: authUser.createdAt }).from(authUser).all(),
    db.select().from(wishlists).all(),
    db.select().from(wishes).all(),
    db.select().from(shareInvitations).all(),
    db.select().from(listUpdates).all(),
    db.select().from(updateLikes).all(),
    db.select().from(updateComments).all(),
    db.select({ userId: wishlists.userId, updatedAt: wishlists.updatedAt }).from(wishlists).where(gte(wishlists.updatedAt, thirtyDaysAgo)).all(),
    db.select({ id: wishlists.id }).from(wishlists).where(eq(wishlists.isPublic, true)).all(),
  ]);

  const regsByDay: Record<string, number> = {};
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  for (const u of allUsers) {
    const d = new Date(u.createdAt as string);
    if (d >= cutoff) {
      const key = d.toISOString().slice(0, 10);
      regsByDay[key] = (regsByDay[key] || 0) + 1;
    }
  }
  const registrationsByDay = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    registrationsByDay.push({ date: key, count: regsByDay[key] || 0 });
  }

  const domainCounts: Record<string, number> = {};
  for (const w of allWishes) {
    if (w.productUrl) {
      try {
        const hostname = new URL(w.productUrl).hostname.replace(/^www\./, "");
        domainCounts[hostname] = (domainCounts[hostname] || 0) + 1;
      } catch { /* invalid url */ }
    }
  }
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([domain, count]) => ({ domain, count }));
  const activeUserIds = new Set(recentWishlists.map(w => w.userId));

  const userStats = allUsers.map(u => {
    const userLists = allWishlists.filter(l => l.userId === u.id);
    const wishCount = allWishes.filter(w => userLists.some(l => l.id === w.wishlistId)).length;
    const shareCount = allShares.filter(s => s.sentByUserId === u.id).length;
    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, listCount: userLists.length, wishCount, shareCount, isActive: activeUserIds.has(u.id) };
  }).sort((a, b) => b.listCount - a.listCount);

  return c.json({
    totals: {
      users: allUsers.length, wishlists: allWishlists.length, wishes: allWishes.length,
      links: allWishes.filter(w => !!w.productUrl).length, shares: allShares.length,
      publicLists: publicLists.length, updates: allUpdates.length, likes: allLikes.length,
      comments: allComments.length, activeUsers: activeUserIds.size,
    },
    registrationsByDay, topDomains, users: userStats,
  });
});

// ── Product Click Tracking ────────────────────────────────────────────────────
app.post("/track/click", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, partnerId, affiliateUrl, sessionId, recipient, occasion, budget } = body;
    if (!productId || !sessionId) return c.json({ error: "missing fields" }, 400);

    const session = c.get("session");
    const userId = session?.user?.id ?? null;
    const id = crypto.randomUUID();

    const db = drizzle(c.env.DB);
    await db.run(
      drizzleSql`INSERT INTO product_clicks (id, session_id, user_id, product_id, partner_id, affiliate_url, recipient, occasion, budget)
          VALUES (${id}, ${sessionId}, ${userId}, ${productId}, ${partnerId ?? "unknown"}, ${affiliateUrl ?? ""}, ${recipient ?? null}, ${occasion ?? null}, ${budget ?? null})`
    );

    fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": c.req.header("user-agent") ?? "" },
      body: JSON.stringify({
        domain: "wunschhimmel.de", name: "Product Click",
        url: c.req.header("referer") ?? "https://wunschhimmel.de",
        props: { productId, partnerId, occasion, recipient },
      }),
    }).catch(() => {});

    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get("/ping", (c) => c.json({ message: `Pong! ${Date.now()}` }));

app.delete("/user", authenticatedOnly, async (c) => {
  const db = drizzle(env.DB, { schema });
  const user = c.get("user");
  const userId = user.id;

  try {
    const userWishlists = await db.select({ id: wishlists.id }).from(wishlists).where(eq(wishlists.userId, userId));
    const wishlistIds = userWishlists.map((w) => w.id);

    if (wishlistIds.length > 0) {
      const userWishes = await db.select({ id: wishes.id }).from(wishes).where(inArray(wishes.wishlistId, wishlistIds));
      const userUpdates = await db.select({ id: listUpdates.id }).from(listUpdates).where(inArray(listUpdates.wishlistId, wishlistIds));
      const updateIds = userUpdates.map((u) => u.id);

      if (updateIds.length > 0) {
        for (const uid of updateIds) {
          await db.delete(updateLikes).where(eq(updateLikes.updateId, uid));
          await db.delete(updateComments).where(eq(updateComments.updateId, uid));
        }
      }

      await db.delete(listUpdates).where(inArray(listUpdates.wishlistId, wishlistIds));
      await db.delete(shareInvitations).where(inArray(shareInvitations.wishlistId, wishlistIds));

      if (userWishes.length > 0) {
        for (const w of userWishes) {
          await db.delete(wishes).where(eq(wishes.id, w.id));
        }
      }
      await db.delete(wishlists).where(eq(wishlists.userId, userId));
    }

    await db.delete(listUpdates).where(eq(listUpdates.userId, userId));
    await db.delete(shareInvitations).where(eq(shareInvitations.sentByUserId, userId));

    const profileData = await db.select({ avatarUrl: userProfiles.avatarUrl }).from(userProfiles).where(eq(userProfiles.userId, userId)).get();
    if (profileData?.avatarUrl) {
      try {
        const key = profileData.avatarUrl.replace("/api/files/", "");
        await env.BUCKET.delete(key);
      } catch { /* R2 error doesn't block */ }
    }

    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));

    const { user: authUser, session: authSession, account: authAccount } = await import("./database/auth-schema");
    await db.delete(authSession).where(eq(authSession.userId, userId));
    await db.delete(authAccount).where(eq(authAccount.userId, userId));
    await db.delete(authUser).where(eq(authUser.id, userId));

    c.header("Set-Cookie", "better-auth.session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");

    return c.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/user]", err);
    return c.json({ message: "Konto konnte nicht gelöscht werden. Bitte versuche es erneut." }, 500);
  }
});

export default app;
