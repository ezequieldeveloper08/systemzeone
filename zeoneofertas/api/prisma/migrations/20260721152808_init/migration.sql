-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `profiles_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workspaces` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `workspaces_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workspace_members` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `workspace_members_workspaceId_userId_key`(`workspaceId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_connections` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `marketplace` ENUM('MERCADO_LIVRE', 'SHOPEE', 'MANUAL', 'AMAZON', 'MAGALU') NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONNECTED',
    `accessTokenEncrypted` TEXT NULL,
    `refreshTokenEncrypted` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_sources` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `marketplace` ENUM('MERCADO_LIVRE', 'SHOPEE', 'MANUAL', 'AMAZON', 'MAGALU') NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `externalCategoryId` VARCHAR(191) NULL,
    `externalDomainId` VARCHAR(191) NULL,
    `minimumDiscount` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastRunAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_products` (
    `id` VARCHAR(191) NOT NULL,
    `marketplace` ENUM('MERCADO_LIVRE', 'SHOPEE', 'MANUAL', 'AMAZON', 'MAGALU') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `catalogProductId` VARCHAR(191) NULL,
    `domainId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `brand` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `images` JSON NULL,
    `attributes` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `lastSyncedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `catalog_products_marketplace_externalId_key`(`marketplace`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_offers` (
    `id` VARCHAR(191) NOT NULL,
    `catalogProductId` VARCHAR(191) NULL,
    `marketplace` ENUM('MERCADO_LIVRE', 'SHOPEE', 'MANUAL', 'AMAZON', 'MAGALU') NOT NULL,
    `externalItemId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NULL,
    `sellerName` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `originalPrice` DECIMAL(10, 2) NULL,
    `discountPercentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'BRL',
    `availableQuantity` INTEGER NOT NULL DEFAULT 0,
    `soldQuantity` INTEGER NOT NULL DEFAULT 0,
    `freeShipping` BOOLEAN NOT NULL DEFAULT false,
    `productUrl` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `lastSyncedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `marketplace_offers_marketplace_externalItemId_key`(`marketplace`, `externalItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saved_offers` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `marketplaceOfferId` VARCHAR(191) NOT NULL,
    `status` ENUM('FOUND', 'IN_ANALYSIS', 'APPROVED', 'WAITING_AFFILIATE_LINK', 'READY_TO_SHARE', 'PUBLISHED', 'EXPIRED', 'IGNORED') NOT NULL DEFAULT 'FOUND',
    `score` INTEGER NOT NULL DEFAULT 50,
    `notes` TEXT NULL,
    `responsibleUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affiliate_links` (
    `id` VARCHAR(191) NOT NULL,
    `savedOfferId` VARCHAR(191) NOT NULL,
    `originalUrl` TEXT NOT NULL,
    `affiliateUrl` TEXT NULL,
    `trackingTag` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONFIGURED', 'VALIDATED', 'ERROR', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `lastValidatedAt` DATETIME(3) NULL,
    `clickCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `marketplace` ENUM('MERCADO_LIVRE', 'SHOPEE', 'MANUAL', 'AMAZON', 'MAGALU') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountType` VARCHAR(191) NOT NULL DEFAULT 'PERCENTAGE',
    `discountValue` DECIMAL(10, 2) NOT NULL,
    `minimumPurchase` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `maximumDiscount` DECIMAL(10, 2) NULL,
    `startsAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'MANUAL',
    `status` ENUM('DRAFT', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'UNVERIFIED') NOT NULL DEFAULT 'ACTIVE',
    `rules` TEXT NULL,
    `officialUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_offers` (
    `id` VARCHAR(191) NOT NULL,
    `couponId` VARCHAR(191) NOT NULL,
    `savedOfferId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `coupon_offers_couponId_savedOfferId_key`(`couponId`, `savedOfferId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_templates` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `network` ENUM('WHATSAPP', 'INSTAGRAM', 'STORIES', 'TELEGRAM', 'FACEBOOK', 'X') NOT NULL,
    `content` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_publications` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `savedOfferId` VARCHAR(191) NOT NULL,
    `network` ENUM('WHATSAPP', 'INSTAGRAM', 'STORIES', 'TELEGRAM', 'FACEBOOK', 'X') NOT NULL,
    `content` TEXT NOT NULL,
    `affiliateUrl` TEXT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'CANCELLED', 'ERROR') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `responsibleUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_history` (
    `id` VARCHAR(191) NOT NULL,
    `marketplaceOfferId` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `originalPrice` DECIMAL(10, 2) NULL,
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `click_events` (
    `id` VARCHAR(191) NOT NULL,
    `affiliateLinkId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'DIRECT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_connections` ADD CONSTRAINT `marketplace_connections_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `search_sources` ADD CONSTRAINT `search_sources_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `search_sources` ADD CONSTRAINT `search_sources_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_offers` ADD CONSTRAINT `marketplace_offers_catalogProductId_fkey` FOREIGN KEY (`catalogProductId`) REFERENCES `catalog_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_offers` ADD CONSTRAINT `saved_offers_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_offers` ADD CONSTRAINT `saved_offers_marketplaceOfferId_fkey` FOREIGN KEY (`marketplaceOfferId`) REFERENCES `marketplace_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_offers` ADD CONSTRAINT `saved_offers_responsibleUserId_fkey` FOREIGN KEY (`responsibleUserId`) REFERENCES `profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affiliate_links` ADD CONSTRAINT `affiliate_links_savedOfferId_fkey` FOREIGN KEY (`savedOfferId`) REFERENCES `saved_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupons` ADD CONSTRAINT `coupons_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_offers` ADD CONSTRAINT `coupon_offers_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_offers` ADD CONSTRAINT `coupon_offers_savedOfferId_fkey` FOREIGN KEY (`savedOfferId`) REFERENCES `saved_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_templates` ADD CONSTRAINT `social_templates_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_publications` ADD CONSTRAINT `social_publications_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_publications` ADD CONSTRAINT `social_publications_savedOfferId_fkey` FOREIGN KEY (`savedOfferId`) REFERENCES `saved_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_publications` ADD CONSTRAINT `social_publications_responsibleUserId_fkey` FOREIGN KEY (`responsibleUserId`) REFERENCES `profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_marketplaceOfferId_fkey` FOREIGN KEY (`marketplaceOfferId`) REFERENCES `marketplace_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `click_events` ADD CONSTRAINT `click_events_affiliateLinkId_fkey` FOREIGN KEY (`affiliateLinkId`) REFERENCES `affiliate_links`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
