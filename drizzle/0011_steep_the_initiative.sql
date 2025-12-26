CREATE TABLE `database_backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupType` enum('full','incremental','manual') NOT NULL DEFAULT 'full',
	`status` enum('pending','completed','failed','restored') NOT NULL DEFAULT 'pending',
	`backupData` json,
	`savedAnalysesCount` int NOT NULL DEFAULT 0,
	`notesCount` int NOT NULL DEFAULT 0,
	`contentPlansCount` int NOT NULL DEFAULT 0,
	`sizeBytes` int NOT NULL DEFAULT 0,
	`description` text,
	`createdBy` varchar(64) NOT NULL DEFAULT 'system',
	`restoredAt` timestamp,
	`restoredBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `database_backups_id` PRIMARY KEY(`id`)
);
