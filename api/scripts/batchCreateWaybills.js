const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 获取一个有效的渠道ID
  const channel = await prisma.channel.findFirst();
  if (!channel) throw new Error('请先在数据库中创建至少一个渠道');
  const channelId = channel.id;

  // 获取租户、客户、操作人
  const tenant = await prisma.tenant.findFirst();
  const customer = await prisma.customer.findFirst();
  const user = await prisma.user.findFirst();
  if (!tenant || !customer || !user) throw new Error('请先确保有租户、客户、用户');

  const statuses = [
    { status: '已下单', count: 16 },
    { status: '已收货', count: 3 },
    { status: '转运中', count: 12 },
    { status: '已签收', count: 11 },
    { status: '退件', count: 2 },
    { status: '已取消', count: 2 },
  ];
  const countryList = ['中国', '美国', '日本', '德国', '越南', '马来西亚'];
  const random = arr => arr[Math.floor(Math.random() * arr.length)];

  let idx = 1;
  const now = new Date();
  const waybills = [];
  for (const { status, count } of statuses) {
    for (let i = 0; i < count; i++) {
      waybills.push({
        id: `WB${Date.now()}${idx}`,
        type: 'FBA',
        status,
        recipient: `测试收件人${idx}`,
        country: random(countryList),
        warehouse: `仓库${Math.ceil(Math.random() * 3)}`,
        quantity: Math.ceil(Math.random() * 3),
        channelId,
        tenantId: tenant.id,
        customerId: customer.id,
        userId: user.id,
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 1000000000)),
      });
      idx++;
    }
  }

  // 批量插入
  for (const data of waybills) {
    await prisma.fBAOrder.create({ data });
    console.log(`已创建运单: ${data.id} 状态: ${data.status}`);
  }
  console.log('批量创建完成！');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 