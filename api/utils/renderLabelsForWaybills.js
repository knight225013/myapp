// src/utils/renderLabelsForWaybills.js
const { renderWithTemplate } = require('./renderWithTemplate');
const { renderPdfBuffer } = require('./renderPdfBuffer');
const { mergePdfBuffers } = require('./mergePdfBuffers');

exports.renderLabelsForWaybills = async function (waybills) {
  const buffers = await Promise.all(
    waybills.map(async (waybill) => {
      const template = waybill.channel?.labelTemplate;
      if (!template) {
        throw new Error(`运单 ${waybill.id} 的渠道未绑定标签模板`);
      }

      const data = {
        waybillNumber: waybill.id,
        recipient: waybill.recipient,
        country: waybill.country,
        address1: waybill.address1,
        phone: waybill.phone,
        senderName: waybill.senderName,
        trackingNumber: waybill.trackingNumber,
        weight: waybill.weight,
        quantity: waybill.quantity,
        createdAt: waybill.createdAt,
      };

      const html = renderWithTemplate(template.content, data);
      return await renderPdfBuffer(html, template.width, template.height);
    }),
  );

  return await mergePdfBuffers(buffers);
};
