# 国际货运代理财务系统 - 系统设置模块实现文档

## 概述

本文档详细描述了国际货运代理财务系统的系统设置模块实现，包括数据库设计、API接口、前端页面和关键业务逻辑。

## 目录结构

```
app/
├── settings/                    # 系统设置页面
│   ├── page.tsx                # 设置主页面
│   ├── company/                # 公司资料设置
│   │   └── page.tsx
│   ├── users/                  # 用户管理
│   │   ├── page.tsx
│   │   ├── new/
│   │   └── [id]/
│   ├── warehouses/             # 仓库管理
│   │   ├── page.tsx
│   │   ├── new/
│   │   └── [id]/
│   ├── branding/               # 品牌设置
│   ├── security/               # 安全设置
│   ├── numbering/              # 编号规则
│   ├── custom-fields/          # 自定义字段
│   └── audit/                  # 审计日志
├── api/
│   └── settings/               # 设置相关API
│       ├── overview/
│       ├── company/
│       ├── users/
│       ├── roles/
│       └── warehouses/
prisma/
├── schema-settings.prisma      # 设置相关数据模型
utils/
├── settingsCalculations.js     # 业务逻辑工具
api/
├── routes/
│   └── settings.js            # Express路由
└── controllers/
    └── settings/              # 控制器
```

## 数据库设计

### 核心实体关系

```mermaid
erDiagram
    CompanyProfile ||--o{ BrandingSettings : has
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : belongs_to
    Role ||--o{ RolePermission : has
    Permission ||--o{ RolePermission : belongs_to
    Warehouse ||--o{ WarehouseLocation : contains
    Warehouse ||--|| WarehouseSettings : has
    CustomField ||--o{ CustomFieldValue : has_values
    User ||--o{ AuditLog : creates
    ApprovalWorkflow ||--o{ ApprovalStep : contains
    ApprovalWorkflow ||--o{ ApprovalRecord : processes
```

### 主要数据模型

#### 1. 公司资料 (CompanyProfile)
- 存储公司基本信息、logo、联系方式
- 支持logo文件上传和管理

#### 2. 用户权限系统
- **User**: 用户基本信息
- **Role**: 角色定义
- **Permission**: 权限定义 (module:action:resource)
- **UserRole**: 用户角色关联
- **RolePermission**: 角色权限关联

#### 3. 审批工作流
- **ApprovalWorkflow**: 工作流定义
- **ApprovalStep**: 审批步骤
- **ApprovalRecord**: 审批记录
- **ApprovalAction**: 审批操作

#### 4. 仓库管理
- **Warehouse**: 仓库基本信息
- **WarehouseLocation**: 库位信息
- **WarehouseSettings**: 仓库策略配置

#### 5. 自定义字段
- **CustomField**: 字段定义
- **CustomFieldValue**: 字段值存储

## API接口设计

### RESTful API 规范

```javascript
// 基础响应格式
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

### 主要接口

#### 1. 系统概览
```
GET /api/settings/overview
```

#### 2. 公司资料管理
```
GET /api/settings/company/profile
POST /api/settings/company/profile (支持文件上传)
POST /api/settings/company/logo/upload
DELETE /api/settings/company/logo
```

#### 3. 用户管理
```
GET /api/settings/users
POST /api/settings/users
PUT /api/settings/users/:id
DELETE /api/settings/users/:id
POST /api/settings/users/:id/reset-password
POST /api/settings/users/batch
```

#### 4. 角色权限管理
```
GET /api/settings/roles
POST /api/settings/roles
PUT /api/settings/roles/:id
DELETE /api/settings/roles/:id
GET /api/settings/permissions
```

#### 5. 仓库管理
```
GET /api/settings/warehouses
POST /api/settings/warehouses
PUT /api/settings/warehouses/:id
DELETE /api/settings/warehouses/:id
GET /api/settings/warehouses/:id/locations
POST /api/settings/warehouses/:id/locations
```

## 前端页面实现

### 页面结构

#### 1. 设置主页面 (`/settings`)
- 系统概览统计
- 模块分类展示 (基础设置、高级设置、安全设置)
- 配置状态指示器
- 快速操作入口

#### 2. 公司资料页面 (`/settings/company`)
- Logo上传和预览
- 公司基本信息表单
- 联系方式管理
- 实时保存功能

#### 3. 用户管理页面 (`/settings/users`)
- 用户列表展示
- 搜索和过滤功能
- 批量操作支持
- 用户状态管理
- 密码重置功能

#### 4. 仓库管理页面 (`/settings/warehouses`)
- 仓库卡片式展示
- 使用率可视化
- 状态管理
- 库位统计

### UI组件设计

#### 通用组件
- `Card`: 卡片容器
- `Button`: 按钮组件
- `Input`: 输入框组件
- `Badge`: 状态标签
- `Modal`: 模态框
- `Table`: 数据表格

#### 特殊组件
- `StatusIndicator`: 状态指示器
- `ProgressBar`: 进度条
- `FileUpload`: 文件上传
- `PermissionMatrix`: 权限矩阵

## 关键业务逻辑

### 1. 编号生成器 (NumberGenerator)

```javascript
// 生成下一个编号
const result = NumberGenerator.generateNext({
  prefix: 'INV',
  length: 10,
  currentNumber: 1234,
  hasCheckDigit: true,
  resetPeriod: 'yearly'
});
// 返回: { number: 'INV0001235', nextCurrentNumber: 1235 }
```

**功能特性:**
- 支持前缀配置
- 自动补零
- 校验位计算 (模10算法)
- 周期性重置 (年/月/日)
- 编号验证

### 2. 权限计算器 (PermissionCalculator)

```javascript
// 计算用户有效权限
const permissions = PermissionCalculator.calculateUserPermissions(userRoles);

