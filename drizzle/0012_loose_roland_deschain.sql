CREATE TABLE `analysis_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(128) NOT NULL,
	`section` enum('analyse','erkenntnisse','learnings') NOT NULL,
	`notes` text,
	`actionItems` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysis_notes_id` PRIMARY KEY(`id`)
);
