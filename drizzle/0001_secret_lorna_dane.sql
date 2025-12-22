CREATE TABLE `instagram_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`profileData` json,
	`postsData` json,
	`reelsData` json,
	`analysisData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `instagram_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagram_cache_username_unique` UNIQUE(`username`)
);
