-- AddressBook Database Schema
-- Complete database setup for the AddressBook application

-- 1. Login Table
CREATE TABLE `login` (
    `login_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `last_login` DATETIME NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
);

-- 2. Groups Table
CREATE TABLE `groups` (
    `group_id` INT AUTO_INCREMENT PRIMARY KEY,
    `group_name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `created_by` INT,
    INDEX `idx_group_name` (`group_name`),
    FOREIGN KEY (`created_by`) REFERENCES `login`(`login_id`) ON DELETE SET NULL
);

-- 3. Addresses Table (Enhanced from your existing schema)
CREATE TABLE `addresses` (
    `address_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `nickname` VARCHAR(100),
    `phone` VARCHAR(20),
    `email` VARCHAR(100),
    `company` VARCHAR(255),
    `job_title` VARCHAR(255),
    `department` VARCHAR(255),
    `street` VARCHAR(255),
    `city` VARCHAR(100),
    `state` VARCHAR(100),
    `zip_code` VARCHAR(20),
    `country` VARCHAR(100),
    `facebook_link` VARCHAR(255),
    `instagram_link` VARCHAR(255),
    `linkedin_link` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_full_name` (`full_name`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_email` (`email`),
    FOREIGN KEY (`user_id`) REFERENCES `login`(`login_id`) ON DELETE CASCADE
);

-- 4. Address to Groups Table (Junction table for many-to-many relationship)
CREATE TABLE `address_groups` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `address_id` BIGINT NOT NULL,
    `group_id` INT NOT NULL,
    `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `added_by` INT,
    UNIQUE KEY `unique_address_group` (`address_id`, `group_id`),
    INDEX `idx_address_id` (`address_id`),
    INDEX `idx_group_id` (`group_id`),
    FOREIGN KEY (`address_id`) REFERENCES `addresses`(`address_id`) ON DELETE CASCADE,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE,
    FOREIGN KEY (`added_by`) REFERENCES `login`(`login_id`) ON DELETE SET NULL
);

-- Insert sample data for testing
INSERT INTO `login` (`username`, `password`, `email`, `role`) VALUES
('admin', '$2b$10$hash_for_admin123', 'admin@addressbook.com', 'admin'),
('john_doe', '$2b$10$hash_for_user123', 'john@example.com', 'user'),
('jane_smith', '$2b$10$hash_for_user456', 'jane@example.com', 'user');

INSERT INTO `groups` (`group_name`, `description`, `created_by`) VALUES
('Family', 'Family members and relatives', 1),
('Work Colleagues', 'Professional contacts from work', 1),
('Friends', 'Personal friends and social contacts', 1),
('Business Partners', 'Business and professional partners', 1);

-- Sample addresses
INSERT INTO `addresses` (`user_id`, `full_name`, `first_name`, `last_name`, `phone`, `email`, `company`, `job_title`, `city`, `state`, `country`) VALUES
(2, 'Alice Johnson', 'Alice', 'Johnson', '+1-555-0101', 'alice@example.com', 'Tech Corp', 'Software Engineer', 'San Francisco', 'CA', 'USA'),
(2, 'Bob Wilson', 'Bob', 'Wilson', '+1-555-0102', 'bob@example.com', 'Design Studio', 'UI Designer', 'New York', 'NY', 'USA'),
(3, 'Carol Brown', 'Carol', 'Brown', '+1-555-0103', 'carol@example.com', 'Marketing Inc', 'Marketing Manager', 'Chicago', 'IL', 'USA');