CREATE TABLE `awin_products` (
	`id` text PRIMARY KEY NOT NULL,
	`aw_product_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`category` text,
	`brand` text,
	`merchant_id` text NOT NULL,
	`merchant_name` text,
	`deep_link` text NOT NULL,
	`approx_price` real,
	`currency` text DEFAULT 'EUR',
	`in_stock` integer DEFAULT true NOT NULL,
	`last_synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `terms_acceptances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`version` text NOT NULL,
	`accepted_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`ip` text,
	`user_agent` text
);
