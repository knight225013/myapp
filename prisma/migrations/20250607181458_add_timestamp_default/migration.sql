/*
  Warnings:

  - You are about to drop the `TraditionalOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Box" DROP CONSTRAINT "Box_tradOrderId_fkey";

-- DropForeignKey
ALTER TABLE "TraditionalOrder" DROP CONSTRAINT "TraditionalOrder_customerId_fkey";

-- DropForeignKey
ALTER TABLE "TraditionalOrder" DROP CONSTRAINT "TraditionalOrder_tenantId_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "attachments" JSONB;

-- DropTable
DROP TABLE "TraditionalOrder";
