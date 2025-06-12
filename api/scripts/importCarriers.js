const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importCarriersFromExcel() {
  try {
    const workbook = xlsx.readFile('./carriers.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const name = row['Carrier']?.trim();
      const slug =
        row['Slugs - requires no connection'] || row['Slugs - requires connection'] || '';
      const region = row['Type'] || 'global';

      if (!name) continue;

      const existing = await prisma.carrier.findFirst({ where: { name } });
      if (existing) continue;

      await prisma.carrier.create({
        data: {
          name,
          code: slug,
          website: '', // 可从 AfterShip 或其他来源补充
          logoUrl: `https://static.aftership.com/couriers/logo/${slug}.png` || '', // AfterShip 提供的 logo URL
          description: '', // 可后续补充
          region,
        },
      });
    }

    console.log('✅ 物流商导入完成');
  } catch (e) {
    console.error('导入失败:', e);
  } finally {
    await prisma.$disconnect();
  }
}

importCarriersFromExcel().catch((e) => {
  console.error(e);
  process.exit(1);
});
