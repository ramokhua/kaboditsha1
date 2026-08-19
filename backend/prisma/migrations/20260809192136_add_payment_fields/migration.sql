-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "payment_date" TIMESTAMP(3),
ADD COLUMN     "payment_intent_id" TEXT,
ADD COLUMN     "payment_status" TEXT;
