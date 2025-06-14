import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BillDetail {
  id: string;
  billNo: string;
  clientName: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  waybills: Array<{
    id: string;
    chargeWeight: number;
    channel: {
      id: string;
      name: string;
      unitPrice: number;
      extraFeeRules: any;
    };
  }>;
  logs: Array<{
    id: string;
    status: string;
    remark: string;
    timestamp: Date;
  }>;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
  }>;
}

export class BillService {
  // 获取账单详情
  static async getBillDetail(billId: string) {
    try {
      const bill = await prisma.financeBill.findUnique({
        where: { id: billId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          logs: {
            orderBy: {
              timestamp: 'desc',
            },
          },
          attachments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return bill;
    } catch (error) {
      console.error('获取账单详情失败:', error);
      throw error;
    }
  }

  // 获取账单日志
  static async getBillLogs(billId: string) {
    return await prisma.billLog.findMany({
      where: { billId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // 添加账单日志
  static async addBillLog(billId: string, status: string, remark?: string) {
    return await prisma.billLog.create({
      data: {
        billId,
        status,
        remark,
      },
    });
  }

  // 更新账单状态
  static async updateBillStatus(billId: string, status: string, remark?: string) {
    // 更新账单状态
    const bill = await prisma.financeBill.update({
      where: { id: billId },
      data: { status },
    });

    // 添加日志
    await this.addBillLog(billId, status, remark);

    return bill;
  }

  // 审核账单
  static async auditBill(billId: string, remark?: string) {
    return await this.updateBillStatus(billId, 'audited', remark || '账单已审核');
  }

  // 开票
  static async issueBill(billId: string, remark?: string) {
    return await this.updateBillStatus(billId, 'issued', remark || '账单已开票');
  }

  // 结算
  static async settleBill(billId: string, remark?: string) {
    return await this.updateBillStatus(billId, 'settled', remark || '账单已结算');
  }

  // 添加附件
  static async addAttachment(billId: string, url: string, filename: string, fileSize?: number, mimeType?: string) {
    return await prisma.billAttachment.create({
      data: {
        billId,
        url,
        filename,
        fileSize,
        mimeType,
      },
    });
  }

  // 计算费用详情
  static calculateFeeDetails(waybills: any[] = []) {
    let totalFreight = 0;
    let totalExtraFees = 0;
    const feeBreakdown: any[] = [];

    waybills.forEach(waybill => {
      const freight = (waybill.chargeWeight || 0) * (waybill.channel?.chargePrice || 0);
      totalFreight += freight;

      // 计算额外费用
      const extraFeeRules = waybill.channel?.extraFeeRules || [];
      let waybillExtraFees = 0;

      if (Array.isArray(extraFeeRules)) {
        extraFeeRules.forEach((rule: any) => {
          const amount = this.calculateExtraFeeAmount(rule, waybill);
          waybillExtraFees += amount;
          totalExtraFees += amount;

          feeBreakdown.push({
            waybillId: waybill.id,
            ruleName: rule.name,
            ruleParams: rule.params,
            amount,
          });
        });
      }
    });

    return {
      totalFreight,
      totalExtraFees,
      totalAmount: totalFreight + totalExtraFees,
      feeBreakdown,
    };
  }

  // 计算单个额外费用
  private static calculateExtraFeeAmount(rule: any, waybill: any): number {
    // 这里实现具体的费用计算逻辑
    // 根据规则类型和参数计算费用
    switch (rule.type) {
      case 'fixed':
        return rule.amount || 0;
      case 'percentage':
        return (waybill.chargeWeight || 0) * (rule.rate || 0);
      case 'weight_based':
        return (waybill.chargeWeight || 0) * (rule.unitPrice || 0);
      default:
        return 0;
    }
  }
} 