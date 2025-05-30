# 母婴商城管理后台目录结构

本文档详细介绍母婴商城管理后台(muying-admin-react)项目的目录结构和文件组织方式，帮助开发者快速了解项目架构并定位相关代码。

## 根目录结构

```
muying-admin-react/
├── docs/                 # 项目文档
├── public/               # 静态资源目录
├── src/                  # 源代码目录
├── .env                  # 环境变量（基础）
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── .eslintrc.js          # ESLint配置
├── .prettierrc           # Prettier配置
├── index.html            # HTML模板
├── package.json          # 项目依赖和脚本
├── README.md             # 项目说明
├── tailwind.config.js    # Tailwind CSS配置
├── tsconfig.json         # TypeScript配置
└── vite.config.ts        # Vite构建工具配置
```

## 源代码目录结构 (src/)

```
src/
├── api/                  # API请求封装
├── assets/               # 静态资源
├── components/           # 组件库
├── config/               # 全局配置
├── hooks/                # 自定义Hooks
├── layouts/              # 布局组件
├── pages/                # 页面组件
├── router/               # 路由配置
├── services/             # 服务层
├── store/                # Redux状态管理
├── styles/               # 全局样式
├── types/                # TypeScript类型定义
├── utils/                # 工具函数
├── App.tsx               # 应用根组件
├── main.tsx              # 应用入口
└── vite-env.d.ts         # Vite类型声明
```

## 目录说明

### api/

API目录包含所有与后端API通信相关的代码。按照业务模块组织：

```
api/
├── index.ts              # API统一导出
├── apiClient.ts          # Axios实例和拦截器配置
├── auth/                 # 认证相关API
├── products/             # 商品管理API
├── orders/               # 订单管理API
├── users/                # 用户管理API
├── statistics/           # 数据统计API
└── common/               # 通用API（如上传等）
```

每个API模块通常包含以下文件：
- `types.ts` - 类型定义
- `api.ts` - API请求函数
- `hooks.ts` - 基于RTK Query的钩子函数

### assets/

存放项目静态资源：

```
assets/
├── images/               # 图片资源
├── icons/                # 图标资源
└── fonts/                # 字体文件
```

### components/

包含所有可复用的组件，分类组织：

```
components/
├── common/               # 通用UI组件
│   ├── Button/
│   ├── Card/
│   ├── Modal/
│   └── ...
├── business/             # 业务相关组件
│   ├── ProductCard/
│   ├── OrderStatusBadge/
│   └── ...
├── data-entry/           # 数据输入组件
│   ├── Form/
│   ├── Select/
│   └── ...
├── data-display/         # 数据展示组件
│   ├── Table/
│   ├── List/
│   └── ...
├── charts/               # 图表组件
│   ├── LineChart/
│   ├── BarChart/
│   └── ...
└── feedback/             # 反馈组件
    ├── Alert/
    ├── Notification/
    └── ...
```

每个组件目录通常包含以下文件：
- `index.tsx` - 组件主文件
- `styles.ts` - 组件样式
- `types.ts` - 组件类型定义
- `hooks.ts` - 组件相关钩子函数
- `__tests__/` - 组件测试

### config/

应用配置文件：

```
config/
├── index.ts              # 配置入口
├── routes.ts             # 路由配置
├── menu.ts               # 菜单配置
├── permissions.ts        # 权限配置
└── constants.ts          # 全局常量
```

### hooks/

自定义React Hooks：

```
hooks/
├── useAuth.ts            # 认证相关钩子
├── useTable.ts           # 表格相关钩子
├── useForm.ts            # 表单相关钩子
├── usePermission.ts      # 权限相关钩子
└── ...
```

### layouts/

页面布局组件：

```
layouts/
├── AdminLayout/          # 主管理布局
├── AuthLayout/           # 认证页面布局
└── components/           # 布局组件
    ├── Sidebar/
    ├── Header/
    ├── Footer/
    └── ...
```

### pages/

按照业务功能组织页面组件：

