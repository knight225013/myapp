const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 获取租户下的客户列表
async function getCustomers(req, res) {
  const { tenantId } = req.query;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: '缺少 tenantId 参数' });
  }

  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('获取客户列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getCustomers,
};
