import { NextRequest, NextResponse } from 'next/server';

// 模拟角色数据
const mockRoles = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有权限的超级管理员',
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '1',
          module: '*',
          action: '*',
          resource: '*',
          description: '所有权限'
        }
      }
    ]
  },
  {
    id: '2',
    name: '财务经理',
    description: '负责财务管理相关功能',
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '2',
          module: 'finance',
          action: '*',
          resource: '*',
          description: '财务模块所有权限'
        }
      },
      {
        permission: {
          id: '3',
          module: 'reports',
          action: 'read',
          resource: 'financial',
          description: '财务报表查看权限'
        }
      }
    ]
  },
  {
    id: '3',
    name: '仓库管理员',
    description: '负责仓库管理相关功能',
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '4',
          module: 'warehouse',
          action: '*',
          resource: '*',
          description: '仓库模块所有权限'
        }
      },
      {
        permission: {
          id: '5',
          module: 'inventory',
          action: 'read',
          resource: '*',
          description: '库存查看权限'
        }
      }
    ]
  },
  {
    id: '4',
    name: '销售代表',
    description: '负责销售相关功能',
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '6',
          module: 'customers',
          action: 'read',
          resource: '*',
          description: '客户查看权限'
        }
      },
      {
        permission: {
          id: '7',
          module: 'orders',
          action: 'create',
          resource: '*',
          description: '订单创建权限'
        }
      }
    ]
  },
  {
    id: '5',
    name: '客服专员',
    description: '负责客户服务相关功能',
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: [
      {
        permission: {
          id: '8',
          module: 'customers',
          action: 'read',
          resource: '*',
          description: '客户查看权限'
        }
      },
      {
        permission: {
          id: '9',
          module: 'support',
          action: '*',
          resource: '*',
          description: '客服模块所有权限'
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
    const includeSystem = searchParams.get('includeSystem') === 'true';

    // 过滤角色
    let filteredRoles = mockRoles;

    if (search) {
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (!includeSystem) {
      filteredRoles = filteredRoles.filter(role => !role.isSystem);
    }

    // 分页
    const total = filteredRoles.length;
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedRoles = filteredRoles.slice(skip, skip + limit);

    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: paginatedRoles,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取角色列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      permissionIds = []
    } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { success: false, error: '角色名称不能为空' },
        { status: 400 }
      );
    }

    // 检查角色名称是否已存在
    const existingRole = mockRoles.find(role => role.name === name);
    if (existingRole) {
      return NextResponse.json(
        { success: false, error: '角色名称已存在' },
        { status: 400 }
      );
    }

    // 创建新角色
    const newRole = {
      id: (mockRoles.length + 1).toString(),
      name,
      description: description || '',
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: permissionIds.map((permissionId: string) => ({
        permission: {
          id: permissionId,
          module: 'custom',
          action: 'read',
          resource: '*',
          description: `权限${permissionId}` // 在实际项目中应该从数据库获取权限详情
        }
      }))
    };

    mockRoles.push(newRole);

    // 模拟数据库保存延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: newRole,
      message: '角色创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json(
      { success: false, error: '创建角色失败' },
      { status: 500 }
    );
  }
} 