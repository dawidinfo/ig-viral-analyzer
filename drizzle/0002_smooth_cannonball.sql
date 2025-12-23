CREATE TABLE `saved_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64) NOT NULL,
	`profilePicUrl` text,
	`fullName` text,
	`followerCount` int,
	`viralScore` int,
	`engagementRate` varchar(16),
	`analysisData` json,
	`notes` text,
	`isFavorite` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` varchar(32) NOT NULL,
	`usageMonth` varchar(7) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usage_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','starter','pro','business') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndsAt` timestamp;