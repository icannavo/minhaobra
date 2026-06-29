CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int,
	`type` enum('TAREFA_DESVIO_NEGATIVO','TAREFA_ATRASADA','EQUIPAMENTO_INDISPONIVEL','CRONOGRAMA_AFETADO','META_NAO_ATINGIDA') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','error') DEFAULT 'warning',
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`date` date NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`description` text,
	`team` varchar(100),
	`numberOfEmployees` int DEFAULT 1,
	`targetArea` decimal(10,2),
	`completedArea` decimal(10,2) DEFAULT '0',
	`deviation` decimal(10,2),
	`isCompleted` boolean DEFAULT false,
	`status` enum('Planejado','Em Execução','Concluído','Adiado') DEFAULT 'Planejado',
	`notes` text,
	`correctionAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`costPerDay` decimal(10,2),
	`costPerHour` decimal(10,2),
	`quantity` int DEFAULT 1,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productivity_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`date` date NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`targetArea` decimal(10,2),
	`completedArea` decimal(10,2),
	`deviation` decimal(10,2),
	`deviationPercent` decimal(5,2),
	`numberOfEmployees` int,
	`productivity` decimal(10,2),
	`weather` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productivity_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedule_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`date` date NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`plannedArea` decimal(10,2),
	`actualArea` decimal(10,2),
	`numberOfEmployees` int DEFAULT 1,
	`productivityPerDay` decimal(10,2),
	`actualProductivity` decimal(10,2),
	`status` enum('Planejado','Em Execução','Concluído','Adiado','Atrasado') DEFAULT 'Planejado',
	`predecessorId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedule_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_equipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`equipmentId` int NOT NULL,
	`quantity` int DEFAULT 1,
	`hoursNeeded` decimal(8,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_equipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`status` enum('Planejamento','Em Andamento','Concluído','Pausada') DEFAULT 'Planejamento',
	`startDate` date,
	`estimatedEndDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `works_id` PRIMARY KEY(`id`),
	CONSTRAINT `works_code_unique` UNIQUE(`code`)
);
