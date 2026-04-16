import { createMiddleware } from "hono/factory";
import { createAuth } from "../auth";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { userProfiles } from "../database/schema";
import * as schema from "../database/schema";

const getBaseURL = (request: Request) => {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const auth = createAuth(getBaseURL(c.req.raw));
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export const authenticatedOnly = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ message: "You are not authenticated" }, 401);
  }
  return next();
});

export const adminOnly = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session) return c.json({ message: "You are not authenticated" }, 401);
  const user = c.get("user");
  const db = drizzle(env.DB, { schema });

  // Auto-grant admin for Marlene on first access
  const ADMIN_EMAIL = "kontakt@wunschhimmel.com";
  if (user.email === ADMIN_EMAIL) {
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
    if (existing && !existing.isAdmin) {
      await db.update(userProfiles).set({ isAdmin: true }).where(eq(userProfiles.userId, user.id));
      return next();
    } else if (!existing) {
      // Profile doesn't exist yet — create it with isAdmin=true
      await db.insert(userProfiles).values({ userId: user.id, theme: "rose", isAdmin: true });
      return next();
    }
    // Already isAdmin=true
    return next();
  }

  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  if (!profile?.isAdmin) return c.json({ message: "Forbidden" }, 403);
  return next();
});
