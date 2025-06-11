/*
  Warnings:

  - Added the required column `fullCode` to the `Box` table without a default value. This is not possible if the table is not empty.
  - Made the column `channelId` on table `FBAOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FBAOrder" DROP CONSTRAINT "FBAOrder_channelId_fkey";

-- AlterTable
ALTER TABLE "Box" ADD COLUMN     "fullCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FBAOrder" ALTER COLUMN "channelId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
