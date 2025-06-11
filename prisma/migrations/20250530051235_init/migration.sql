-- CreateTable
CREATE TABLE "ShipmentLog" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remark" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShipmentLog" ADD CONSTRAINT "ShipmentLog_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "FBAOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
