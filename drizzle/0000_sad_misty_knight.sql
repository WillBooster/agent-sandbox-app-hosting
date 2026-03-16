CREATE TABLE `app` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `app_file` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`path` text NOT NULL,
	`content` blob NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `app`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_file_app_id_path_unique` ON `app_file` (`app_id`,`path`);