const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await prisma.fBAOrder.findUnique({
      where: { id: req.params.id },
      include: { boxes: true },
    });
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateShipment = async (req, res) => {
  const {
    client,
    sender,
    vat,
    clientCode,
    company,
    phone,
    email,
    store,
    ref1,
    ioss,
    eori,
    currency,
    category,
    productName,
    attrs,
    notes,
    insurance,
  } = req.body;
  try {
    const updated = await prisma.fBAOrder.update({
      where: { id: req.params.id },
      data: {
        recipient: client,
        sender,
        vat,
        clientCode,
        company,
        phone,
        email,
        store,
        ref1,
        ioss,
        eori,
        currency,
        category,
        productName,
        attrs,
        notes,
        insurance,
      },
      include: { boxes: true },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
