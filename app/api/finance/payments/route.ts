import { NextRequest, NextResponse } from 'next/server';

// 模拟付款数据
const mockPayments = [
  {
    id: '1',
    paymentNumber: 'PAY-2024-001',
    customerId: '1',
    customerName: '上海贸易公司',
    amount: 15600.00,
    currency: 'CNY',
    method: 'BANK_TRANSFER',
    paymentDate: '2024-01-15',
    transactionRef: 'TXN20240115001',
    description: '发票INV-2024-001付款',
    status: 'COMPLETED',
    invoiceId: '1',
    invoiceNumber: 'INV-2024-001',
    isAdvance: false,
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    paymentNumber: 'PAY-2024-002',
    customerId: '2',
    customerName: '深圳物流有限公司',
    amount: 8500.00,
    currency: 'USD',
    method: 'ALIPAY',
    paymentDate: '2024-01-14',
    transactionRef: 'ALI20240114002',
    description: '预付款',
    status: 'COMPLETED',
    isAdvance: true,
    createdAt: '2024-01-14 15:20:00'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredPayments = mockPayments;

    if (customerId) {
      filteredPayments = filteredPayments.filter(payment => payment.customerId === customerId);
    }

    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }

    if (method) {
      filteredPayments = filteredPayments.filter(payment => payment.method === method);
    }

    if (startDate) {
      filteredPayments = filteredPayments.filter(payment => payment.paymentDate >= startDate);
    }

    if (endDate) {
      filteredPayments = filteredPayments.filter(payment => payment.paymentDate <= endDate);
    }

    return NextResponse.json({
      success: true,
      data: filteredPayments,
      total: filteredPayments.length
    });
  } catch (error) {
    console.error('获取付款记录失败:', error);
    return NextResponse.json(
      { success: false, error: '获取付款记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.customerId || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段或金额无效' },
        { status: 400 }
      );
    }

    if (!body.isAdvance && !body.invoiceId) {
      return NextResponse.json(
        { success: false, error: '非预付款必须关联发票' },
        { status: 400 }
      );
    }

    // 生成付款编号
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(mockPayments.length + 1).padStart(3, '0')}`;

    // 创建新付款记录
    const newPayment = {
      id: Date.now().toString(),
      paymentNumber,
      customerId: body.customerId,
      customerName: body.customerName || '未知客户',
      amount: parseFloat(body.amount),
      currency: body.currency || 'CNY',
      method: body.method || 'BANK_TRANSFER',
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
      transactionRef: body.transactionRef || '',
      description: body.description || '',
      status: 'COMPLETED', // 简化处理，直接设为已完成
      invoiceId: body.invoiceId || null,
      invoiceNumber: body.invoiceNumber || null,
      isAdvance: body.isAdvance || false,
      createdAt: new Date().toLocaleString()
    };

    // 这里应该保存到数据库
    mockPayments.push(newPayment);

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: '付款记录创建成功'
    });
  } catch (error) {
    console.error('创建付款记录失败:', error);
    return NextResponse.json(
      { success: false, error: '创建付款记录失败' },
      { status: 500 }
    );
  }
} 