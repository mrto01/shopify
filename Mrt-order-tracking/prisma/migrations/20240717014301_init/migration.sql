-- CreateTable
CREATE TABLE `wp_commentmeta` (
    `meta_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `comment_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `meta_key` VARCHAR(255) NULL,
    `meta_value` LONGTEXT NULL,

    INDEX `comment_id`(`comment_id`),
    INDEX `meta_key`(`meta_key`(191)),
    PRIMARY KEY (`meta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_comments` (
    `comment_ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `comment_post_ID` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `comment_author` TINYTEXT NOT NULL,
    `comment_author_email` VARCHAR(100) NOT NULL DEFAULT '',
    `comment_author_url` VARCHAR(200) NOT NULL DEFAULT '',
    `comment_author_IP` VARCHAR(100) NOT NULL DEFAULT '',
    `comment_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `comment_date_gmt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `comment_content` TEXT NOT NULL,
    `comment_karma` INTEGER NOT NULL DEFAULT 0,
    `comment_approved` VARCHAR(20) NOT NULL DEFAULT '1',
    `comment_agent` VARCHAR(255) NOT NULL DEFAULT '',
    `comment_type` VARCHAR(20) NOT NULL DEFAULT 'comment',
    `comment_parent` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `comment_approved_date_gmt`(`comment_approved`, `comment_date_gmt`),
    INDEX `comment_author_email`(`comment_author_email`(10)),
    INDEX `comment_date_gmt`(`comment_date_gmt`),
    INDEX `comment_parent`(`comment_parent`),
    INDEX `comment_post_ID`(`comment_post_ID`),
    PRIMARY KEY (`comment_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_links` (
    `link_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `link_url` VARCHAR(255) NOT NULL DEFAULT '',
    `link_name` VARCHAR(255) NOT NULL DEFAULT '',
    `link_image` VARCHAR(255) NOT NULL DEFAULT '',
    `link_target` VARCHAR(25) NOT NULL DEFAULT '',
    `link_description` VARCHAR(255) NOT NULL DEFAULT '',
    `link_visible` VARCHAR(20) NOT NULL DEFAULT 'Y',
    `link_owner` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `link_rating` INTEGER NOT NULL DEFAULT 0,
    `link_updated` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `link_rel` VARCHAR(255) NOT NULL DEFAULT '',
    `link_notes` MEDIUMTEXT NOT NULL,
    `link_rss` VARCHAR(255) NOT NULL DEFAULT '',

    INDEX `link_visible`(`link_visible`),
    PRIMARY KEY (`link_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_options` (
    `option_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `option_name` VARCHAR(191) NOT NULL DEFAULT '',
    `option_value` LONGTEXT NOT NULL,
    `autoload` VARCHAR(20) NOT NULL DEFAULT 'yes',

    UNIQUE INDEX `option_name`(`option_name`),
    INDEX `autoload`(`autoload`),
    PRIMARY KEY (`option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_postmeta` (
    `meta_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `meta_key` VARCHAR(255) NULL,
    `meta_value` LONGTEXT NULL,

    INDEX `meta_key`(`meta_key`(191)),
    INDEX `post_id`(`post_id`),
    PRIMARY KEY (`meta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_posts` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_author` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `post_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `post_date_gmt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `post_content` LONGTEXT NOT NULL,
    `post_title` TEXT NOT NULL,
    `post_excerpt` TEXT NOT NULL,
    `post_status` VARCHAR(20) NOT NULL DEFAULT 'publish',
    `comment_status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `ping_status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `post_password` VARCHAR(255) NOT NULL DEFAULT '',
    `post_name` VARCHAR(200) NOT NULL DEFAULT '',
    `to_ping` TEXT NOT NULL,
    `pinged` TEXT NOT NULL,
    `post_modified` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `post_modified_gmt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `post_content_filtered` LONGTEXT NOT NULL,
    `post_parent` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `guid` VARCHAR(255) NOT NULL DEFAULT '',
    `menu_order` INTEGER NOT NULL DEFAULT 0,
    `post_type` VARCHAR(20) NOT NULL DEFAULT 'post',
    `post_mime_type` VARCHAR(100) NOT NULL DEFAULT '',
    `comment_count` BIGINT NOT NULL DEFAULT 0,

    INDEX `post_author`(`post_author`),
    INDEX `post_name`(`post_name`(191)),
    INDEX `post_parent`(`post_parent`),
    INDEX `type_status_date`(`post_type`, `post_status`, `post_date`, `ID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_term_relationships` (
    `object_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `term_taxonomy_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `term_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `term_taxonomy_id`(`term_taxonomy_id`),
    PRIMARY KEY (`object_id`, `term_taxonomy_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_term_taxonomy` (
    `term_taxonomy_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `term_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `taxonomy` VARCHAR(32) NOT NULL DEFAULT '',
    `description` LONGTEXT NOT NULL,
    `parent` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `count` BIGINT NOT NULL DEFAULT 0,

    INDEX `taxonomy`(`taxonomy`),
    UNIQUE INDEX `term_id_taxonomy`(`term_id`, `taxonomy`),
    PRIMARY KEY (`term_taxonomy_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_termmeta` (
    `meta_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `term_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `meta_key` VARCHAR(255) NULL,
    `meta_value` LONGTEXT NULL,

    INDEX `meta_key`(`meta_key`(191)),
    INDEX `term_id`(`term_id`),
    PRIMARY KEY (`meta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_terms` (
    `term_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL DEFAULT '',
    `slug` VARCHAR(200) NOT NULL DEFAULT '',
    `term_group` BIGINT NOT NULL DEFAULT 0,

    INDEX `name`(`name`(191)),
    INDEX `slug`(`slug`(191)),
    PRIMARY KEY (`term_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_usermeta` (
    `umeta_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `meta_key` VARCHAR(255) NULL,
    `meta_value` LONGTEXT NULL,

    INDEX `meta_key`(`meta_key`(191)),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`umeta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_users` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_login` VARCHAR(60) NOT NULL DEFAULT '',
    `user_pass` VARCHAR(255) NOT NULL DEFAULT '',
    `user_nicename` VARCHAR(50) NOT NULL DEFAULT '',
    `user_email` VARCHAR(100) NOT NULL DEFAULT '',
    `user_url` VARCHAR(100) NOT NULL DEFAULT '',
    `user_registered` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `user_activation_key` VARCHAR(255) NOT NULL DEFAULT '',
    `user_status` INTEGER NOT NULL DEFAULT 0,
    `display_name` VARCHAR(250) NOT NULL DEFAULT '',

    INDEX `user_email`(`user_email`),
    INDEX `user_login_key`(`user_login`),
    INDEX `user_nicename`(`user_nicename`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    `locale` VARCHAR(191) NULL,
    `collaborator` BOOLEAN NULL DEFAULT false,
    `emailVerified` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
