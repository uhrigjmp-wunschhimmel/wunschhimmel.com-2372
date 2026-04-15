CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'rose' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
