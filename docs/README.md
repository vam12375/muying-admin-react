# 母婴商城管理后台文档

欢迎查阅母婴商城管理后台(muying-admin-react)的项目文档。本文档涵盖了项目架构、组件设计、开发指南和最佳实践等内容，旨在帮助开发人员更好地理解和维护此项目。

## 项目概述

muying-admin-react是母婴商城系统的管理后台，基于React和TypeScript构建，为商家和管理员提供全面的运营管理功能，包括商品管理、订单处理、用户管理、数据统计等核心功能。

## 技术栈

- **核心框架**：React 19.1.0
- **语言**：TypeScript 5.8.3
- **状态管理**：Redux Toolkit 2.8.2
- **UI组件库**：Ant Design 5.25.1
- **CSS框架**：TailwindCSS 3.4.17
- **构建工具**：Vite 6.3.5
- **HTTP客户端**：Axios 1.9.0
- **路由**：React Router 7.6.0
- **图表库**：Ant Design Charts / ECharts 5.6.0

## 文档目录

### 架构文档

- [项目架构概述](architecture/overview.md)
- [目录结构说明](architecture/directory-structure.md)
- [状态管理设计](architecture/state-management.md)
- [路由架构](architecture/routing.md)
- [API集成](architecture/api-integration.md)
- [类型系统](architecture/typescript.md)

### 组件文档

- [组件设计原则](components/design-principles.md)
- [布局组件](components/layout/README.md)
- [UI基础组件](components/ui/README.md)
- [业务组件](components/business/README.md)
- [表格和表单](components/data-entry/README.md)
- [图表组件](components/charts/README.md)

### 开发指南

- [开发环境搭建](development/setup.md)
- [开发工作流](development/workflow.md)
- [调试指南](development/debugging.md)
- [单元测试](development/testing.md)
- [性能优化](development/performance.md)
- [类型定义最佳实践](development/typescript-best-practices.md)

### 主题与样式

- [设计系统](styles/design-system.md)
- [主题定制](styles/theming.md)
- [TailwindCSS使用指南](styles/tailwind-guide.md)
- [响应式设计](styles/responsive-design.md)
- [动画实现](styles/animations.md)

### 功能模块

- [仪表盘](features/dashboard.md)
- [商品管理](features/products.md)
- [订单管理](features/orders.md)
- [用户管理](features/users.md)
- [营销管理](features/marketing.md)
- [统计分析](features/analytics.md)
- [系统设置](features/settings.md)

## 状态管理

- [Redux Toolkit架构](state/redux-toolkit.md)
- [状态模块设计](state/slice-design.md)
- [异步处理](state/async-operations.md)
- [状态持久化](state/persistence.md)

## 安全与权限

- [认证流程](security/authentication.md)
- [权限管理](security/authorization.md)
- [角色体系](security/roles.md)
- [安全最佳实践](security/best-practices.md)

## 贡献指南

我们欢迎并感谢任何形式的贡献。请查看[贡献指南](CONTRIBUTING.md)了解如何参与项目开发。

## 项目维护

- **版本控制**：Git
- **分支策略**：详见[开发工作流](development/workflow.md)
- **版本历史**：详见[版本日志](CHANGELOG.md)

## 常见问题

常见问题和解决方案请查看[FAQ](FAQ.md)文档。

## 相关资源

- [后端API文档](../../docs/API.md)
- [设计资源](resources/design-assets.md)
- [学习资源](resources/learning-resources.md)
- [React官方文档](https://react.dev/)
- [Redux Toolkit文档](https://redux-toolkit.js.org/)
- [Ant Design文档](https://ant.design/) 