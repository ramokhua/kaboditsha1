/*
  Warnings:

  - A unique constraint covering the columns `[application_number]` on the table `applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[document_number]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[board_number]` on the table `land_boards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notification_number]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `application_number` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_number` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `board_number` to the `land_boards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notification_number` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "application_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "document_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "land_boards" ADD COLUMN     "board_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "notification_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "applications_application_number_key" ON "applications"("application_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_number_key" ON "documents"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "land_boards_board_number_key" ON "land_boards"("board_number");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_notification_number_key" ON "notifications"("notification_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_number_key" ON "users"("user_number");
