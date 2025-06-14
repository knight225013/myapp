const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { applyChannelRules } = require('../utils/channelUtils');
const { calculateBoxSummary } = require('../utils/boxSummary');
const prisma = new PrismaClient();

exports.uploadAndParseLabel = async (req, res) => {
  try {
    const originalPath = req.file.path;
    const hasPdfSuffix = originalPath.endsWith('.pdf');
    const renamedPath = hasPdfSuffix ? originalPath : `${originalPath}.pdf`;

    // 如果没有 .pdf 后缀，则重命名加上
    if (!hasPdfSuffix) fs.renameSync(originalPath, renamedPath);

    const filePath = path.resolve(renamedPath);
    const channelId = req.body.channelId;

    console.log('📂 文件路径:', filePath);

    const pyProcess = spawn('python', ['extract_pdf.py', filePath]);
    let stdoutBuffer = [];
    let stderrBuffer = [];

    pyProcess.stdout.on('data', (data) => stdoutBuffer.push(data));
    pyProcess.stderr.on('data', (data) => stderrBuffer.push(data));

    pyProcess.on('close', async (code) => {
      const stdout = Buffer.concat(stdoutBuffer).toString('utf8');
      const stderr = Buffer.concat(stderrBuffer).toString('utf8');

      console.log('📦 stdout 输出:', stdout);
      console.log('❗ stderr 输出:', stderr);

      if (code !== 0) {
        return res.status(500).json({ error: 'Python 脚本执行失败', detail: stderr });
      }

      try {
        const data = JSON.parse(stdout);

        const parsedData = {
          type: 'FBA',
          channelId,
          recipient: (data['收货地'] || '').split('\n')[0] || '默认收件人',
          country: data['收货国家'] || '中国',
          senderName: (data['发货地址'] || '').split('\n')[0] || '默认发件人',
          warehouse: data['仓库地址'] || '',
          quantity: parseInt(data['箱数']) || 1,
          attachments: [
            {
              name: req.file.originalname,
              path: renamedPath,
              type: 'PDF',
            },
          ],
        };

        const tenant = await prisma.tenant.findFirst();
        const customer = await prisma.user.findFirst();
        if (!tenant || !customer) {
          return res.status(500).json({ error: '租户或客户不存在' });
        }

        const channel = await prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel) {
          return res.status(400).json({ error: `无效渠道 ID: ${channelId}` });
        }

        const boxCount = parsedData.quantity;
        const finalBoxes = Array(boxCount)
          .fill({})
          .map((_, i) => ({
            code: `${i + 1}`,
            fullCode: `BX${String(i + 1).padStart(6, '0')}`,
            weight: 0,
            length: null,
            width: null,
            height: null,
            hasBattery: false,
            declaredValue: 0.0,
            declaredQuantity: 1,
            productNameEn: '',
            productNameCn: '',
            material: '',
          }));

        // 计算重量和体积数据
        const boxSummary = calculateBoxSummary(finalBoxes, channel);
        const chargeWeightResult = applyChannelRules(
          boxSummary.totalWeight,
          boxSummary.volumetricWeight,
          channel
        );

        const newWaybill = await prisma.fBAOrder.create({
          data: {
            type: 'FBA',
            status: '已下单',
            tenant: { connect: { id: tenant.id } },
            customer: { connect: { id: customer.id } },
            recipient: parsedData.recipient,
            country: parsedData.country,
            warehouse: parsedData.warehouse,
            quantity: boxCount,
            weight: boxSummary.totalWeight,
            volume: boxSummary.volume,
            volumetricWeight: boxSummary.volumetricWeight,
            chargeWeight: chargeWeightResult.chargeWeight || 0,
            channel: { connect: { id: channelId } },
            senderName: parsedData.senderName,
            boxes: { create: finalBoxes },
            attachments: { create: parsedData.attachments },
          },
          include: {
            boxes: true,
            channel: true,
          },
        });

        await prisma.shipmentLog.create({
          data: {
            shipmentId: newWaybill.id,
            status: '已下单',
            remark: '系统自动创建运单',
            timestamp: new Date(),
          },
        });

        return res.json({
          success: true,
          data: newWaybill,
          message: '🎉 运单已成功创建',
        });
      } catch (e) {
        console.error('❌ JSON 解析失败或创建失败:', e);
        return res.status(500).json({ error: '解析或创建失败', detail: e.message });
      }
    });
  } catch (outerErr) {
    console.error('❌ 控制器异常:', outerErr);
    return res.status(500).json({ error: '服务器错误', detail: outerErr.message });
  }
};
