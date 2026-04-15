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
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).get();
  if (!profile?.isAdmin) return c.json({ message: "Forbidden" }, 403);
  return next();
});
