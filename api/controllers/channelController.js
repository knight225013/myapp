const {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  estimateCost,
  exportChannels,
  importChannels,
  getWaybillRules,
} = require('../services/channelService');

exports.getChannels = async (req, res) => {
  console.log('✅ 命中 getChannels 接口');
  try {
    const channels = await getChannels();
    res.json({ success: true, data: channels });
  } catch (error) {
    console.error('❌ 获取渠道失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const channel = await createChannel(req.body);
    res.json({ success: true, channel });
  } catch (error) {
    res.status(error.message.includes('已存在') ? 400 : 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateChannel = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updateChannel(id, req.body);
    res.json({ success: true, channel: updated });
  } catch (error) {
    res.status(error.message.includes('无效') ? 400 : 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteChannel = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteChannel(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.estimateCost = async (req, res) => {
  const { length, width, height, weight, country, warehouse, origin } = req.body;
  try {
    const results = await estimateCost(length, width, height, weight, country, warehouse, origin);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportChannels = async (req, res) => {
  try {
    const buffer = await exportChannels();
    res.setHeader('Content-Disposition', 'attachment; filename=channels.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.importChannels = async (req, res) => {
  const { file } = req.body;
  try {
    await importChannels(file);
    res.json({ success: true, message: '批量导入成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWaybillRules = async (req, res) => {
  try {
    const rules = await getWaybillRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};