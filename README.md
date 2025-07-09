# 母婴商城管理后台 (Muying Admin React)

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.25.1-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

一个现代化的母婴商城管理后台系统，基于 React 18+ 和 TypeScript 构建

</div>

## ✨ 特性

- 🚀 **现代技术栈**: React 19 + TypeScript + Vite
- 🎨 **优雅UI**: 基于 Ant Design 5.x 设计系统
- 📱 **响应式设计**: 支持桌面端和移动端
- 🔐 **权限管理**: 完整的用户认证和权限控制
- 📊 **数据可视化**: 丰富的图表和统计分析
- 🌙 **主题切换**: 支持明暗主题切换
- 🔄 **状态管理**: Redux Toolkit 状态管理
- 🎯 **TypeScript**: 完整的类型安全支持

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 克隆项目
git clone <https://github.com/vam12375/muying-admin-react.git>
cd muying-admin-react

# 安装依赖
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 📋 主要功能

### 🏠 仪表盘
- 实时数据概览
- 销售统计图表
- 关键指标监控

### 👥 用户管理
- 用户列表和详情
- 用户交易记录
- 权限角色管理

### 🛍️ 商品管理
- 商品列表和编辑
- 分类品牌管理
- 商品数据分析

### 📦 订单管理
- 订单列表和详情
- 订单状态跟踪
- 物流信息管理

### 🎫 营销管理
- 优惠券管理
- 积分系统
- 促销活动

### 📊 数据分析
- 多维度数据分析
- 自定义报表
- 数据导出功能

### ⚙️ 系统管理
- 系统配置
- 操作日志
- Redis 监控

## 🛠️ 技术栈

- **前端框架**: React 19.1.0
- **开发语言**: TypeScript 5.8.3
- **构建工具**: Vite 6.3.5
- **UI 组件库**: Ant Design 5.25.1
- **状态管理**: Redux Toolkit 2.8.2
- **路由管理**: React Router DOM 7.6.0
- **HTTP 客户端**: Axios 1.9.0
- **样式方案**: Tailwind CSS 3.4.17
- **图表库**: ECharts 5.6.0 + Recharts 2.15.3
- **动画库**: Framer Motion 12.12.1
- **代码规范**: ESLint + TypeScript ESLint

## 📁 项目结构

```
muying-admin-react/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── assets/            # 静态资源
│   ├── components/        # 通用组件
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # Redux 状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── main.tsx           # 应用入口
├── docs/                  # 项目文档
└── package.json
```

## 📚 文档

详细文档请查看 [docs](./docs/) 目录：

- [项目架构](./docs/architecture.md) - 技术架构和设计理念
- [开发指南](./docs/development.md) - 开发环境和编码规范
- [功能模块](./docs/features/) - 各功能模块详细说明
- [API 文档](./docs/api.md) - 接口文档和使用说明
- [部署指南](./docs/deployment.md) - 部署配置和运维指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

<div align="center">
  Made with ❤️ by Muying Team
</div>