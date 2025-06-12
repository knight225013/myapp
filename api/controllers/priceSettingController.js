const { prisma } = require('../lib/prisma');
const { PriceSettingSchema } = require('../../prisma/zod/price');

exports.getSettingsByPriceId = async (req, res) => {
  try {
    const { priceId } = req.params;
    const settings = await prisma.priceSetting.findMany({
      where: { priceId }
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const result = PriceSettingSchema.omit({ id: true, createdAt: true }).safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.format() });
    }

    const setting = await prisma.priceSetting.create({
      data: result.data
    });
    res.status(201).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 