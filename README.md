<div align="center">

```
 __  __          _ _           _ ____            
|  \/  | ___  __| (_) ___ __ _| | __ )  _____  __
| |\/| |/ _ \/ _` | |/ __/ _` | |  _ \ / _ \ \/ /
| |  | |  __/ (_| | | (_| (_| | | |_) | (_) >  < 
|_|  |_|\___|\__,_|_|\___\__,_|_|____/ \___/_/\_\
                                                  
        💊 智能家庭药箱管理系统 💊
```

<p align="center">
  <strong>让用药更安全，让健康更可控</strong><br>
  <em>Safe Medication, Health in Control</em>
</p>

<p align="center">
  现代化的家庭药箱管理解决方案，集药品管理、用药提醒、健康监测于一体，助您守护家人健康。
</p>

<p align="center">
  <a href="#✨-核心功能">功能特性</a> •
  <a href="#🚀-快速开始">快速开始</a> •
  <a href="#📝-使用说明">使用说明</a>
</p>

</div>

---

## ✨ 核心功能

### 📦 药品管理
- **药品信息录入**：详细记录药品名称、品牌、剂量规格、库存数量、有效期等信息
- **分类管理**：支持15种药品分类（解热镇痛药、抗过敏药、抗感染药、呼吸系统用药等）
- **管控分类标识**：标记处方药、非处方药、精神药品等管控类型，并用不同颜色区分
- **有效期提醒**：自动识别30天内即将过期的药品，用红色高亮提醒
- **存放位置**：记录药品存放位置，方便快速找到
- **搜索与筛选**：支持按药品名称搜索、按分类筛选
- **药品清单导出**：支持将药品清单导出为PDF文件，导出范围与筛选条件一致
- **药品标签导出**：批量导出药品标签用于打印贴在药盒上

### ⏰ 用药提醒
- **灵活的提醒设置**：支持单次、每日、每周、每月等多种提醒频率
- **今日提醒**：展示当天的用药提醒，避免遗漏
- **智能通知**：自动检测即将到期的提醒（30分钟内），发送浏览器通知
- **剂量信息**：在提醒中显示用药剂量，确保正确服用
- **一键完成**：点击"完成并记录"按钮可选择服用时间（当前时间/提醒时间/自定义时间），自动创建用药记录
- **通知管理**：可在设置中启用/禁用通知功能

### 📊 用药记录
- **详细的用药历史**：记录每次服药的剂量、时间、反应和备注
- **副作用记录**：专门记录用药后的副作用，用红色标记提醒
- **时间筛选**：支持按日期范围筛选记录
- **药品筛选**：可按特定药品查看用药历史
- **编辑与删除**：可随时编辑或删除历史记录
- **PDF导出**：支持将用药记录导出为PDF文件，导出范围与筛选条件一致

### 💓 健康监测
- **多种生命体征**：支持记录身高、体重、体温、血压、血氧、血糖、心率等7种生命体征
- **趋势分析图表**：通过可视化图表展示健康数据变化趋势
- **参考范围对比**：自动显示正常参考范围，并标注异常数值
- **异常提示**：自动判断数值是否在正常范围内，异常数据用红色标记
- **监测提醒**：可设置定期监测提醒（如每天测血压、每周测体重）
- **日期范围查询**：支持按时间段筛选健康数据
- **PDF导出（含图表）**：支持将健康监测记录导出为PDF文件，包含趋势图表和数据表格，导出范围与筛选条件一致

### 👤 用户系统
- **账户注册与登录**：支持邮箱密码注册/登录
- **Cloudflare Turnstile 验证码**：登录和注册页面集成人机验证，防止机器人攻击
- **GitHub 账户关联**：可关联 GitHub 账户进行第三方登录
- **Gravatar 头像**：自动从 Gravatar 获取邮箱对应的头像
- **个人信息管理**：显示账户创建时间、邮箱验证状态等
- **密码修改**：支持修改账户密码
- **账户删除**：提供账户删除功能

