// src/controllers/labelTemplateController.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuid } = require('uuid');
const { renderWithTemplate } = require('../utils/renderWithTemplate');
const { renderPdfBuffer } = require('../utils/renderPdfBuffer');
const { mergePdfBuffers } = require('../utils/mergePdfBuffers');
const { renderLabelsForWaybills } = require('../utils/renderLabelsForWaybills');

const prisma = new PrismaClient();

exports.createTemplate = async (req, res) => {
  try {
    const { name, description, content, width, height, priority, remark } = req.body;
    const newTemplate = await prisma.labelTemplate.create({
      data: {
        id: uuid(),
        name,
        description,
        content,
        width,
        height,
        priority: priority || 0,
        remark,
      },
    });
    res.json({ success: true, data: newTemplate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, width, height, priority, remark } = req.body;
    const updated = await prisma.labelTemplate.update({
      where: { id },
      data: { name, description, content, width, height, priority: priority || 0, remark },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLabelTemplates = async (req, res) => {
  try {
    const templates = await prisma.labelTemplate.findMany({ select: { id: true, name: true } });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.downloadLabels = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ success: false, error: '缺少运单 ID 数组' });
  }

  try {
    const waybills = await prisma.fBAOrder.findMany({
      where: { id: { in: ids } },
      include: { channel: { include: { labelTemplate: true } }, sender: true, boxes: true },
    });

    const pdfBuffers = await Promise.all(
      waybills.map(async (waybill) => {
        const template = waybill.channel?.labelTemplate;
        if (!template) throw new Error(`运单 ${waybill.id} 的渠道未绑定标签模板`);

        const data = {
          waybillNumber: waybill.id,
          recipient: waybill.recipient,
          country: waybill.country,
          address1: waybill.address1,
          phone: waybill.phone,
          senderName: waybill.sender?.name || waybill.senderName,
          trackingNumber: waybill.trackingNumber,
          weight: waybill.weight,
          quantity: waybill.quantity,
          createdAt: waybill.createdAt,
        };

        const html = renderWithTemplate(template.content, data);
        return await renderPdfBuffer(html, template.width, template.height);
      }),
    );

    const merged = await mergePdfBuffers(pdfBuffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=labels.pdf');
    res.send(merged);
  } catch (error) {
    console.error('下载标签失败:', error);
    res.status(500).json({ success: false, error: '标签下载失败: ' + error.message });
  }
};
