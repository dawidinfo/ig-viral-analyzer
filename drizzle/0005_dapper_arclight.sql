CREATE TABLE `follower_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('instagram','tiktok','youtube') NOT NULL,
	`username` varchar(128) NOT NULL,
	`followerCount` int NOT NULL,
	`followingCount` int,
	`postCount` int,
	`totalLikes` int,
	`totalViews` int,
	`engagementRate` decimal(5,2),
	`snapshotDate` varchar(10) NOT NULL,
	`isRealData` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follower_snapshots_id` PRIMARY KEY(`id`)
);
