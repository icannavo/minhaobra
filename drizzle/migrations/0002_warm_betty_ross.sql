CREATE TABLE `calendar_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`date` text NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`maxTasks` integer DEFAULT 1,
	`currentTasks` integer DEFAULT 0,
	`isAvailable` integer DEFAULT true,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `change_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entityType` text NOT NULL,
	`entityId` integer NOT NULL,
	`action` text NOT NULL,
	`fieldChanged` text,
	`oldValue` text,
	`newValue` text,
	`changedBy` text,
	`reason` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dailyScheduleId` integer NOT NULL,
	`goalType` text NOT NULL,
	`description` text NOT NULL,
	`targetValue` real NOT NULL,
	`achievedValue` real DEFAULT 0,
	`unit` text,
	`priority` text DEFAULT 'medium',
	`isAchieved` integer DEFAULT false,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`date` text NOT NULL,
	`totalTasks` integer DEFAULT 0,
	`completedTasks` integer DEFAULT 0,
	`totalEstimatedMinutes` integer DEFAULT 0,
	`totalActualMinutes` integer DEFAULT 0,
	`targetArea` real DEFAULT 0,
	`completedArea` real DEFAULT 0,
	`numberOfEmployees` integer DEFAULT 0,
	`totalEquipmentCost` real DEFAULT 0,
	`status` text DEFAULT 'Planejado',
	`notes` text,
	`weather` text,
	`temperature` real,
	`issues` text,
	`achievements` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kanban_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`columnType` text NOT NULL,
	`color` text DEFAULT '#gray',
	`columnOrder` integer NOT NULL,
	`maxTasks` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material_consumptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`detailedTaskId` integer NOT NULL,
	`materialId` integer NOT NULL,
	`plannedQuantity` real DEFAULT 0,
	`actualQuantity` real DEFAULT 0,
	`cost` real,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`type` text,
	`brand` text,
	`unit` text NOT NULL,
	`costPerUnit` real,
	`quantityInStock` real DEFAULT 0,
	`minStockLevel` real,
	`yieldPerUnit` real,
	`color` text,
	`description` text,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_phases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`phaseOrder` integer NOT NULL,
	`totalTasks` integer DEFAULT 0,
	`completedTasks` integer DEFAULT 0,
	`progressPercent` real DEFAULT 0,
	`status` text DEFAULT 'Pendente',
	`dependsOnPhaseId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_subtasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectTaskId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subtaskOrder` integer NOT NULL,
	`stepType` text NOT NULL,
	`estimatedMinutes` integer DEFAULT 0,
	`actualMinutes` integer DEFAULT 0,
	`status` text DEFAULT 'Pendente',
	`checklistItems` text,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`completedAt` integer
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`phaseId` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`classId` integer,
	`subclassId` integer,
	`area` real DEFAULT 0,
	`height` real DEFAULT 0,
	`width` real DEFAULT 0,
	`floors` integer DEFAULT 1,
	`estimatedDurationMinutes` integer DEFAULT 0,
	`estimatedEmployees` integer DEFAULT 1,
	`estimatedCost` real DEFAULT 0,
	`priority` text DEFAULT 'medium',
	`taskOrder` integer DEFAULT 0,
	`dependsOnTaskIds` text,
	`blockedBy` text,
	`kanbanStatus` text DEFAULT 'backlog',
	`scheduledDate` text,
	`scheduledStartTime` text,
	`scheduledEndTime` text,
	`actualStartTime` integer,
	`actualEndTime` integer,
	`actualDurationMinutes` integer DEFAULT 0,
	`progressPercent` real DEFAULT 0,
	`completedArea` real DEFAULT 0,
	`status` text DEFAULT 'Pendente',
	`totalSubtasks` integer DEFAULT 0,
	`completedSubtasks` integer DEFAULT 0,
	`notes` text,
	`issues` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`completedAt` integer
);
--> statement-breakpoint
CREATE TABLE `project_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`phasesTemplate` text,
	`tasksTemplate` text,
	`baseAreaMultiplier` real DEFAULT 1,
	`baseDurationDays` integer DEFAULT 30,
	`isActive` integer DEFAULT true,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`totalArea` real DEFAULT 0,
	`totalFloors` integer DEFAULT 1,
	`totalTasks` integer DEFAULT 0,
	`completedTasks` integer DEFAULT 0,
	`progressPercent` real DEFAULT 0,
	`startDate` text,
	`estimatedEndDate` text,
	`actualEndDate` text,
	`status` text DEFAULT 'Planejamento',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dailyScheduleId` integer NOT NULL,
	`detailedTaskId` integer NOT NULL,
	`scheduledStartTime` text,
	`scheduledEndTime` text,
	`slotOrder` integer DEFAULT 0,
	`actualStartTime` integer,
	`actualEndTime` integer,
	`status` text DEFAULT 'Agendado',
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectTaskId` integer NOT NULL,
	`calendarSlotId` integer NOT NULL,
	`slotPosition` integer DEFAULT 0,
	`status` text DEFAULT 'Agendado',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_team_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`detailedTaskId` integer NOT NULL,
	`teamMemberId` integer NOT NULL,
	`role` text,
	`hoursAllocated` real,
	`hoursWorked` real DEFAULT 0,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`specialty` text,
	`phone` text,
	`email` text,
	`avgProductivity` real,
	`isActive` integer DEFAULT true,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work_drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'draft',
	`formData` text NOT NULL,
	`currentStep` integer DEFAULT 1,
	`lastSavedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`userId` integer
);
