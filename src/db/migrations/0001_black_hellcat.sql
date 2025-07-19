CREATE TABLE `habit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`goal_value` integer NOT NULL,
	`goal_unit` text NOT NULL,
	`repetiton_pattern` text NOT NULL,
	`reminder_enabled` integer DEFAULT false NOT NULL,
	`reminder_time` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
