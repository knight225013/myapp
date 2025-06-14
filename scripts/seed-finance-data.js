const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFinanceData() {
  try {
    // 先创建租户
    const tenant = await prisma.tenant.upsert({
      where: { id: 'test-tenant-id' },
      update: {},
      create: {
        id: 'test-tenant-id',
        name: '测试租户'
      }
    });

    // 创建测试客户
    const customer = await prisma.customer.upsert({
      where: { id: 'test-customer-id' },
      update: {},
      create: {
        id: 'test-customer-id',
        name: '测试客户',
        email: 'test@example.com',
        phone: '13800138000',
        address: '测试地址',
        status: 'ACTIVE',
        settlementMethod: 'MONTHLY',
        tenantId: tenant.id
      }
    });

    // 创建测试账单
    const bills = [
      {
        id: 'bill-draft-001',
        billNo: 'BILL20241201001',
        customerId: customer.id,
        totalAmount: 1500.00,
        status: 'draft'
      },
      {
        id: 'bill-audited-002',
        billNo: 'BILL20241201002',
        customerId: customer.id,
        totalAmount: 2300.50,
        status: 'audited'
      },
      {
        id: 'bill-issued-003',
        billNo: 'BILL20241201003',
        customerId: customer.id,
        totalAmount: 890.75,
        status: 'issued'
      },
      {
        id: 'bill-settled-004',
        billNo: 'BILL20241201004',
        customerId: customer.id,
        totalAmount: 3200.00,
        status: 'settled'
      },
      {
        id: 'bill-void-005',
        billNo: 'BILL20241201005',
        customerId: customer.id,
        totalAmount: 450.25,
        status: 'void'
      }
    ];

    for (const billData of bills) {
      const bill = await prisma.financeBill.upsert({
        where: { billNo: billData.billNo },
        update: {},
        create: billData
      });

      // 为每个账单创建日志
      const logs = [
        {
          billId: bill.id,
          status: 'draft',
          remark: '账单创建',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天前
        }
      ];

      if (bill.status !== 'draft') {
        logs.push({
          billId: bill.id,
          status: 'audited',
          remark: '账单审核通过',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5天前
        });
      }

      if (bill.status === 'issued' || bill.status === 'settled') {
        logs.push({
          billId: bill.id,
          status: 'issued',
          remark: '发票已开具',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
        });
      }

      if (bill.status === 'settled') {
        logs.push({
          billId: bill.id,
          status: 'settled',
          remark: '账单已结算',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
        });
      }

      if (bill.status === 'void') {
        logs.push({
          billId: bill.id,
          status: 'void',
          remark: '账单已作废',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
        });
      }

      // 创建日志记录
      for (const logData of logs) {
        await prisma.billLog.upsert({
          where: { 
            id: `${logData.billId}-${logData.status}` 
          },
          update: {},
          create: {
            id: `${logData.billId}-${logData.status}`,
            ...logData
          }
        });
      }
    }

    console.log('✅ 财务测试数据创建成功');
    console.log(`创建了 ${bills.length} 个测试账单及其日志`);
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFinanceData(); 