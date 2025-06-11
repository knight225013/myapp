// src/controllers/feeRuleController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFeeRule(req, res) {
  try {
    const { channelId, rules } = req.body;
    if (!channelId || !Array.isArray(rules)) {
      return res.status(400).json({ success: false, error: 'Invalid channelId or rules' });
    }

    const channel = await prisma.channel.update({
      where: { id: channelId },
      data: { extraFeeRules: rules },
    });

    res.json({ success: true, data: channel });
  } catch (error) {
    console.error('Create fee rule error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getFeeRules(req, res) {
  try {
    const { channelId } = req.params;
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { extraFeeRules: true },
    });

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    res.json({ success: true, data: channel.extraFeeRules || [] });
  } catch (error) {
    console.error('Get fee rules error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createFeeRule,
  getFeeRules,
};
