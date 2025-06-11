-- AlterTable
ALTER TABLE "FBAOrder" ADD COLUMN     "volume" DOUBLE PRECISION,
ADD COLUMN     "volumetricWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TraditionalOrder" ADD COLUMN     "chargeWeight" DOUBLE PRECISION,
ADD COLUMN     "volume" DOUBLE PRECISION,
ADD COLUMN     "volumetricWeight" DOUBLE PRECISION;
