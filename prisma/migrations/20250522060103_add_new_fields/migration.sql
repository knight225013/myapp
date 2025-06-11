-- AlterTable
ALTER TABLE "FBAOrder" ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "address3" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "declaredQuantity" INTEGER,
ADD COLUMN     "declaredValue" DOUBLE PRECISION,
ADD COLUMN     "hasDangerous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMagnetic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "sender" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "TraditionalOrder" ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "address3" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "declaredQuantity" INTEGER,
ADD COLUMN     "declaredValue" DOUBLE PRECISION,
ADD COLUMN     "hasDangerous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMagnetic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "sender" TEXT,
ADD COLUMN     "state" TEXT;
