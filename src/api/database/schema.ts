import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Better Auth tables ────────────────────────────────────────────────────────
export { user, session, account, verification } from "./auth-schema";

// ── User profiles ─────────────────────────────────────────────────────────────
export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  theme: text("theme").notNull().default("rose"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── Wishlists ────────────────────────────────────────────────────────────────
export const wishlists = sqliteTable("wishlists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  emoji: text("emoji").default("🎁"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  shareToken: text("share_token").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ── Wishes ────────────────────────────────────────────────────────────────────
export const wishes = sqliteTable("wishes", {
  id: text("id").primaryKey(),
  wishlistId: text("wishlist_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: real("price"),
  currency: text("currency").default("EUR"),
  productUrl: text("product_url"),
  priority: text("priority").default("medium"),
  isReserved: integer("is_reserved", { mode: "boolean" }).notNull().default(false),
  reservedByName: text("reserved_by_name"),
  reservedAt: text("reserved_at"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── Share invitations ─────────────────────────────────────────────────────────
export const shareInvitations = sqliteTable("share_invitations", {
  id: text("id").primaryKey(),
  wishlistId: text("wishlist_id").notNull(),
  sentByUserId: text("sent_by_user_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  sentAt: text("sent_at").notNull().default(sql`(datetime('now'))`),
});

// ── List updates (celebration posts) ─────────────────────────────────────────
export const listUpdates = sqliteTable("list_updates", {
  id: text("id").primaryKey(),
  wishlistId: text("wishlist_id").notNull(),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  photoUrl: text("photo_url"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── Update likes ──────────────────────────────────────────────────────────────
export const updateLikes = sqliteTable("update_likes", {
  id: text("id").primaryKey(),
  updateId: text("update_id").notNull(),
  // anonymous: store session fingerprint or name
  likerName: text("liker_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ── Update comments ───────────────────────────────────────────────────────────
export const updateComments = sqliteTable("update_comments", {
  id: text("id").primaryKey(),
  updateId: text("update_id").notNull(),
  authorName: text("author_name").notNull(),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
