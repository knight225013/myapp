import { NextRequest, NextResponse } from 'next/server';

// 模拟数据 - 在实际项目中应该从数据库获取
const mockOverview = {
  company: {
    companyName: '国际货运代理有限公司',
    logo: '/images/company-logo.png'
  },
  userCount: 15,
  warehouseCount: 3,
  customFieldCount: 8,
  lastAuditLog: {
    createdAt: new Date().toISOString(),
    user: {
      username: 'admin'
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    // 在实际项目中，这里应该：
    // 1. 验证用户权限
    // 2. 从数据库获取真实数据
    // 3. 处理错误情况

    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: mockOverview
    });
  } catch (error) {
    console.error('获取系统概览失败:', error);
    return NextResponse.json(
      { success: false, error: '获取系统概览失败' },
      { status: 500 }
    );
  }
} 