/*
  Warnings:

  - The values [CITY] on the enum `SettlementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SettlementType_new" AS ENUM ('TOWN', 'VILLAGE', 'FARM');
ALTER TABLE "applications" ALTER COLUMN "settlement_type" TYPE "SettlementType_new" USING ("settlement_type"::text::"SettlementType_new");
ALTER TABLE "waiting_list_stats" ALTER COLUMN "settlement_type" TYPE "SettlementType_new" USING ("settlement_type"::text::"SettlementType_new");
ALTER TYPE "SettlementType" RENAME TO "SettlementType_old";
ALTER TYPE "SettlementType_new" RENAME TO "SettlementType";
DROP TYPE "SettlementType_old";
COMMIT;
