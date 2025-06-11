/*
  Warnings:

  - You are about to drop the column `attachments` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "attachments";

-- AlterTable
ALTER TABLE "FBAOrder" ADD COLUMN     "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[];
