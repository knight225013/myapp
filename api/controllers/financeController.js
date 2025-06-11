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
