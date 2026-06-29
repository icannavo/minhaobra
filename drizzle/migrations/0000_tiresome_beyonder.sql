CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`severity` text DEFAULT 'warning',
	`isRead` integer DEFAULT false,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`date` text NOT NULL,
	`taskName` text NOT NULL,
	`description` text,
	`team` text,
	`numberOfEmployees` integer DEFAULT 1,
	`targetArea` real,
	`completedArea` real DEFAULT 0,
	`deviation` real,
	`isCompleted` integer DEFAULT false,
	`status` text DEFAULT 'Planejado',
	`notes` text,
	`correctionAction` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `equipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`costPerDay` real,
	`costPerHour` real,
	`quantity` integer DEFAULT 1,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `productivity_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`date` text NOT NULL,
	`taskName` text NOT NULL,
	`targetArea` real,
	`completedArea` real,
	`deviation` real,
	`deviationPercent` real,
	`numberOfEmployees` integer,
	`productivity` real,
	`weather` text,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedule_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`date` text NOT NULL,
	`taskName` text NOT NULL,
	`plannedArea` real,
	`actualArea` real,
	`numberOfEmployees` integer DEFAULT 1,
	`productivityPerDay` real,
	`actualProductivity` real,
	`status` text DEFAULT 'Planejado',
	`predecessorId` integer,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_equipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taskId` integer NOT NULL,
	`equipmentId` integer NOT NULL,
	`quantity` integer DEFAULT 1,
	`hoursNeeded` real,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text(64) NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE TABLE `works` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`location` text,
	`status` text DEFAULT 'Planejamento',
	`startDate` text,
	`estimatedEndDate` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `works_code_unique` ON `works` (`code`);