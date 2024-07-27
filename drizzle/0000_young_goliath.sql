CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`search` text,
	`content` text,
	`is_safe` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`food` text,
	`content` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
