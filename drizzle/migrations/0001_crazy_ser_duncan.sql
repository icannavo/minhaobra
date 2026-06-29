CREATE TABLE `detailed_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`date` text NOT NULL,
	`classId` integer NOT NULL,
	`subclassId` integer NOT NULL,
	`taskName` text NOT NULL,
	`description` text,
	`area` real DEFAULT 0,
	`height` real DEFAULT 0,
	`width` real DEFAULT 0,
	`floors` integer DEFAULT 1,
	`team` text,
	`numberOfEmployees` integer DEFAULT 1,
	`estimatedTotalMinutes` integer DEFAULT 0,
	`actualTotalMinutes` integer DEFAULT 0,
	`status` text DEFAULT 'Planejado',
	`currentStepId` integer,
	`completedSteps` text,
	`notes` text,
	`issues` text,
	`correctionAction` text,
	`weather` text,
	`temperature` real,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`completedAt` integer
);
--> statement-breakpoint
CREATE TABLE `step_equipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stepId` integer NOT NULL,
	`equipmentId` integer NOT NULL,
	`quantity` integer DEFAULT 1,
	`required` integer DEFAULT true,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `step_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`detailedTaskId` integer NOT NULL,
	`stepId` integer NOT NULL,
	`startTime` integer,
	`endTime` integer,
	`durationMinutes` integer DEFAULT 0,
	`status` text DEFAULT 'Pendente',
	`notes` text,
	`issues` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `step_materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stepId` integer NOT NULL,
	`materialName` text NOT NULL,
	`materialCategory` text,
	`quantity` real DEFAULT 1,
	`unit` text,
	`calculationType` text DEFAULT 'FIXED',
	`required` integer DEFAULT true,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`requiresScaffolding` integer DEFAULT false,
	`requiresSafetyMeeting` integer DEFAULT true,
	`safetyMeetingMinutes` integer DEFAULT 15,
	`baseProductivity` real DEFAULT 20,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_classes_code_unique` ON `task_classes` (`code`);--> statement-breakpoint
CREATE TABLE `task_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subclassId` integer NOT NULL,
	`name` text NOT NULL,
	`stepOrder` integer NOT NULL,
	`stepType` text NOT NULL,
	`baseTimeMinutes` integer DEFAULT 0,
	`timeCalculationType` text DEFAULT 'FIXED',
	`timeCalculationValue` real DEFAULT 0,
	`requiresCooldown` integer DEFAULT false,
	`cooldownMinutes` integer DEFAULT 0,
	`maxContinuousMinutes` integer DEFAULT 0,
	`description` text,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_subclasses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`classId` integer NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`productivityMultiplier` real DEFAULT 1,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_subclasses_code_unique` ON `task_subclasses` (`code`);