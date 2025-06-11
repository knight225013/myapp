import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('开始插入 WaybillRule 数据...');
  await prisma.waybillRule.createMany({
    data: [
      { id: 'rule-1', name: '标准运单号', pattern: 'WB{YYYYMMDD}{SEQ}' },
      { id: 'rule-2', name: '快速运单号', pattern: 'EX{YYYYMMDD}{SEQ}' },
    ],
    skipDuplicates: true,
  });
  console.log('WaybillRule 数据已插入');
}

main()
  .catch((error) => {
    console.error('种子脚本错误:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
