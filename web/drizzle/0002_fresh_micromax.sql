CREATE TABLE IF NOT EXISTS `versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
