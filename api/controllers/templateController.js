const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.extraFeeTemplate.findMany();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  const { name, canvasW, canvasH, data } = req.body;
  try {
    const template = await prisma.extraFeeTemplate.create({
      data: { name, canvasW, canvasH, data },
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.extraFeeTemplate.delete({ where: { id } });
    res.json({ message: '模板已删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
