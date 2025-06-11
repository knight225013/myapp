/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_STAFF');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('VIEW_WAYBILL', 'CREATE_WAYBILL', 'UPDATE_WAYBILL', 'CANCEL_WAYBILL', 'VIEW_CUSTOMER', 'CREATE_CUSTOMER', 'UPDATE_CUSTOMER', 'VIEW_CHANNEL', 'UPDATE_CHANNEL', 'VIEW_REPORT', 'EXPORT_EXCEL', 'CREATE_STAFF', 'ASSIGN_ROLE', 'UPDATE_PASSWORD');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'TENANT_STAFF',
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Order";

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "type" "PermissionType" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fbaOrderId" TEXT,
    "tradOrderId" TEXT,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FBAOrder" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "cargo" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "warehouse" TEXT NOT NULL,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "hasBattery" BOOLEAN NOT NULL DEFAULT false,
    "clientCode" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "store" TEXT,
    "ref1" TEXT,
    "vat" TEXT,
    "ioss" TEXT,
    "eori" TEXT,
    "currency" TEXT,
    "category" TEXT,
    "productName" TEXT,
    "attrs" TEXT[],
    "notes" TEXT,
    "insurance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FBAOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraditionalOrder" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "cargo" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "warehouse" TEXT NOT NULL,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "hasBattery" BOOLEAN NOT NULL DEFAULT false,
    "clientCode" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "store" TEXT,
    "ref1" TEXT,
    "vat" TEXT,
    "ioss" TEXT,
    "eori" TEXT,
    "currency" TEXT,
    "category" TEXT,
    "productName" TEXT,
    "attrs" TEXT[],
    "notes" TEXT,
    "insurance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TraditionalOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_fbaOrderId_fkey" FOREIGN KEY ("fbaOrderId") REFERENCES "FBAOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_tradOrderId_fkey" FOREIGN KEY ("tradOrderId") REFERENCES "TraditionalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraditionalOrder" ADD CONSTRAINT "TraditionalOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraditionalOrder" ADD CONSTRAINT "TraditionalOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
