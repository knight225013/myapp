/*
  Warnings:

  - You are about to drop the column `channel` on the `FBAOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Box" ADD COLUMN     "hasBattery" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "weight" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FBAOrder" DROP COLUMN "channel",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "errors" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
