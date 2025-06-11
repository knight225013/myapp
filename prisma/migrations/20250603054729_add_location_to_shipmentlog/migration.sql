/*
  Warnings:

  - You are about to drop the column `labelTemplateId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the `LabelTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_labelTemplateId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "labelTemplateId";

-- AlterTable
ALTER TABLE "ShipmentLog" ADD COLUMN     "location" TEXT,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- DropTable
DROP TABLE "LabelTemplate";
