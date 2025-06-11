/*
  Warnings:

  - You are about to drop the column `attachments` on the `FBAOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FBAOrder" DROP COLUMN "attachments";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "waybillId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "FBAOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
