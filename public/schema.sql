-- ============================================================================
-- ApexSMM - Social Media Marketing Panel Database Schema (MySQL 8.0 / MariaDB)
-- Production Ready Schema with Foreign Keys, Indexes, and Default Seeds
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `api_providers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `balance` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `spent` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `api_key` VARCHAR(64) UNIQUE NULL,
  `status` ENUM('active', 'suspended', 'banned') NOT NULL DEFAULT 'active',
  `custom_rates` JSON NULL COMMENT 'Custom per-service discounts e.g. {"1": 0.85}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_api_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: categories
-- ----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `icon` VARCHAR(64) DEFAULT 'instagram',
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: api_providers
-- ----------------------------------------------------------------------------
CREATE TABLE `api_providers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `api_key` VARCHAR(255) NOT NULL,
  `balance` DECIMAL(12, 4) DEFAULT 0.0000,
  `currency` VARCHAR(8) DEFAULT 'USD',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `last_sync` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: services
-- ----------------------------------------------------------------------------
CREATE TABLE `services` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('Default', 'Custom Comments', 'Package', 'Subscriptions', 'Mentions') DEFAULT 'Default',
  `rate` DECIMAL(10, 4) NOT NULL COMMENT 'Cost per 1,000 units in USD',
  `min_quantity` INT UNSIGNED NOT NULL DEFAULT 10,
  `max_quantity` INT UNSIGNED NOT NULL DEFAULT 50000,
  `description` TEXT NULL,
  `dripfeed` TINYINT(1) NOT NULL DEFAULT 0,
  `refill` TINYINT(1) NOT NULL DEFAULT 0,
  `api_provider_id` INT UNSIGNED NULL,
  `api_service_id` VARCHAR(64) NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`api_provider_id`) REFERENCES `api_providers`(`id`) ON DELETE SET NULL,
  INDEX `idx_services_category` (`category_id`),
  INDEX `idx_services_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: orders
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `service_id` INT UNSIGNED NOT NULL,
  `link` VARCHAR(512) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `charge` DECIMAL(12, 4) NOT NULL,
  `start_count` INT UNSIGNED DEFAULT 0,
  `remains` INT UNSIGNED DEFAULT 0,
  `status` ENUM('Pending', 'Processing', 'In progress', 'Completed', 'Partial', 'Canceled', 'Refunded') NOT NULL DEFAULT 'Pending',
  `api_provider_id` INT UNSIGNED NULL,
  `api_order_id` VARCHAR(128) NULL,
  `api_status` VARCHAR(64) NULL,
  `runs` INT UNSIGNED DEFAULT 1,
  `interval` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: payments
-- ----------------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `method` ENUM('easypaisa', 'jazzcash', 'bank_transfer', 'binance_pay', 'perfect_money') NOT NULL,
  `amount` DECIMAL(12, 4) NOT NULL,
  `amount_pkr` DECIMAL(12, 2) NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `trx_id` VARCHAR(128) NOT NULL,
  `sender_phone` VARCHAR(64) NULL,
  `account_title` VARCHAR(128) NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_payments_trx` (`trx_id`),
  INDEX `idx_payments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: tickets
-- ----------------------------------------------------------------------------
CREATE TABLE `tickets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `category` ENUM('order', 'payment', 'service', 'api', 'other') NOT NULL DEFAULT 'order',
  `order_id` INT UNSIGNED NULL,
  `status` ENUM('open', 'answered', 'closed') NOT NULL DEFAULT 'open',
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: ticket_messages
-- ----------------------------------------------------------------------------
CREATE TABLE `ticket_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: settings
-- ----------------------------------------------------------------------------
CREATE TABLE `settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` TEXT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: child_panels (Website Friends / Custom Reseller Domains)
-- ----------------------------------------------------------------------------
CREATE TABLE `child_panels` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `domain` VARCHAR(255) NOT NULL UNIQUE,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'PKR',
  `admin_user` VARCHAR(64) NOT NULL,
  `price_monthly` DECIMAL(8, 2) NOT NULL DEFAULT 10.00,
  `status` ENUM('pending', 'active', 'suspended', 'canceled') NOT NULL DEFAULT 'pending',
  `nameservers` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_child_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: saved_urls (URL Add Option / Target Profile Bookmarks)
-- ----------------------------------------------------------------------------
CREATE TABLE `saved_urls` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(128) NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `platform` VARCHAR(64) NOT NULL DEFAULT 'Instagram',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_saved_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: referral_friends (Website Friends / Affiliate Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE `referral_friends` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `referrer_user_id` INT UNSIGNED NOT NULL,
  `referred_user_id` INT UNSIGNED NOT NULL,
  `total_deposited` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `commission_earned` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`referrer_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Initial Settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_title', 'Cheap Pak Panel - #1 SMM Reseller Panel in Pakistan (cheappakpanel.com)'),
