-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "baseFreightRate" DOUBLE PRECISION,
ADD COLUMN     "baseFreightUnit" TEXT;

-- AlterTable
ALTER TABLE "FBAOrder" ADD COLUMN     "freightCost" DOUBLE PRECISION,
ADD COLUMN     "totalCost" DOUBLE PRECISION;