### 📱 PWA 支持
- **离线可用**：安装后可离线访问，无需网络连接即可查看已缓存的数据
- **桌面安装**：支持安装到手机主屏幕，像原生应用一样使用
- **自动更新**：应用有更新时自动提示，确保使用最新版本
- **快速加载**：通过 Service Worker 缓存资源，提升加载速度
- **移动优化**：完美适配各种移动设备和平板电脑
- **浏览器通知**：支持用药提醒通知推送到设备（需授予通知权限）

## 🛠 技术栈

### 前端技术
- **Nuxt 3.19.3**：基于 Vue 3 的全栈框架，提供 SSR 和 API 路由
- **Vue 3.5.22**：采用 Composition API，提供响应式用户界面
- **TypeScript**：类型安全的开发体验
- **Tailwind CSS**：实用优先的 CSS 框架
- **Material Design 3**：Google 最新设计语言，提供现代化 UI

### 后端技术
- **Nitro 2.12.7**：Nuxt 的服务器引擎
- **Prisma ORM 5.18.0**：类型安全的数据库访问
- **Better Auth 1.4.0**：现代化的身份验证库

### 第三方集成
- **Google Analytics**：网站分析（支持 Consent Mode v2）
- **Cloudflare Turnstile**：人机验证服务
- **GitHub OAuth**：第三方账户关联
- **Gravatar**：头像服务集成

## 🚀 快速开始

### 环境要求
- **Node.js** 18.x 或更高版本
- **NPM** 8.x 或更高版本
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/ClementineZou/MedicalBox.git
cd MedicalBox
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件（参考 `.env.example`）：
```env
# Better Auth 密钥（必需）
BETTER_AUTH_SECRET=your-secret-key-here

# Cloudflare Turnstile 验证码（推荐）
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google Analytics（可选）
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# 数据库 URL（开发环境使用 SQLite）
DATABASE_URL="file:./prisma/dev.db"
```

4. **初始化数据库**
```bash
# 应用数据库迁移
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate

# 填充示例数据
npx prisma db seed
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 📝 使用说明

### 首次使用
1. 访问注册页面创建账户
2. 登录后进入药品管理页面
3. 添加家中的药品信息
4. **导出药品标签**（可选）：
   - 点击"🏷️ 导出标签"按钮进入标签模式
   - 选择需要打印标签的药品（或点击"全选"）
   - 点击"🖨️ 打印标签"按钮
   - 在打印预览中选择打印或保存为PDF
   - 打印后剪裁标签，贴在相应的药盒上
5. 设置用药提醒
6. **启用通知权限**：在提醒页面或应用提示下授予浏览器通知权限
7. 记录每次用药情况
8. 定期记录健康数据

### Cookie 同意和隐私
- 应用会在首次访问时显示 Cookie 使用说明
- 用户可以选择接受或拒绝非必要的 Cookie
- 拒绝后，Google Analytics 等分析工具将不会收集数据
- 符合 GDPR 和其他隐私法规要求

### GitHub 关联
1. 进入个人中心
2. 点击"关联"GitHub 按钮
3. 授权后自动关联账户

### Gravatar 头像
系统自动根据邮箱从 Gravatar 获取头像，在 [Gravatar.com](https://gravatar.com) 注册邮箱即可显示自定义头像。

### 在手机上安装 PWA

**Android (Chrome)**
1. 在 Chrome 浏览器中打开应用
2. 点击右上角菜单（三个点）
3. 选择"安装应用"或"添加到主屏幕"
4. 点击"安装"

**iOS (Safari)**
1. 在 Safari 浏览器中打开应用
2. 点击分享按钮（箭头向上的图标）
3. 向下滚动，选择"添加到主屏幕"
4. 点击"添加"

安装后，应用图标会出现在手机主屏幕上，点击即可像原生应用一样使用。

### 离线使用
应用安装后会自动缓存重要资源，即使离线也可以：
- 查看已缓存的药品信息
- 查看用药记录
- 查看健康数据
- 使用基本功能（需要在线时同步数据）

## 👨‍💻 作者

**Clementine Zou**
- GitHub: [@ClementineZou](https://github.com/ClementineZou)

## 🙏 致谢

- [Nuxt.js](https://nuxt.com/)
- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Better Auth](https://www.better-auth.com/)
- [Material Design 3](https://m3.material.io/)