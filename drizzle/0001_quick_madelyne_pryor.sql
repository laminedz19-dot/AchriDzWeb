ALTER TABLE `listings` ADD `paymentStatus` enum('unpaid','pending_verification','verified','rejected') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `paymentReference` varchar(120);--> statement-breakpoint
ALTER TABLE `listings` ADD `paymentVerifiedBy` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `paymentVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `listings` ADD CONSTRAINT `listings_paymentVerifiedBy_users_id_fk` FOREIGN KEY (`paymentVerifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;