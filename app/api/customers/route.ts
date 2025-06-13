import { NextRequest, NextResponse } from 'next/server';

// 模拟客户数据
const mockCustomers = [
  {
    id: '1',
    name: '张三',
    companyName: '上海贸易公司',
    email: 'zhang@example.com',
    phone: '13800138001',
    address: '上海市浦东新区陆家嘴金融中心',
    contactPerson: '张三',
    taxNumber: '91310000123456789X',
    creditLimit: 100000,
    paymentTerms: '30天',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: '李四',
    companyName: '深圳物流有限公司',
    email: 'li@example.com',
    phone: '13800138002',
    address: '深圳市南山区科技园',
    contactPerson: '李四',
    taxNumber: '91440300123456789Y',
    creditLimit: 80000,
    paymentTerms: '15天',
    status: 'ACTIVE'
  },
  {
    id: '3',
    name: '王五',
    companyName: '北京进出口公司',
    email: 'wang@example.com',
    phone: '13800138003',
    address: '北京市朝阳区CBD商务区',
    contactPerson: '王五',
    taxNumber: '91110000123456789Z',
    creditLimit: 150000,
    paymentTerms: '45天',
    status: 'ACTIVE'
  },
  {
    id: '4',
    name: '赵六',
    companyName: '广州货运代理',
    email: 'zhao@example.com',
    phone: '13800138004',
    address: '广州市天河区珠江新城',
    contactPerson: '赵六',
    taxNumber: '91440100123456789A',
    creditLimit: 60000,
    paymentTerms: '30天',
    status: 'ACTIVE'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let filteredCustomers = mockCustomers;

    if (search) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.companyName.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredCustomers = filteredCustomers.filter(customer => customer.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredCustomers,
      total: filteredCustomers.length
    });
  } catch (error) {
    console.error('获取客户列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取客户列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.companyName || !body.email) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 创建新客户
    const newCustomer = {
      id: Date.now().toString(),
      ...body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // 这里应该保存到数据库
    mockCustomers.push(newCustomer);

    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: '客户创建成功'
    });
  } catch (error) {
    console.error('创建客户失败:', error);
    return NextResponse.json(
      { success: false, error: '创建客户失败' },
      { status: 500 }
    );
  }
} 