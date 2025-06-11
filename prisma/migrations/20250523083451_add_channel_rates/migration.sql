-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT,
    "warehouse" TEXT,
    "origin" TEXT,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateRule" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "minWeight" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "weightType" TEXT NOT NULL,
    "divisor" INTEGER,
    "sideRule" TEXT,
    "extraFee" DOUBLE PRECISION,
    "baseRate" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION,
    "otherFee" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "RateRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RateRule" ADD CONSTRAINT "RateRule_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
