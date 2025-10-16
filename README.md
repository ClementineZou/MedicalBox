# MedicalBox 家庭药箱管理系统

MedicalBox是一个现代化的家庭药箱管理系统，帮助用户管理家庭药品、用药记录、提醒服药和监测生命体征。

## 主要功能

- **药品管理**：记录药品信息，包括名称、剂量、用法、有效期等
- **用药提醒**：设置用药时间提醒，支持单次、每日、每周、每月等频率
- **用药记录**：记录每次用药情况，包括剂量、时间和反应
- **生命体征监测**：记录和跟踪体温、血压、血糖等生命体征数据
- **数据导出**：支持导出用药记录和体征数据

## 技术栈

- **前端**：Nuxt.js 3, Vue 3, TypeScript, Tailwind CSS, Material Design 3
- **后端**：Node.js with Prisma ORM
- **数据库**：SQLite (开发环境), PostgreSQL/MySQL (生产环境)

## 项目设置

### 安装依赖

```bash
# 安装依赖
npm install

# 初始化Prisma
npx prisma db push

# 生成Prisma客户端
npx prisma generate
```

### 开发环境

```bash
# 启动开发服务器
npm run dev
```

### 生产环境

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 系统需求

- Node.js 18.x 或更高
- NPM 8.x 或更高
- 支持现代浏览器 (Chrome, Firefox, Safari, Edge)

## 项目结构

```
├── assets/            # 静态资源文件
├── components/        # Vue组件
├── composables/       # 可组合函数
├── layouts/           # 页面布局
├── pages/             # 应用页面
├── plugins/           # Nuxt插件
├── prisma/            # Prisma数据库schema和迁移
├── server/            # 服务器API端点
│   └── api/           # API路由
└── utils/             # 工具函数
```

## 数据模型

系统主要包含以下数据模型：

- **Medicine**: 药品信息
- **Reminder**: 用药提醒
- **MedicineUsageRecord**: 用药记录
- **VitalSign**: 生命体征记录
- **VitalSignReminder**: 生命体征测量提醒
- **VitalSignReferenceRange**: 生命体征参考范围

## 许可证

MIT