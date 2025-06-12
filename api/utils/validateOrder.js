const { Pool } = require('pg'); // 导入 PostgreSQL 客户端
const dotenv = require('dotenv'); // 导入 dotenv 用于加载环境变量

// 加载环境变量
dotenv.config();

// 配置 PostgreSQL 连接池（适配 Docker 部署）
const pool = new Pool({
  user: process.env.DB_USER || 'yujiacheng', // 从环境变量获取用户名，添加默认值
  host: process.env.DB_HOST || 'localhost', // 从环境变量获取主机，默认为 localhost
  database: process.env.DB_NAME || 'fba_db', // 从环境变量获取数据库名，添加默认值
  password: process.env.DB_PASSWORD || '123456', // 从环境变量获取密码，添加默认值
  port: parseInt(process.env.DB_PORT || '5432'), // 从环境变量获取端口，默认为 5432
});

// 校验 FBAOrder 是否符合 Channel 限制
async function validateFBAOrderWithChannelRules(orderId) {
  // 查询订单，包含箱子和渠道信息
  const orderQuery = `
    SELECT
      f.*,
      c.*,
      json_agg(b.*) as boxes
    FROM "FBAOrder" f
           LEFT JOIN "Channel" c ON f."channelId" = c.id
           LEFT JOIN "Box" b ON b."fbaOrderId" = f.id
    WHERE f.id = $1
    GROUP BY f.id, c.id;
  `;
  const orderResult = await pool.query(orderQuery, [orderId]);
  const order = orderResult.rows[0];

  // 确保订单和渠道存在
  if (!order || !order.channelId) {
    throw new Error('订单或渠道不存在');
  }

  const c = order; // 渠道信息直接从查询结果获取
  const boxes = order.boxes || []; // 箱子信息
  const errors = []; // 错误信息数组

  // 校验件数
  if (c.minPieces && order.quantity < c.minPieces) {
    errors.push(`件数 ${order.quantity} 小于最小限制 ${c.minPieces}`);
  }
  if (c.maxPieces && order.quantity > c.maxPieces) {
    errors.push(`件数 ${order.quantity} 超过最大限制 ${c.maxPieces}`);
  }

  // 校验整票实重
  if (c.minTicketRealWeight && order.weight < c.minTicketRealWeight) {
    errors.push(`整票实重 ${order.weight} 低于最小限制 ${c.minTicketRealWeight}`);
  }
  if (c.maxTicketRealWeight && order.weight > c.maxTicketRealWeight) {
    errors.push(`整票实重 ${order.weight} 超过最大限制 ${c.maxTicketRealWeight}`);
  }

  // 校验整票收费重
  if (
    c.minTicketChargeWeight &&
    order.chargeWeight &&
    order.chargeWeight < c.minTicketChargeWeight
  ) {
    errors.push(`整票收费重 ${order.chargeWeight} 低于限制 ${c.minTicketChargeWeight}`);
  }
  if (
    c.maxTicketChargeWeight &&
    order.chargeWeight &&
    order.chargeWeight > c.maxTicketChargeWeight
  ) {
    errors.push(`整票收费重 ${order.chargeWeight} 超过限制 ${c.maxTicketChargeWeight}`);
  }

  // 校验单箱平均重量
  if (c.minBoxAvgWeight && boxes.length > 0) {
    const avgWeight = order.weight / boxes.length;
    if (avgWeight < c.minBoxAvgWeight) {
      errors.push(`单箱平均重量 ${avgWeight.toFixed(2)} 低于限制 ${c.minBoxAvgWeight}`);
    }
  }

  // 校验单箱
  for (const box of boxes) {
    if (c.minBoxRealWeightLimit && box.weight < c.minBoxRealWeightLimit) {
      errors.push(`箱子 ${box.code} 实重 ${box.weight} 低于限制 ${c.minBoxRealWeightLimit}`);
    }
    if (c.maxBoxRealWeight && box.weight > c.maxBoxRealWeight) {
      errors.push(`箱子 ${box.code} 实重 ${box.weight} 超过限制 ${c.maxBoxRealWeight}`);
    }
    if (c.minDeclareValue && box.declaredValue < c.minDeclareValue) {
      errors.push(`箱子 ${box.code} 申报价值 ${box.declaredValue} 低于限制 ${c.minDeclareValue}`);
    }
    if (c.maxDeclareValue && box.declaredValue > c.maxDeclareValue) {
      errors.push(`箱子 ${box.code} 申报价值 ${box.declaredValue} 超过限制 ${c.maxDeclareValue}`);
    }
  }

  // 如果有错误，记录到订单并抛出
  if (errors.length > 0) {
    const updateQuery = `
      UPDATE "FBAOrder"
      SET errors = $1
      WHERE id = $2;
    `;
    await pool.query(updateQuery, [errors, orderId]);
    throw new Error(errors.join('；'));
  }

  // 清除之前的错误记录
  const clearErrorsQuery = `
    UPDATE "FBAOrder"
    SET errors = '{}'
    WHERE id = $1;
  `;
  await pool.query(clearErrorsQuery, [orderId]);
  return { valid: true };
}

// 计算收费重（示例逻辑，需根据业务调整）
function calcChargeWeight(order) {
  const { weight, length, width, height, channel } = order;
  // 检查 channel 是否存在且包含 volRatio
  if (!channel || !channel.volRatio || !length || !width || !height) {
    return weight; // 无计泡系数或尺寸信息，返回实重
  }
  const volWeight = (length * width * height) / channel.volRatio; // 计算泡重
  return Math.max(weight, volWeight); // 取实重和泡重较大值
}

module.exports = {
  validateFBAOrderWithChannelRules,
  calcChargeWeight,
};
