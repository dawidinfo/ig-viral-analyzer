CREATE TABLE `saved_content_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`profile` json,
	`duration` int NOT NULL,
	`framework` enum('HAPSS','AIDA','mixed') NOT NULL DEFAULT 'mixed',
	`planItems` json,
	`isFavorite` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_content_plans_id` PRIMARY KEY(`id`)
);
