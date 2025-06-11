const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCarriers = async (req, res) => {
  try {
    const carriers = await prisma.carrier.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        website: true,
        logoUrl: true,
        description: true,
        region: true,
      },
    });
    res.json({ success: true, data: carriers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
