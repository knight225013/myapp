const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 路由模块引入
app.use('/api/waybills', require('./routes/waybillRoutes'));
app.use('/api/channels', require('./routes/channelRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/boxes', require('./routes/boxRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/track', require('./routes/trackRoutes'));
app.use('/api/carriers', require('./routes/carrierRoutes'));
app.use('/api/upload-labels', require('./routes/uploadLabelRoutes'));

// 新增路由
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/sales-reps', require('./routes/salesRepRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/template-upload', require('./routes/templateUploadRoutes'));
app.use('/api/settings', require('./routes/settings'));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(4000, () => {
  console.log('🚀 Server running on http://localhost:4000');
}); 