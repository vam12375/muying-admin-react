# 技术栈详解

## 🚀 核心技术栈

### 前端框架
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **React** | 19.1.0 | 前端框架 | 组件化开发、生态丰富、性能优秀 |
| **TypeScript** | 5.8.3 | 类型系统 | 类型安全、开发体验好、代码质量高 |
| **Vite** | 6.3.5 | 构建工具 | 快速热更新、现代化构建、插件丰富 |

### UI 组件库
| 技术 | 版本 | 用途 | 特点 |
|------|------|------|------|
| **Ant Design** | 5.25.1 | UI 组件库 | 企业级设计、组件丰富、文档完善 |
| **@ant-design/icons** | 6.0.0 | 图标库 | 图标丰富、风格统一 |
| **@ant-design/charts** | 2.3.0 | 图表组件 | 基于 G2Plot、开箱即用 |
| **Lucide React** | 0.511.0 | 图标库 | 现代化图标、可定制性强 |
| **@heroicons/react** | 2.1.3 | 图标库 | 精美图标、多种风格 |

### 状态管理
| 技术 | 版本 | 用途 | 优势 |
|------|------|------|------|
| **Redux Toolkit** | 2.8.2 | 状态管理 | 简化 Redux 使用、内置最佳实践 |
| **React Redux** | 9.2.0 | React 绑定 | 官方推荐、性能优化 |

### 路由管理
| 技术 | 版本 | 用途 | 特性 |
|------|------|------|------|
| **React Router DOM** | 7.6.0 | 路由管理 | 声明式路由、代码分割支持 |

### 网络请求
| 技术 | 版本 | 用途 | 特点 |
|------|------|------|------|
| **Axios** | 1.9.0 | HTTP 客户端 | 拦截器支持、请求/响应转换 |

### 样式方案
| 技术 | 版本 | 用途 | 优势 |
|------|------|------|------|
| **Tailwind CSS** | 3.4.17 | 原子化 CSS | 快速开发、一致性好、体积小 |
| **PostCSS** | 8.5.3 | CSS 处理器 | 插件生态、现代化 CSS |
| **Autoprefixer** | 10.4.21 | CSS 前缀 | 自动添加浏览器前缀 |

### 数据可视化
| 技术 | 版本 | 用途 | 特色 |
|------|------|------|------|
| **ECharts** | 5.6.0 | 图表库 | 功能强大、可定制性强 |
| **Recharts** | 2.15.3 | React 图表 | React 友好、组件化 |

### 动画库
| 技术 | 版本 | 用途 | 特点 |
|------|------|------|------|
| **Framer Motion** | 12.12.1 | 动画库 | 声明式动画、性能优秀 |

### 工具库
| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Day.js** | 1.11.13 | 日期处理 | 轻量级、API 友好 |
| **Moment.js** | 2.30.1 | 日期处理 | 功能完整、生态成熟 |
| **clsx** | 2.1.1 | 类名处理 | 条件类名、性能好 |
| **tailwind-merge** | 3.3.0 | Tailwind 合并 | 智能合并 Tailwind 类名 |

## 🛠️ 开发工具

### 代码质量
| 工具 | 版本 | 用途 | 配置 |
|------|------|------|------|
| **ESLint** | 9.25.0 | 代码检查 | 基于 @eslint/js 配置 |
| **TypeScript ESLint** | 8.30.1 | TS 代码检查 | 严格类型检查 |
| **eslint-plugin-react-hooks** | 5.2.0 | React Hooks 检查 | Hooks 规则检查 |
| **eslint-plugin-react-refresh** | 0.4.19 | React 刷新检查 | 热更新兼容性 |

### 构建配置
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['@ant-design/charts']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
})
```

## 📦 依赖分析

### 生产依赖 (dependencies)
```json
{
  "@ant-design/charts": "^2.3.0",      // 图表组件
  "@ant-design/icons": "^6.0.0",       // 图标库
  "@heroicons/react": "^2.1.3",        // 图标库
  "@reduxjs/toolkit": "^2.8.2",        // 状态管理
  "antd": "^5.25.1",                    // UI 组件库
  "axios": "^1.9.0",                    // HTTP 客户端
  "clsx": "^2.1.1",                     // 类名工具
  "dayjs": "^1.11.13",                  // 日期库
  "echarts": "^5.6.0",                  // 图表库
  "framer-motion": "^12.12.1",          // 动画库
  "lucide-react": "^0.511.0",           // 图标库
  "moment": "^2.30.1",                  // 日期库
  "react": "^19.1.0",                   // React 框架
  "react-dom": "^19.1.0",               // React DOM
  "react-redux": "^9.2.0",              // Redux 绑定
  "react-router-dom": "^7.6.0",         // 路由管理
  "recharts": "^2.15.3",                // React 图表
  "tailwind-merge": "^3.3.0"            // Tailwind 工具
}
```

### 开发依赖 (devDependencies)
```json
{
  "@eslint/js": "^9.25.0",              // ESLint 配置
  "@types/react": "^19.1.2",            // React 类型
  "@types/react-dom": "^19.1.2",        // React DOM 类型
  "@vitejs/plugin-react-swc": "^3.9.0", // Vite React 插件
  "autoprefixer": "^10.4.21",           // CSS 前缀
  "eslint": "^9.25.0",                  // 代码检查
  "eslint-plugin-react-hooks": "^5.2.0", // React Hooks 检查
  "eslint-plugin-react-refresh": "^0.4.19", // React 刷新检查
  "globals": "^16.0.0",                 // 全局变量
  "postcss": "^8.5.3",                  // CSS 处理器
  "tailwindcss": "^3.4.17",             // 原子化 CSS
  "typescript": "~5.8.3",               // TypeScript
  "typescript-eslint": "^8.30.1",       // TS ESLint
  "vite": "^6.3.5"                      // 构建工具
}
```

## 🎯 技术选型理由

### React 19
- **并发特性**: 支持并发渲染，提升用户体验
- **自动批处理**: 自动批处理状态更新，减少重渲染
- **Suspense**: 更好的异步组件支持
- **生态成熟**: 丰富的第三方库和工具

### TypeScript 5.8
- **类型安全**: 编译时类型检查，减少运行时错误
- **开发体验**: 智能提示、重构支持
- **代码质量**: 强制类型约束，提高代码质量
- **团队协作**: 接口定义清晰，便于团队协作

### Ant Design 5
- **企业级**: 专为企业级产品设计
- **组件丰富**: 60+ 高质量组件
- **主题定制**: 强大的主题定制能力
- **国际化**: 完善的国际化支持

### Redux Toolkit
- **简化开发**: 减少样板代码
- **最佳实践**: 内置 Redux 最佳实践
- **开发工具**: 优秀的开发者工具支持
- **性能优化**: 内置性能优化

### Vite
- **快速启动**: 基于 ESM 的快速冷启动
- **热更新**: 快速的热模块替换
- **现代化**: 支持最新的前端技术
- **插件生态**: 丰富的插件生态

## 🔄 版本升级策略

### 主要依赖升级
- **React**: 保持最新稳定版本
- **Ant Design**: 跟随官方 LTS 版本
- **TypeScript**: 保持最新稳定版本
- **Vite**: 定期升级到最新版本

### 升级原则
1. **安全优先**: 及时修复安全漏洞
2. **稳定性**: 优先选择稳定版本
3. **兼容性**: 确保向后兼容
4. **测试验证**: 充分测试后再升级

---

*本文档详细说明了项目使用的技术栈，为技术选型和升级提供参考。*
