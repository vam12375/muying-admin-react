# 母婴商城后台管理系统 (React + TypeScript)

这是一个使用React和TypeScript构建的母婴商城后台管理系统，采用了现代化的前端技术栈。

## 技术栈

- **React 18**: 用于构建用户界面的JavaScript库
- **TypeScript**: 添加静态类型检查的JavaScript超集
- **Vite**: 现代前端构建工具，提供更快的开发体验
- **React Router**: 用于处理应用程序的路由
- **Redux Toolkit**: 状态管理库，简化Redux的使用
- **Ant Design**: 企业级UI组件库
- **Axios**: 基于Promise的HTTP客户端

## 项目结构

```
src/
  ├── assets/        # 静态资源文件
  ├── components/    # 可复用组件
  ├── layout/        # 布局组件
  ├── router/        # 路由配置
  ├── store/         # Redux状态管理
  ├── utils/         # 工具函数
  ├── views/         # 页面组件
  ├── App.tsx        # 应用入口组件
  └── main.tsx       # 应用入口文件
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 从Vue迁移到React的说明

本项目是从Vue 3 + Vite技术栈迁移到React + TypeScript技术栈的。以下是主要的迁移对应关系：

| Vue 生态系统 | React 生态系统 |
|------------|--------------|
| Vue 3      | React 18     |
| Vue Router | React Router |
| Pinia      | Redux Toolkit |
| Element Plus | Ant Design  |
| .vue 单文件组件 | .tsx 组件文件 |

### 主要变化

1. **组件结构**: 从Vue的单文件组件(.vue)迁移到React的函数组件(.tsx)
2. **状态管理**: 从Pinia迁移到Redux Toolkit
3. **UI组件库**: 从Element Plus迁移到Ant Design
4. **类型系统**: 全面集成TypeScript，增强代码健壮性
5. **路由系统**: 从Vue Router迁移到React Router

### 功能模块

- 用户管理
- 商品管理
- 订单管理
- 物流管理
- 优惠券管理
- 积分管理
- 消息管理
- 评论管理
- 系统设置

## 许可证

[MIT](LICENSE)

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
