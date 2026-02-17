# ComputerScienceX.com Blog (Next.js + MySQL)

Personal blog application with:
- Public blog pages (`/`, `/blog`, `/blog/[slug]`, `/categories`)
- Hidden admin area (login protected, path controlled by env)
- Post publishing with markdown + inline image uploads
- Views/likes analytics with IP, location headers, browser/OS/device metadata
- One-like-per-visitor enforcement (fingerprint from IP + user agent)

## 1) Install dependencies

```bash
pnpm install
```

## 2) MySQL setup commands

Run these in your MySQL shell (no new MySQL user required):

```sql
CREATE DATABASE computersciencex_blog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Optional quick check:

```sql
SHOW DATABASES;
USE computersciencex_blog;
```

## 2.1) MySQL table creation SQL (manual)

Use this if you want to create tables directly in MySQL (without Prisma migrations):

```sql
USE computersciencex_blog;

CREATE TABLE `Post` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `coverImageUrl` VARCHAR(191) NULL,
  `authorName` VARCHAR(191) NOT NULL DEFAULT 'ComputerScienceX',
  `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Post_slug_key` (`slug`),
  INDEX `Post_publishedAt_idx` (`publishedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Category_name_key` (`name`),
  UNIQUE INDEX `Category_slug_key` (`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PostCategory` (
  `postId` INT NOT NULL,
  `categoryId` INT NOT NULL,
  `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `PostCategory_categoryId_idx` (`categoryId`),
  PRIMARY KEY (`postId`, `categoryId`),
  CONSTRAINT `PostCategory_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PostCategory_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ViewEvent` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `postId` INT NULL,
  `path` VARCHAR(191) NOT NULL,
  `ip` VARCHAR(191) NOT NULL,
  `fingerprint` VARCHAR(191) NOT NULL,
  `userAgent` TEXT NULL,
  `browser` VARCHAR(191) NULL,
  `os` VARCHAR(191) NULL,
  `deviceType` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `region` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `isBot` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ViewEvent_postId_createdAt_idx` (`postId`, `createdAt`),
  INDEX `ViewEvent_createdAt_idx` (`createdAt`),
  INDEX `ViewEvent_isBot_createdAt_idx` (`isBot`, `createdAt`),
  INDEX `ViewEvent_fingerprint_createdAt_idx` (`fingerprint`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ViewEvent_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Like` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `postId` INT NOT NULL,
  `ip` VARCHAR(191) NOT NULL,
  `fingerprint` VARCHAR(191) NOT NULL,
  `userAgent` TEXT NULL,
  `browser` VARCHAR(191) NULL,
  `os` VARCHAR(191) NULL,
  `deviceType` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `region` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Like_postId_fingerprint_key` (`postId`, `fingerprint`),
  INDEX `Like_postId_createdAt_idx` (`postId`, `createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Like_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3) Environment variables

Copy `.env.example` to `.env` and set real values:

```env
NEXT_PUBLIC_APP_URL=https://computersciencex.com
DATABASE_URL="mysql://root:your_password@localhost:3306/computersciencex_blog"
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_ROUTE_SLUG=csx-admin-portal
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
```

## 4) Prisma commands (required)

Generate Prisma client:

```bash
pnpm db:generate
```

Create/apply migrations in development:

```bash
pnpm prisma migrate dev --name init
```

Alternative (no migration files, just sync schema):

```bash
pnpm db:push
```

Open Prisma Studio:

```bash
pnpm db:studio
```

## 5) Run the app

```bash
pnpm dev
```

App: `http://localhost:3000`

## 6) Hidden admin access

Admin URL is:

```text
http://localhost:3000/<ADMIN_ROUTE_SLUG>
```

Example with default env:

```text
http://localhost:3000/csx-admin-portal
```

Use `ADMIN_USERNAME` / `ADMIN_PASSWORD` to log in.

## Useful scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:push
pnpm db:studio
```
