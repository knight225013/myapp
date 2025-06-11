/*
  Warnings:

  - A unique constraint covering the columns `[waybillRuleId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: 添加 Channel 表的新字段
ALTER TABLE "Channel"
    ADD COLUMN "aging" TEXT, -- 时效
ADD COLUMN "allowCancel" BOOLEAN NOT NULL DEFAULT false, -- 允许客户取消
ADD COLUMN "allowChannelChange" BOOLEAN NOT NULL DEFAULT false, -- 允许客户修改渠道
ADD COLUMN "allowEdit" BOOLEAN NOT NULL DEFAULT false, -- 允许客户修改
ADD COLUMN "allowLabelUpload" BOOLEAN NOT NULL DEFAULT false, -- 允许客户上传快递单号
ADD COLUMN "allowTrackingEntry" BOOLEAN NOT NULL DEFAULT false, -- 允许客户录入转单号
ADD COLUMN "assignedUser" TEXT, -- 指定用户
ADD COLUMN "boxPrecision" DOUBLE PRECISION, -- 箱计重精度
ADD COLUMN "chargeMethod" TEXT, -- 收费重方式
ADD COLUMN "code" TEXT, -- 渠道代码，允许为空
ADD COLUMN "controlBilling" BOOLEAN NOT NULL DEFAULT false, -- 下单费用控制
ADD COLUMN "controlReceivingFee" BOOLEAN NOT NULL DEFAULT false, -- 收货费用控制
ADD COLUMN "cubeRatio" DOUBLE PRECISION, -- 计方系数
ADD COLUMN "decimal" TEXT, -- 计费重小数位
ADD COLUMN "declareCurrency" TEXT, -- 申报币种
ADD COLUMN "defaultDeclareCurrency" TEXT, -- 默认申报币种
ADD COLUMN "enableBilling" BOOLEAN NOT NULL DEFAULT false, -- 下单计费
ADD COLUMN "enableCOD" BOOLEAN NOT NULL DEFAULT false, -- 开启代收货款
ADD COLUMN "hideCarrier" BOOLEAN NOT NULL DEFAULT false, -- 客户端不显示承运
ADD COLUMN "labelCode" TEXT, -- 标签代码
ADD COLUMN "maxBoxChargeWeight" DOUBLE PRECISION, -- 最大箱收费重
ADD COLUMN "maxBoxRealWeight" DOUBLE PRECISION, -- 最大箱实重
ADD COLUMN "maxDeclareValue" DOUBLE PRECISION, -- 产品最大申报价值
ADD COLUMN "maxPieces" INTEGER, -- 最大件数
ADD COLUMN "maxTicketChargeWeight" DOUBLE PRECISION, -- 最大票收费重
ADD COLUMN "maxTicketRealWeight" DOUBLE PRECISION, -- 最大票实重
ADD COLUMN "method" TEXT, -- 计费方式
ADD COLUMN "minBoxAvgWeight" DOUBLE PRECISION, -- 最低箱均重
ADD COLUMN "minBoxChargeWeight" DOUBLE PRECISION, -- 最低箱收费重
ADD COLUMN "minBoxChargeWeightLimit" DOUBLE PRECISION, -- 最低箱收费重限制
ADD COLUMN "minBoxMaterialWeight" DOUBLE PRECISION, -- 最低箱材重
ADD COLUMN "minBoxRealWeight" DOUBLE PRECISION, -- 最低箱实重
ADD COLUMN "minBoxRealWeightLimit" DOUBLE PRECISION, -- 最低箱实重限制
ADD COLUMN "minCharge" DOUBLE PRECISION, -- 最低应收运费
ADD COLUMN "minDeclareValue" DOUBLE PRECISION, -- 产品最小申报价值
ADD COLUMN "minPieces" INTEGER, -- 最小件数
ADD COLUMN "minTicketChargeWeight" DOUBLE PRECISION, -- 最低票收费重
ADD COLUMN "minTicketRealWeight" DOUBLE PRECISION, -- 最小票实重
ADD COLUMN "modifyVolRatio" BOOLEAN NOT NULL DEFAULT false, -- 修改计泡系数
ADD COLUMN "noAutoCancelAPIFail" BOOLEAN NOT NULL DEFAULT false, -- API 打单失败不自动取消
ADD COLUMN "noRefundOnCancel" BOOLEAN NOT NULL DEFAULT false, -- 取消不退款
ADD COLUMN "orderBySKULibrary" BOOLEAN NOT NULL DEFAULT false, -- 根据产品库 SKU 下单
ADD COLUMN "promptUnderpayment" BOOLEAN NOT NULL DEFAULT false, -- 收货欠费提示
ADD COLUMN "refundOnReturn" BOOLEAN NOT NULL DEFAULT false, -- 退件并退款
ADD COLUMN "requireEORI" BOOLEAN NOT NULL DEFAULT false, -- EORI 必填
ADD COLUMN "requireEmail" BOOLEAN NOT NULL DEFAULT false, -- 邮箱必填
ADD COLUMN "requirePackingList" BOOLEAN NOT NULL DEFAULT false, -- 装箱单必填
ADD COLUMN "requirePhone" BOOLEAN NOT NULL DEFAULT false, -- 电话必填
ADD COLUMN "requireSize" BOOLEAN NOT NULL DEFAULT false, -- 尺寸必填
ADD COLUMN "requireVAT" BOOLEAN NOT NULL DEFAULT false, -- VAT 必填
ADD COLUMN "requireVATFiling" BOOLEAN NOT NULL DEFAULT false, -- VAT 号备案
ADD COLUMN "requireWeight" BOOLEAN NOT NULL DEFAULT false, -- 重量必填
ADD COLUMN "restrictWarehouseCode" BOOLEAN NOT NULL DEFAULT false, -- 仅允许价格表中存在的仓库代码下单
ADD COLUMN "roundBeforeSplit" BOOLEAN NOT NULL DEFAULT false, -- 整票分泡前按票精度进位
ADD COLUMN "rounding" TEXT, -- 进位方式
ADD COLUMN "sender" TEXT, -- 发件人
ADD COLUMN "showBilling" BOOLEAN NOT NULL DEFAULT false, -- 下单显示费用
ADD COLUMN "showInWMS" BOOLEAN NOT NULL DEFAULT false, -- 在 WMS 中显示
ADD COLUMN "showSize" BOOLEAN NOT NULL DEFAULT false, -- 尺寸显示
ADD COLUMN "showSupplierData" BOOLEAN NOT NULL DEFAULT false, -- 显示供应商数据
ADD COLUMN "showWeight" BOOLEAN NOT NULL DEFAULT false, -- 重量显示
ADD COLUMN "sizePrecision" DOUBLE PRECISION, -- 尺寸精度
ADD COLUMN "splitRatio" DOUBLE PRECISION, -- 分泡比例
ADD COLUMN "ticketPrecision" DOUBLE PRECISION, -- 票计重精度
ADD COLUMN "userLevel" TEXT, -- 用户等级
ADD COLUMN "verifyImageLink" BOOLEAN NOT NULL DEFAULT false, -- 验证图片链接
ADD COLUMN "verifySalesLink" BOOLEAN NOT NULL DEFAULT false, -- 验证销售链接
ADD COLUMN "volRatio" DOUBLE PRECISION, -- 计泡系数
ADD COLUMN "waybillRuleId" TEXT; -- 运单号规则 ID

-- 为 Channel 表现有数据填充 code 值
UPDATE "Channel" SET "code" = 'CH-' || LEFT("name", 10) WHERE "code" IS NULL;

-- 设置 Channel 表的 code 字段为非空
ALTER TABLE "Channel" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable: 添加 FBAOrder 表的新字段
ALTER TABLE "FBAOrder"
    ADD COLUMN "allowCustomerCancel" BOOLEAN NOT NULL DEFAULT false, -- 是否允许客户取消
ADD COLUMN "billingPrecision" INTEGER, -- 计费精度
ADD COLUMN "chargeWeight" DOUBLE PRECISION, -- 收费重量
ADD COLUMN "isCOD" BOOLEAN NOT NULL DEFAULT false, -- 是否启用代收货款
ADD COLUMN "labelUploaded" BOOLEAN NOT NULL DEFAULT false, -- 是否已上传快递单号
ADD COLUMN "trackingNumber" TEXT, -- 客户上传的转单号
ADD COLUMN "waybillNumber" TEXT, -- 生成的运单号
ADD COLUMN "waybillRuleId" TEXT; -- 运单号规则 ID

-- CreateTable: 创建 WaybillRule 表
CREATE TABLE "WaybillRule" (
                               "id" TEXT NOT NULL, -- 运单号规则唯一 ID
                               "name" TEXT NOT NULL, -- 规则名称
                               "pattern" TEXT NOT NULL, -- 规则模式
                               "channelId" TEXT, -- 关联渠道 ID，可选
                               "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 创建时间

                               CONSTRAINT "WaybillRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: 为 WaybillRule 添加唯一索引
CREATE UNIQUE INDEX "WaybillRule_channelId_key" ON "WaybillRule"("channelId");

-- CreateIndex: 为 Channel 添加唯一索引
CREATE UNIQUE INDEX "Channel_waybillRuleId_key" ON "Channel"("waybillRuleId");

-- AddForeignKey: 为 FBAOrder 添加外键
ALTER TABLE "FBAOrder" ADD CONSTRAINT "FBAOrder_waybillRuleId_fkey" FOREIGN KEY ("waybillRuleId") REFERENCES "WaybillRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: 为 Channel 添加外键
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_waybillRuleId_fkey" FOREIGN KEY ("waybillRuleId") REFERENCES "WaybillRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;