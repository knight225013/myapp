/*
  Warnings:

  - You are about to drop the column `sender` on the `FBAOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FBAOrder" DROP COLUMN "sender",
ADD COLUMN     "senderId" TEXT,
ADD COLUMN     "senderName" TEXT,
ALTER COLUMN "warehouse" DROP NOT NULL,
ALTER COLUMN "declaredQuantity" SET DATA TYPE TEXT,
ALTER COLUMN "declaredValue" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
