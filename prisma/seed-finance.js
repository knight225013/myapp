const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建财务测试数据...');

  // 先创建租户
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-001' },
    update: {},
    create: {
      id: 'tenant-001',
      name: '测试租户',
    },
  });

  console.log('测试租户已创建:', tenant.name);

  // 创建测试用户
  const user = await prisma.user.upsert({
    where: { id: 'user-001' },
    update: {},
    create: {
      id: 'user-001',
      name: '测试用户',
      email: 'user@example.com',
      password: 'password123',
      tenantId: tenant.id,
    },
  });

  console.log('测试用户已创建:', user.name);

  // 创建测试客户
  const customer = await prisma.customer.upsert({
    where: { id: 'customer-test-001' },
    update: {},
    create: {
      id: 'customer-test-001',
      name: '测试客户',
      email: 'test@example.com',
      phone: '13800138000',
      status: 'ACTIVE',
      tenantId: tenant.id,
      settlementMethod: 'MONTHLY',
    },
  });

  console.log('测试客户已创建:', customer.name);

  // 创建测试账单
  const bills = [
    {
      id: 'bill-draft-001',
      billNo: 'BILL20241201001',
      customerId: customer.id,
      totalAmount: 1500.00,
      status: 'draft',
    },
    {
      id: 'bill-audited-001',
      billNo: 'BILL20241201002',
      customerId: customer.id,
      totalAmount: 2300.50,
      status: 'audited',
    },
    {
      id: 'bill-issued-001',
      billNo: 'BILL20241201003',
      customerId: customer.id,
      totalAmount: 3200.75,
      status: 'issued',
    },
    {
      id: 'bill-settled-001',
      billNo: 'BILL20241201004',
      customerId: customer.id,
      totalAmount: 1800.25,
      status: 'settled',
    },
    {
      id: 'bill-void-001',
      billNo: 'BILL20241201005',
      customerId: customer.id,
      totalAmount: 950.00,
      status: 'void',
    },
  ];

  for (const billData of bills) {
    const bill = await prisma.financeBill.upsert({
      where: { billNo: billData.billNo },
      update: {},
      create: billData,
    });

    // 为每个账单创建一些日志
    await prisma.billLog.upsert({
      where: { id: `${billData.id}-log-001` },
      update: {},
      create: {
        id: `${billData.id}-log-001`,
        billId: bill.id,
        status: billData.status,
        remark: `账单${billData.status === 'draft' ? '创建' : '状态更新'}`,
      },
    });

    console.log(`账单已创建: ${bill.billNo} (${bill.status})`);
  }

  console.log('财务测试数据创建完成！');
}

main()
  .catch((error) => {
    console.error('种子脚本错误:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 