// 检查权限
const hasAccess = PermissionCalculator.hasPermission(
  permissions, 
  'finance', 
  'create', 
  'invoice'
);
```

**权限模型:**
- 模块级权限: `finance:*:*`
- 操作级权限: `finance:create:*`
- 资源级权限: `finance:create:invoice`
- 超级权限: `*:*:*`

### 3. 审批流程计算器 (ApprovalCalculator)

```javascript
// 计算下一审批步骤
const nextStep = ApprovalCalculator.getNextStep(workflow, currentStep, 'APPROVED');

// 计算审批进度
const progress = ApprovalCalculator.calculateProgress(workflow, actions);
// 返回: { total: 3, completed: 2, percentage: 67, isComplete: false }
```

### 4. 仓库策略计算器 (WarehouseStrategyCalculator)

```javascript
// FIFO策略选择库位
const location = WarehouseStrategyCalculator.selectLocationFIFO(locations, inventory);

// 安全库存预警
const alerts = WarehouseStrategyCalculator.calculateSafetyStockAlerts(warehouse, inventory);

// 补货建议
const suggestions = WarehouseStrategyCalculator.calculateReplenishmentSuggestions(
  warehouse, 
  inventory, 
  salesHistory
);
```

### 5. 自定义字段验证器 (CustomFieldValidator)

```javascript
// 验证字段值
const result = CustomFieldValidator.validateValue(field, value);
// 返回: { isValid: true, errors: [] }
```

**支持的字段类型:**
- TEXT: 文本字段
- NUMBER: 数字字段
- BOOLEAN: 布尔字段
- DATE/DATETIME: 日期字段
- ENUM: 枚举字段
- JSON: JSON字段

**验证规则:**
- 必填验证
- 类型验证
- 长度限制
- 数值范围
- 正则表达式
- 自定义规则

## 安全考虑

### 1. 权限控制
- 基于角色的访问控制 (RBAC)
- 细粒度权限管理
- 权限继承和覆盖
- 动态权限检查

### 2. 数据验证
- 输入数据验证
- SQL注入防护
- XSS攻击防护
- 文件上传安全

### 3. 审计日志
- 操作记录追踪
- 敏感操作监控
- 数据变更记录
- 登录日志管理

### 4. 密码安全
- 密码强度策略
- 密码加密存储
- 密码重置机制
- 登录失败锁定

## 性能优化

### 1. 数据库优化
- 索引优化
- 查询优化
- 分页查询
- 连接池管理

### 2. 缓存策略
- 权限缓存
- 配置缓存
- 查询结果缓存
- 静态资源缓存

### 3. 前端优化
- 组件懒加载
- 虚拟滚动
- 防抖搜索
- 图片压缩

## 部署配置

### 环境变量
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/freight_db

# 文件存储
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5242880

# 安全配置
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12

# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASS=password
```

### Docker配置
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 测试策略

### 1. 单元测试
- 业务逻辑测试
- 工具函数测试
- 验证器测试

### 2. 集成测试
- API接口测试
- 数据库操作测试
- 权限验证测试

### 3. 端到端测试
- 用户流程测试
- 页面交互测试
- 文件上传测试

## 维护指南

### 1. 数据备份
- 定期数据库备份
- 配置文件备份
- 上传文件备份

### 2. 监控告警
- 系统性能监控
- 错误日志监控
- 安全事件监控

### 3. 版本升级
- 数据库迁移脚本
- 配置兼容性检查
- 功能回归测试

## 扩展计划

### 1. 功能扩展
- 多租户支持
- 国际化支持
- 移动端适配
- API版本管理

### 2. 集成扩展
- 第三方认证集成
- 消息队列集成
- 监控系统集成
- 日志分析集成

### 3. 性能扩展
- 读写分离
- 分库分表
- 缓存集群
- CDN加速

---

**文档版本**: v1.0  
**最后更新**: 2024年1月  
**维护人员**: 系统架构团队 