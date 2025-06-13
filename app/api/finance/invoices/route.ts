import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 模拟发票数据结构（实际应该在Prisma schema中定义）
interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  customerId: string;
  customerName: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  balanceAmount: number;
  issueDate: Date;
  dueDate: Date;
  description?: string;
  terms?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/finance/invoices - 获取发票列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // 模拟发票数据（实际应该从数据库查询）
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        type: 'COMMERCIAL',
        status: 'PENDING',
        customerId: 'customer-1',
        customerName: '示例客户有限公司',
        currency: 'CNY',
        subtotal: 1000.00,
        taxAmount: 130.00,
        totalAmount: 1130.00,
        balanceAmount: 1130.00,
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        description: '货运服务费',
        terms: '30天付款',
        createdBy: 'system',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        type: 'COMMERCIAL',
        status: 'PAID',
        customerId: 'customer-2',
        customerName: '另一个客户公司',
        currency: 'USD',
        subtotal: 500.00,
        taxAmount: 65.00,
        totalAmount: 565.00,
        balanceAmount: 0.00,
        issueDate: new Date('2024-01-10'),
        dueDate: new Date('2024-02-10'),
        description: '国际运输费',
        terms: '30天付款',
        createdBy: 'system',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    // 应用筛选条件
    let filteredInvoices = mockInvoices;
    
    if (status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (customerId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.customerId === customerId);
    }
    
    if (type) {
      filteredInvoices = filteredInvoices.filter(inv => inv.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower) ||
        (inv.description && inv.description.toLowerCase().includes(searchLower))
      );
    }

    // 分页
    const total = filteredInvoices.length;
    const skip = (page - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        invoices: paginatedInvoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取发票列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取发票列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/finance/invoices - 创建发票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      type = 'COMMERCIAL',
      currency = 'CNY',
      items,
      description,
      terms,
      dueDate
    } = body;

    // 验证客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: '客户不存在' },
        { status: 404 }
      );
    }

    // 生成发票号
    const invoiceNumber = `INV-${Date.now()}`;

    // 计算金额
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const amount = parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
        subtotal += amount;
      }
    }

    // 计算税额和总额
    const taxAmount = subtotal * 0.13; // 假设13%税率
    const totalAmount = subtotal + taxAmount;

    // 创建发票对象（实际应该保存到数据库）
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      type,
      customerId,
      customerName: customer.companyName || customer.name,
      currency,
      subtotal,
      taxAmount,
      totalAmount,
      balanceAmount: totalAmount,
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description,
      terms,
      status: 'DRAFT',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 这里应该将发票保存到数据库
    // const savedInvoice = await prisma.financeInvoice.create({ data: invoice });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: '发票创建成功（模拟数据）'
    }, { status: 201 });
  } catch (error) {
    console.error('创建发票失败:', error);
    return NextResponse.json(
      { success: false, error: '创建发票失败' },
      { status: 500 }
    );
  }
} 