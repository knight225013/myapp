import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        financeContact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        loginLogs: {
          orderBy: {
            loginAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            ip: true,
            device: true,
            userAgent: true,
            loginAt: true
          }
        },
        fbaOrders: {
          select: {
            status: true,
            createdAt: true,
            totalCost: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // 计算运单状态统计
    const shipmentStats = client.fbaOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 计算账户余额（模拟数据）
    const accountBalance = Math.random() * 10000 - 2000; // 随机生成余额，可能为负数

    // 计算逾期金额（模拟数据）
    const overdueAmount = Math.random() * 5000;

    // 获取最近60天的运单趋势数据
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 修复：使用正确的字段名和查询逻辑
    const shipmentTrend = await prisma.fBAOrder.findMany({
      where: {
        customerId: params.id,
        createdAt: {
          gte: sixtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 处理趋势数据，按日期分组 - 修复数据处理逻辑
    const trendData = [];
    const dateCountMap = new Map<string, number>();
    
    // 统计每天的运单数量
    shipmentTrend.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
    });
    
    // 生成完整的60天数据，包括没有运单的日期
    for (let i = 59; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        count: dateCountMap.get(dateStr) || 0
      });
    }

    // 确保数据有效性
    const validTrendData = trendData.filter(item => {
      const date = new Date(item.date);
      return !isNaN(date.getTime()) && typeof item.count === 'number' && item.count >= 0;
    });

    const responseData = {
      ...client,
      shipmentStats,
      accountBalance: Number(accountBalance.toFixed(2)),
      overdueAmount: Number(overdueAmount.toFixed(2)),
      shipmentTrend: validTrendData,
      lastLogin: client.loginLogs[0] || null
    };

    return NextResponse.json({ 
      success: true, 
      data: responseData 
    });
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateData: any = {};
    
    // 基本信息更新
    if (body.contactName) updateData.name = body.contactName;
    if (body.phoneNumber) updateData.phone = body.phoneNumber;
    if (body.email) updateData.email = body.email;
    if (body.address) updateData.address = body.address;
    if (body.companyName) updateData.companyName = body.companyName;
    if (body.status) updateData.status = body.status;
    if (body.notes) updateData.notes = body.notes;
    
    // 销售代表更新
    if (body.hasOwnProperty('financeContactId')) {
      updateData.financeContactId = body.financeContactId;
    }
    
    const client = await prisma.customer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        financeContact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id.replace('#', ''); // Remove the # prefix if present
    
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 