```
pages/
├── Login/                # 登录页面
├── Dashboard/            # 仪表盘页面
├── Products/             # 商品管理
│   ├── List/             # 商品列表页
│   ├── Detail/           # 商品详情页
│   └── Edit/             # 商品编辑页
├── Orders/               # 订单管理
│   ├── List/             # 订单列表页
│   └── Detail/           # 订单详情页
├── Users/                # 用户管理
├── Marketing/            # 营销管理
│   ├── Coupons/          # 优惠券管理
│   └── Banners/          # 轮播图管理
├── Statistics/           # 数据统计
│   ├── Sales/            # 销售统计
│   ├── Users/            # 用户统计
│   └── Products/         # 商品统计
└── Settings/             # 系统设置
```

每个页面目录通常包含以下文件：
- `index.tsx` - 页面组件
- `components/` - 页面专用组件
- `hooks.ts` - 页面相关钩子
- `types.ts` - 页面相关类型定义

### router/

路由相关配置：

```
router/
├── index.tsx             # 路由入口
├── routes/               # 路由定义
│   ├── authRoutes.tsx    # 认证相关路由
│   ├── productRoutes.tsx # 商品相关路由
│   └── ...               # 其他模块路由
└── guards/               # 路由守卫
    ├── AuthGuard.tsx     # 认证守卫
    └── PermissionGuard.tsx # 权限守卫
```

### services/

服务层，提供业务逻辑封装：

```
services/
├── auth/                 # 认证服务
├── product/              # 商品服务
├── order/                # 订单服务
├── user/                 # 用户服务
├── file/                 # 文件上传服务
└── ...
```

### store/

Redux状态管理：

```
store/
├── index.ts              # 全局Store配置
├── middleware.ts         # Redux中间件
├── hooks.ts              # Redux相关Hook
├── slices/               # Redux切片
│   ├── authSlice.ts      # 认证状态
│   ├── productSlice.ts   # 商品状态
│   └── ...               # 其他状态切片
└── rtk-query/            # RTK Query API
    ├── api.ts            # API定义
    ├── productApi.ts     # 商品API
    └── ...               # 其他API定义
```

### styles/

全局样式相关文件：

```
styles/
├── index.css             # 入口样式文件
├── variables.css         # CSS变量定义
├── themes/               # 主题相关
│   ├── light.css         # 浅色主题
│   └── dark.css          # 深色主题
└── tailwind/             # Tailwind CSS相关
    └── extensions.css    # 扩展样式
```

### types/

全局TypeScript类型定义：

```
types/
├── index.ts              # 类型导出
├── api.ts                # API相关类型
├── models/               # 数据模型类型
│   ├── product.ts        # 商品类型
│   ├── order.ts          # 订单类型
│   └── ...               # 其他数据模型
└── common.ts             # 通用类型定义
```

### utils/

工具函数：

```
utils/
├── auth.ts               # 认证相关工具
├── format.ts             # 格式化工具
├── request.ts            # 请求相关工具
├── storage.ts            # 本地存储工具
├── validation.ts         # 验证工具
└── ...
```

## 文件命名约定

- 组件文件：使用Pascal命名法，如`ProductList.tsx`
- 其他TS/JS文件：使用camel命名法，如`authService.ts`
- 样式文件：与组件同名，如`ProductList.module.css`
- 类型定义文件：通常命名为`types.ts`或`[模块名].types.ts`
- 常量文件：通常命名为`constants.ts`

## 导入约定

项目使用别名导入以避免复杂的相对路径导入，主要别名包括：

```typescript
// 配置示例 (vite.config.ts)
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@api': path.resolve(__dirname, 'src/api'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@pages': path.resolve(__dirname, 'src/pages'),
    '@types': path.resolve(__dirname, 'src/types'),
    '@assets': path.resolve(__dirname, 'src/assets'),
  }
}
```

使用示例：

```typescript
import { Button } from '@components/common';
import { useAuth } from '@hooks/useAuth';
import { formatPrice } from '@utils/format';
```

## 相关资源

- [项目架构概述](overview.md)
- [状态管理设计](state-management.md)
- [路由架构](routing.md)
- [API集成](api-integration.md)
- [类型系统](typescript.md) 