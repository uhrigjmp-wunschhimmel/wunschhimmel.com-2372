CREATE TABLE `list_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`wishlist_id` text NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`photo_url` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `update_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`update_id` text NOT NULL,
	`author_name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `update_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`update_id` text NOT NULL,
	`liker_name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `bio` text;