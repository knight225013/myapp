const { prisma } = require('../lib/prisma');
const priceImportService = require('../services/priceImportService');

exports.listPrices = async (req, res) => {
  const prices = await prisma.transportPrice.findMany();
  res.json(prices);
};

exports.createPrice = async (req, res) => {
  const data = req.body;
  const newPrice = await prisma.transportPrice.create({ data });
  res.status(201).json(newPrice);
};

exports.getPrice = async (req, res) => {
  const price = await prisma.transportPrice.findUnique({
    where: { id: req.params.priceId },
  });
  res.json(price);
};

exports.listSettings = async (req, res) => {
  const { priceId } = req.params;
  const settings = await prisma.priceSetting.findMany({ where: { priceId } });
  res.json(settings);
};

exports.createSetting = async (req, res) => {
  const { priceId } = req.params;
  const data = req.body;
  const newSetting = await prisma.priceSetting.create({
    data: { ...data, priceId },
  });
  res.status(201).json(newSetting);
};

exports.importPrices = async (req, res) => {
  const { priceId } = req.params;
  const { text } = req.body;
  const upserted = await priceImportService.upsertRows(priceId, text);
  res.json(upserted);
};

// 财务账单列表
exports.listBills = async (req, res) => {
  const { status } = req.query;
  try {
    const where = {};
    if (status) where.status = status;
    const bills = await prisma.financeBill.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        waybill: true,
      },
    });
    const formatted = bills.map(bill => ({
      id: bill.id,
      billNo: bill.billNo,
      clientName: bill.customer.companyName || bill.customer.name,
      totalAmount: bill.totalAmount,
      status: bill.status,
      createdAt: bill.createdAt,
      waybillNumber: bill.waybill.waybillNumber || bill.waybill.id,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('获取账单列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取单个财务账单详情
exports.getBill = async (req, res) => {
  const { billId } = req.params;
  try {
    const bill = await prisma.financeBill.findUnique({
      where: { id: billId },
      include: {
        customer: true,
        waybill: true,
        logs: true,
        attachments: true,
      },
    });
    if (!bill) {
      return res.status(404).json({ success: false, error: '账单不存在' });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('获取账单详情失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取仪表板数据
exports.dashboard = async (req, res) => {
  try {
    // 统计数据
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const bills = await prisma.financeBill.findMany();
    const totalReceivables = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const monthlyRevenue = bills
      .filter(b => new Date(b.createdAt) >= startOfMonth && new Date(b.createdAt) < endOfMonth)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const pendingInvoices = bills.filter(b => b.status === 'draft' || b.status === 'audited').length;
    // 这里示例设置其余为0，可根据业务完善
    const stats = {
      totalReceivables,
      totalPayables: 0,
      overdueAmount: 0,
      monthlyRevenue,
      pendingInvoices,
      creditAlerts: 0,
    };
    const recentActivity = [];
    res.json({ success: true, data: { stats, recentActivity } });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 搜索账单
exports.searchBills = async (req, res) => {
  const { q } = req.query;
  try {
    const queryStr = String(q || '');
    const bills = await prisma.financeBill.findMany({
      where: {
        OR: [
          { billNo: { contains: queryStr } },
          { customer: { is: { name: { contains: queryStr } } } },
          { customer: { is: { companyName: { contains: queryStr } } } },
        ],
      },
      include: { customer: true, waybill: true },
      orderBy: { createdAt: 'desc' },
    });
    const formatted = bills.map(bill => ({
      id: bill.id,
      billNo: bill.billNo,
      clientName: bill.customer.companyName || bill.customer.name,
      totalAmount: bill.totalAmount,
      status: bill.status,
      createdAt: bill.createdAt,
      waybillNumber: bill.waybill?.waybillNumber || bill.waybillId,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('搜索账单失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
