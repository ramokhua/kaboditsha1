/*
  Warnings:

  - The primary key for the `applications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `landBoardId` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `queuePosition` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `settlementType` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `applications` table. All the data in the column will be lost.
  - The primary key for the `documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `applicationId` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `documents` table. All the data in the column will be lost.
  - The primary key for the `land_boards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contactInfo` on the `land_boards` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `land_boards` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `land_boards` table. All the data in the column will be lost.
  - You are about to drop the column `officeAddress` on the `land_boards` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `land_boards` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `land_boards` table. All the data in the column will be lost.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - The primary key for the `waiting_list_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `eligibleCount` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `landBoardId` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `oldestDate` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `settlementType` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `totalCount` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `waiting_list_stats` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `status_history` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reference_number]` on the table `applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[land_board_id,settlement_type]` on the table `waiting_list_stats` will be added. If there are existing duplicate values, this will fail.
  - The required column `application_id` was added to the `applications` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `land_board_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_number` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settlement_type` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_id` to the `documents` table without a default value. This is not possible if the table is not empty.
  - The required column `document_id` was added to the `documents` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `file_path` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `documents` table without a default value. This is not possible if the table is not empty.
  - The required column `land_board_id` was added to the `land_boards` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `land_boards` table without a default value. This is not possible if the table is not empty.
  - The required column `notification_id` was added to the `notifications` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `land_board_id` to the `waiting_list_stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settlement_type` to the `waiting_list_stats` table without a default value. This is not possible if the table is not empty.
  - The required column `stat_id` was added to the `waiting_list_stats` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `waiting_list_stats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'WITHDRAWN';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_landBoardId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "land_boards" DROP CONSTRAINT "land_boards_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "status_history" DROP CONSTRAINT "status_history_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "waiting_list_stats" DROP CONSTRAINT "waiting_list_stats_landBoardId_fkey";

-- DropIndex
DROP INDEX "applications_landBoardId_idx";

-- DropIndex
DROP INDEX "applications_referenceNumber_key";

-- DropIndex
DROP INDEX "applications_userId_idx";

-- DropIndex
DROP INDEX "waiting_list_stats_landBoardId_settlementType_key";

-- AlterTable
ALTER TABLE "applications" DROP CONSTRAINT "applications_pkey",
DROP COLUMN "id",
DROP COLUMN "landBoardId",
DROP COLUMN "queuePosition",
DROP COLUMN "referenceNumber",
DROP COLUMN "settlementType",
DROP COLUMN "submittedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "application_id" TEXT NOT NULL,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "land_board_id" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "queue_position" INTEGER,
ADD COLUMN     "reference_number" TEXT NOT NULL,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT,
ADD COLUMN     "settlement_type" "SettlementType" NOT NULL,
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("application_id");

-- AlterTable
ALTER TABLE "documents" DROP CONSTRAINT "documents_pkey",
DROP COLUMN "applicationId",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "id",
DROP COLUMN "mimeType",
DROP COLUMN "uploadedAt",
ADD COLUMN     "application_id" TEXT NOT NULL,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "document_id" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT,
ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("document_id");

-- AlterTable
ALTER TABLE "land_boards" DROP CONSTRAINT "land_boards_pkey",
DROP COLUMN "contactInfo",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "officeAddress",
DROP COLUMN "parent_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "contact_info" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "land_board_id" TEXT NOT NULL,
ADD COLUMN     "monthly_rate" INTEGER DEFAULT 0,
ADD COLUMN     "office_address" TEXT,
ADD COLUMN     "parent_board_id" TEXT,
ADD COLUMN     "total_allocations" INTEGER DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "land_boards_pkey" PRIMARY KEY ("land_board_id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
DROP COLUMN "id",
DROP COLUMN "readAt",
DROP COLUMN "sentAt",
DROP COLUMN "userId",
ADD COLUMN     "notification_id" TEXT NOT NULL,
ADD COLUMN     "read_at" TIMESTAMP(3),
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id");

-- AlterTable
ALTER TABLE "waiting_list_stats" DROP CONSTRAINT "waiting_list_stats_pkey",
DROP COLUMN "eligibleCount",
DROP COLUMN "id",
DROP COLUMN "landBoardId",
DROP COLUMN "oldestDate",
DROP COLUMN "settlementType",
DROP COLUMN "totalCount",
DROP COLUMN "updatedAt",
ADD COLUMN     "average_wait_months" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "eligible_count" INTEGER DEFAULT 0,
ADD COLUMN     "land_board_id" TEXT NOT NULL,
ADD COLUMN     "oldest_date" TIMESTAMP(3),
ADD COLUMN     "settlement_type" "SettlementType" NOT NULL,
ADD COLUMN     "stat_id" TEXT NOT NULL,
ADD COLUMN     "total_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "waiting_list_stats_pkey" PRIMARY KEY ("stat_id");

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "status_history";

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "omang_number" INTEGER NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'APPLICANT',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "token_expiry" TIMESTAMP(3),
    "land_board_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "audit_log_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_omang_number_key" ON "users"("omang_number");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_reference_number_key" ON "applications"("reference_number");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_land_board_id_idx" ON "applications"("land_board_id");

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_stats_land_board_id_settlement_type_key" ON "waiting_list_stats"("land_board_id", "settlement_type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_land_board_id_fkey" FOREIGN KEY ("land_board_id") REFERENCES "land_boards"("land_board_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "land_boards" ADD CONSTRAINT "land_boards_parent_board_id_fkey" FOREIGN KEY ("parent_board_id") REFERENCES "land_boards"("land_board_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_land_board_id_fkey" FOREIGN KEY ("land_board_id") REFERENCES "land_boards"("land_board_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("application_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiting_list_stats" ADD CONSTRAINT "waiting_list_stats_land_board_id_fkey" FOREIGN KEY ("land_board_id") REFERENCES "land_boards"("land_board_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
