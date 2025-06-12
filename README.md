# MyApp

**国际物流管理系统（FBA 运单 + 渠道管理 + 财务 + 模板中心）**

## 功能概览

* FBA 运单：创建、编辑、分页查询、状态统计
* 渠道管理：新增/编辑渠道、附加费规则、标签模板绑定
* 财务模块：账单、收付款、对账、结算、返点、滞纳金
* 模板中心：Excel 导入字段匹配、标签 PDF 渲染

## 技术栈

* **前端**：Next.js (App Router) + React + Tailwind CSS
* **后端**：Node.js + Express + Prisma + PostgreSQL
* **脚手架**：Plop.js、GPT-CLI
* **验证**：Zod + OpenAPI
* **测试**：Jest + Testing Library
* **代码质量**：ESLint + Prettier + Husky + lint-staged + Commitizen
* **CI/CD**：GitHub Actions

## 快速开始

1. 克隆仓库

   ```bash
   git clone git@github.com:knight225013/myapp.git
   cd myapp
   ```
2. 安装依赖

   ```bash
   npm ci
   ```
3. 配置环境变量

   * 复制 `.env.example` 为 `.env.local`，并填写：

     ```env
     DATABASE_URL=postgresql://user:pass@localhost:5432/fba_db
     NEXT_PUBLIC_API_URL=http://localhost:3000/api
     ```
4. 本地启动

   ```bash
   npm run dev
   ```
5. 运行测试

   ```bash
   npm test
   ```

## 脚本一览

| 命令                        | 说明              |
| ------------------------- | --------------- |
| `npm run dev`             | 启动开发模式（Next.js） |
| `npm run build`           | 构建生产包           |
| `npm start`               | 启动生产环境          |
| `npm test`                | 运行单元测试          |
| `npm run lint`            | ESLint 检查       |
| `npm run format`          | Prettier 格式化    |
| `npm run migrate:imports` | 执行 import 更新脚本  |

## 项目结构

```
├── app/               # Next.js App Router
├── api/               # 独立 Express 路由（可移除）
├── components/        # 业务组件按域划分
├── prisma/            # 数据模型和迁移
├── scripts/           # 迁移 & 转换脚本
├── plop-templates/    # Plop.js 生成模板
├── public/            # 静态资源
├── utils/             # 通用工具函数
├── .github/           # CI/CD 配置
├── .gitignore
├── jest.config.js
├── codegen.yml        # OpenAPI / TypeGen 配置
└── tsconfig.json
```

## 环境变量示例

请参考 `.env.example`，包括但不限于：

```
DATABASE_URL=
NEXT_PUBLIC_API_URL=
```

## 贡献指南

1. Fork 本仓库
2. 新建分支 `feat/xxx` 或 `fix/xxx`
3. 提交前请运行 `npm run lint && npm test && npm run format`
4. 提交 Commit 时使用 `npm run commit`，遵循 Conventional Commits
5. 提交 PR 至 `main` 分支，确保 CI 通过并至少 1 位 Reviewer 通过

## 许可证

MIT © knight225013