('currency_symbol', 'Rs.'),
('usd_to_pkr_rate', '280.00'),
('easypaisa_title', 'Kaleem Ullah'),
('easypaisa_number', '03338831737'),
('jazzcash_title', 'Kaleem Ullah'),
('jazzcash_number', '03338831737'),
('bank_title', 'Kaleem Ullah'),
('bank_account', '03338831737'),
('bank_name', 'Meezan Bank Limited'),
('bank_iban', 'PK64MEZN0003338831737001'),
('binance_trc20_address', 'TP7eR69g4fQnK8FwE3R8s7tQ4bN1v9X2yA'),
('maintenance_mode', '0');

-- Users: Admin & Demo User
INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `balance`, `spent`, `api_key`, `status`) VALUES
('admin', 'admin@smmpanel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 500.0000, 120.0000, 'adm_smm_9a8b7c6d5e4f3a2b1c', 'active'),
('kaleem', 'kaleemullahkhan144@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 85.5000, 314.5000, 'usr_key_8f3a9e1d2c4b5a6e7f', 'active');

-- Categories
INSERT INTO `categories` (`id`, `name`, `icon`, `sort_order`, `status`) VALUES
(1, 'Instagram Followers [Guaranteed / Non-Drop]', 'instagram', 1, 'active'),
(2, 'Instagram Likes & Views [Instant High Speed]', 'instagram', 2, 'active'),
(3, 'TikTok Followers & Video Likes', 'video', 3, 'active'),
(4, 'YouTube Subscribers & Watch Hours', 'youtube', 4, 'active'),
(5, 'Facebook Page Likes & Followers', 'facebook', 5, 'active'),
(6, 'Telegram Channel Members & Post Views', 'send', 6, 'active');

-- API Providers
INSERT INTO `api_providers` (`id`, `name`, `url`, `api_key`, `balance`, `currency`, `status`) VALUES
(1, 'Global SMM Provider Hub', 'https://smmhub.example.com/api/v2', 'prov_key_998877665544332211', 428.5000, 'USD', 'active');

-- Services
INSERT INTO `services` (`id`, `category_id`, `name`, `rate`, `min_quantity`, `max_quantity`, `description`, `dripfeed`, `refill`, `api_provider_id`, `api_service_id`, `status`) VALUES
(101, 1, 'Instagram Real Followers | 30 Days Auto Refill | Non-Drop', 1.2500, 50, 50000, 'Super fast start within 0-15 mins. Non-drop high quality profiles with avatars and posts. 30 days refill button available.', 1, 1, 1, '501', 'active'),
(102, 1, 'Instagram Targeted Pakistani Followers [Real Accounts]', 3.4000, 100, 10000, 'Organic and real Pakistani accounts. High engagement rate, instant delivery, ideal for local businesses.', 0, 1, 1, '502', 'active'),
(103, 2, 'Instagram High Speed Likes [Instant Start / 100k Daily]', 0.3500, 20, 100000, 'Instant delivery upon order submission. No password required, works with public reels and photos.', 1, 0, 1, '601', 'active'),
(104, 3, 'TikTok Followers [Global HQ Accounts / Lifetime Safe]', 2.1000, 100, 30000, 'High retention TikTok accounts. Boost algorithm reach and unlock live streaming eligibility.', 1, 1, 1, '701', 'active'),
(105, 4, 'YouTube 4000 Monetization Watch Hours [Refill 60 Days]', 18.0000, 500, 4000, 'Safe for YouTube Partner Program monetization. Watch duration 15+ minutes per view.', 0, 1, 1, '801', 'active'),
(106, 6, 'Telegram Channel Members [0% Drop / Instant]', 0.9500, 100, 50000, 'High speed channel members. Works for private and public channels.', 1, 1, 1, '901', 'active');
