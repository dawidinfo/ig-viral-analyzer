CREATE TABLE `email_ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailType` varchar(64) NOT NULL,
	`subjectA` varchar(255) NOT NULL,
	`subjectB` varchar(255) NOT NULL,
	`sentA` int NOT NULL DEFAULT 0,
	`sentB` int NOT NULL DEFAULT 0,
	`opensA` int NOT NULL DEFAULT 0,
	`opensB` int NOT NULL DEFAULT 0,
	`clicksA` int NOT NULL DEFAULT 0,
	`clicksB` int NOT NULL DEFAULT 0,
	`conversionsA` int NOT NULL DEFAULT 0,
	`conversionsB` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`winner` varchar(1),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_ab_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailType` varchar(64) NOT NULL,
	`variant` varchar(1),
	`subject` varchar(255) NOT NULL,
	`opened` int NOT NULL DEFAULT 0,
	`openedAt` timestamp,
	`clicked` int NOT NULL DEFAULT 0,
	`clickedAt` timestamp,
	`converted` int NOT NULL DEFAULT 0,
	`resendId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `emailOptOut` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastDripEmailSent` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastDripEmailAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVariant` varchar(1);