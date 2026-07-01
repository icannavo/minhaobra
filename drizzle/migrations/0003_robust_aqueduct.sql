CREATE TABLE `daily_equipment_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`equipmentId` integer NOT NULL,
	`workId` integer NOT NULL,
	`taskId` integer,
	`date` text NOT NULL,
	`quantity` integer DEFAULT 1,
	`status` text DEFAULT 'allocated',
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_material_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`materialId` integer NOT NULL,
	`workId` integer NOT NULL,
	`taskId` integer,
	`date` text NOT NULL,
	`plannedQuantity` real DEFAULT 0,
	`allocatedQuantity` real DEFAULT 0,
	`consumedQuantity` real DEFAULT 0,
	`status` text DEFAULT 'planned',
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_team_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teamMemberId` integer NOT NULL,
	`workId` integer NOT NULL,
	`taskId` integer,
	`date` text NOT NULL,
	`startTime` text,
	`endTime` text,
	`status` text DEFAULT 'scheduled',
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `epis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`unit` text NOT NULL,
	`costPerUnit` real,
	`quantityInStock` real DEFAULT 0,
	`minStockLevel` real,
	`description` text,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resource_availability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resourceType` text NOT NULL,
	`resourceId` integer NOT NULL,
	`date` text NOT NULL,
	`workId` integer,
	`taskId` integer,
	`isAvailable` integer DEFAULT true,
	`allocatedQuantity` real DEFAULT 0,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
