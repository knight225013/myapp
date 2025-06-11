/*
  Warnings:

  - You are about to drop the column `baseFreightRate` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `baseFreightUnit` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "baseFreightRate",
DROP COLUMN "baseFreightUnit",
ADD COLUMN     "chargePrice" DOUBLE PRECISION,
ADD COLUMN     "chargeWeight" DOUBLE PRECISION;
