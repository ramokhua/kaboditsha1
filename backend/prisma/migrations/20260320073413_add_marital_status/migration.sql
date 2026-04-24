-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'SEPARATED', 'WIDOWED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "marital_status" "MaritalStatus",
ADD COLUMN     "spouse_name" TEXT;
