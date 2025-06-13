import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    firstName: '系统',
    lastName: '管理员',
    phone: '+86-138-0000-0001',
    avatar: null,
    status: 'ACTIVE',
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        role: {
          id: '1',
          name: '超级管理员'
        }
      }
    ]
  },
  {
    id: '2',
    username: 'finance_manager',
    email: 'finance@company.com',
    firstName: '财务',
    lastName: '经理',
    phone: '+86-138-0000-0002',
    avatar: null,
    status: 'ACTIVE',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    roles: [
      {
        role: {
          id: '2',
          name: '财务经理'
        }
      }
    ]
  },
  {
    id: '3',
    username: 'warehouse_staff',
    email: 'warehouse@company.com',
    firstName: '仓库',
    lastName: '管理员',
    phone: '+86-138-0000-0003',
    avatar: null,
    status: 'ACTIVE',
    lastLoginAt: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    roles: [
      {
        role: {
          id: '3',
          name: '仓库管理员'
        }
      }
    ]
  },
  {
    id: '4',
    username: 'sales_rep',
    email: 'sales@company.com',
    firstName: '销售',
    lastName: '代表',
    phone: '+86-138-0000-0004',
    avatar: null,
    status: 'DISABLED',
    lastLoginAt: '2024-01-10T09:15:00Z',
    createdAt: '2024-01-04T00:00:00Z',
    roles: [
      {
        role: {
          id: '4',
          name: '销售代表'
        }
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const roleId = searchParams.get('roleId') || '';

    // 过滤用户
    let filteredUsers = mockUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (roleId) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.some(userRole => userRole.role.id === roleId)
      );
    }

    // 分页
    const total = filteredUsers.length;
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      roleIds = []
    } = body;

    // 验证必填字段
    if (!username || !email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: '用户名、邮箱、姓名为必填字段' },
        { status: 400 }
      );
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = mockUsers.find(user =>
      user.username === username || user.email === email
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '用户名或邮箱已存在' },
        { status: 400 }
      );
    }

    // 创建新用户
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      firstName,
      lastName,
      phone: phone || '',
      avatar: null,
      status: 'ACTIVE' as const,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      roles: roleIds.map((roleId: string) => ({
        role: {
          id: roleId,
          name: `角色${roleId}` // 在实际项目中应该从数据库获取角色名称
        }
      }))
    };

    mockUsers.push(newUser);

    // 模拟数据库保存延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: newUser,
      message: '用户创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { success: false, error: '创建用户失败' },
      { status: 500 }
    );
  }
} 