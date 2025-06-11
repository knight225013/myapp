import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// 去重后的佐川单号列表
const sagawaWaybills = [
  '365321708345',
  '365321342186',
  '365321414850',
  '365321984661',
  '365321510934',
  '365321593453',
  '365321602575',
  '365321660642',
  '365321342525',
  '365321785625',
  '365321996981',
  '365321565431',
  '365321997950',
  '365322133724',
  '365322164060',
  '365321630214',
  '365322186040',
  '365321349783',
  '365321740722',
  '365321615820',
  '365321678746',
  '365321737561',
  '365321273741',
  '365322162284',
  '365321278512',
  '365321855463',
  '365321308133',
  '365322005510',
  '365321430854',
  '365321600523',
  '365321485513',
  '365322010244',
  '365322066211',
  '365321887965',
  '365321340414',
  '365321486526',
  '365322085730',
  '365321810770',
  '365321575415',
  '365321792695',
  '365321656335',
  '365321936663',
  '365321890695',
  '365321538455',
  '365321644365',
  '365321228101',
  '365321406321',
  '365321269585',
  '365321203166',
  '365321760020',
  '365321872926',
  '365321816521',
  '365321912874',
  '365321899880',
  '365321557565',
  '365321554544',
  '365321186753',
  '365321311611',
  '365322151994',
  '365321251643',
  '365322190870',
  '365321704193',
  '365321553380',
  '365321932426',
  '365322106133',
  '365321740556',
  '365321756951',
  '365321469693',
  '365321421990',
  '365322106262',
  '365321232566',
  '365321908383',
  '365321527056',
  '365321899390',
];

// 去重单号
const uniqueWaybills = [...new Set(sagawaWaybills)];

async function importSagawaWaybills() {
  try {
    // 确保 Carrier 存在
    const carrier = await prisma.carrier.upsert({
      where: { name: 'Sagawa' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Sagawa',
        code: 'sagawa',
        region: 'nice_to_connect',
        logoUrl: 'https://static.aftership.com/couriers/logo/sagawa.png',
        createdAt: new Date(),
      },
    });

    // 使用提供的 ID
    const tenantId = 'b21918cb-9cb6-4482-ac33-19c70b2c0a12'; // 测试租户A
    const customerId = '380080d7-68eb-4461-b607-8c7d365f3fd1'; // 测试客户A
    const channelId = 'ac60eb9b-bf3e-433a-898f-f811a72f76b8'; // 测试

    // 验证 ID 存在
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });

    if (!tenant || !customer || !channel) {
      throw new Error('提供的 tenantId, customerId 或 channelId 无效');
    }

    // 批量导入运单
    let successCount = 0;
    let failureCount = 0;

    for (const trackingNumber of uniqueWaybills) {
      const trimmedNumber = trackingNumber.trim();
      if (!trimmedNumber) continue;

      try {
        // 检查是否已存在
        const existingOrder = await prisma.fBAOrder.findFirst({
          where: { trackingNumber: trimmedNumber },
        });

        if (existingOrder) {
          // 更新现有记录
          await prisma.fBAOrder.update({
            where: { id: existingOrder.id },
            data: { carrierId: carrier.id },
          });
          console.log(`✅ 更新成功：${trimmedNumber}`);
        } else {
          // 创建新记录
          await prisma.fBAOrder.create({
            data: {
              id: uuidv4(),
              trackingNumber: trimmedNumber,
              status: '已下单',
              type: 'FBA',
              country: '日本',
              quantity: 1,
              tenantId,
              customerId,
              channelId,
              carrierId: carrier.id, // 直接使用 carrier 的 id
              recipient: '未知收件人',
            },
          });
          console.log(`✅ 创建成功：${trimmedNumber}`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ 导入失败：${trimmedNumber} - ${error.message}`);
        failureCount++;
      }
    }

    console.log(
      `✅ 导入完成：成功 ${successCount} 条，失败 ${failureCount} 条，总计 ${uniqueWaybills.length} 条`,
    );
  } catch (error) {
    console.error('导入过程中发生错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importSagawaWaybills();
