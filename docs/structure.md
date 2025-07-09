# 项目目录结构

## 📁 整体结构

```
muying-admin-react/
├── public/                     # 静态资源目录
│   ├── fonts/                  # 字体文件
│   └── vite.svg               # 应用图标
├── src/                       # 源代码目录
│   ├── api/                   # API 接口层
│   ├── assets/                # 静态资源
│   ├── components/            # 通用组件
│   ├── layout/                # 布局组件
│   ├── lib/                   # 第三方库配置
│   ├── mock/                  # 模拟数据
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   ├── styles/                # 样式文件
│   ├── theme/                 # 主题配置
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面组件
│   ├── App.tsx                # 根组件
│   ├── App.css                # 根组件样式
│   ├── main.tsx               # 应用入口
│   ├── index.css              # 全局样式
│   └── vite-env.d.ts          # Vite 类型声明
├── docs/                      # 项目文档
├── node_modules/              # 依赖包
├── .gitignore                 # Git 忽略文件
├── eslint.config.js           # ESLint 配置
├── index.html                 # HTML 模板
├── package.json               # 项目配置
├── package-lock.json          # 依赖锁定文件
├── postcss.config.js          # PostCSS 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── tsconfig.app.json          # 应用 TS 配置
├── tsconfig.node.json         # Node TS 配置
└── vite.config.ts             # Vite 配置
```

## 🗂️ 核心目录详解

### `/src/api/` - API 接口层
```
api/
├── modules/                   # 按模块分组的 API
│   ├── auth.ts               # 认证相关接口
│   ├── user.ts               # 用户管理接口
│   ├── product.ts            # 商品管理接口
│   ├── order.ts              # 订单管理接口
│   ├── coupon.ts             # 优惠券接口
│   ├── logistics.ts          # 物流接口
│   ├── points.ts             # 积分接口
│   ├── message.ts            # 消息接口
│   └── system.ts             # 系统接口
├── types/                    # API 类型定义
│   ├── common.ts             # 通用类型
│   ├── user.ts               # 用户类型
│   ├── product.ts            # 商品类型
│   └── order.ts              # 订单类型
├── config.ts                 # API 配置
└── index.ts                  # API 统一导出
```

### `/src/components/` - 通用组件
```
components/
├── ui/                       # 基础 UI 组件
│   ├── Button/               # 按钮组件
│   ├── Modal/                # 模态框组件
│   ├── Table/                # 表格组件
│   ├── Form/                 # 表单组件
│   └── Chart/                # 图表组件
├── business/                 # 业务组件
│   ├── UserSelector/         # 用户选择器
│   ├── ProductCard/          # 商品卡片
│   ├── OrderStatus/          # 订单状态
│   └── StatisticCard/        # 统计卡片
├── layout/                   # 布局组件
│   ├── Header/               # 头部组件
│   ├── Sidebar/              # 侧边栏组件
│   ├── Footer/               # 底部组件
│   └── Breadcrumb/           # 面包屑组件
├── Loader/                   # 加载组件
├── Notification/             # 通知组件
└── index.ts                  # 组件统一导出
```

### `/src/layout/` - 页面布局
```
layout/
├── components/               # 布局子组件
│   ├── Header.tsx           # 顶部导航
│   ├── Sidebar.tsx          # 侧边栏
│   ├── Footer.tsx           # 底部信息
│   ├── Breadcrumb.tsx       # 面包屑导航
│   └── UserDropdown.tsx     # 用户下拉菜单
├── hooks/                   # 布局相关 Hooks
│   ├── useLayout.ts         # 布局状态管理
│   └── useMenu.ts           # 菜单状态管理
├── types.ts                 # 布局类型定义
└── index.tsx                # 主布局组件
```

### `/src/store/` - 状态管理
```
store/
├── slices/                  # Redux Slices
│   ├── userSlice.ts         # 用户状态
│   ├── orderSlice.ts        # 订单状态
│   ├── productSlice.ts      # 商品状态
│   ├── logisticsSlice.ts    # 物流状态
│   ├── couponSlice.ts       # 优惠券状态
│   ├── pointsSlice.ts       # 积分状态
│   ├── systemSlice.ts       # 系统状态
│   └── messageSlice.ts      # 消息状态
├── types.ts                 # Store 类型定义
└── index.ts                 # Store 配置
```

### `/src/views/` - 页面组件
```
views/
├── dashboard/               # 仪表盘
│   └── index.tsx
├── login/                   # 登录页面
│   ├── index.tsx
│   └── login.css
├── user/                    # 用户管理
│   ├── list.tsx             # 用户列表
│   ├── transactions.tsx     # 交易记录
│   └── userList.css
├── product/                 # 商品管理
│   ├── ProductList.tsx      # 商品列表
│   ├── CategoryManage.tsx   # 分类管理
│   ├── BrandManage.tsx      # 品牌管理
│   └── analysis/            # 商品分析
├── order/                   # 订单管理
│   ├── list.tsx             # 订单列表
│   └── detail.tsx           # 订单详情
├── coupon/                  # 优惠券管理
│   ├── list.tsx             # 优惠券列表
│   ├── form.tsx             # 优惠券表单
│   ├── detail.tsx           # 优惠券详情
│   ├── batch.tsx            # 批量操作
│   ├── rule.tsx             # 规则配置
│   ├── simple-form.tsx      # 简单表单
│   └── test.tsx             # 测试页面
├── logistics/               # 物流管理
│   ├── list.tsx             # 物流列表
│   ├── detail.tsx           # 物流详情
│   ├── company.tsx          # 物流公司
│   └── tracks.tsx           # 物流跟踪
├── points/                  # 积分管理
│   ├── list.tsx             # 积分列表
│   ├── user.tsx             # 用户积分
│   ├── product.tsx          # 积分商品
│   ├── exchange.tsx         # 积分兑换
│   └── rule.tsx             # 积分规则
├── analytics/               # 数据分析
│   ├── index.tsx            # 分析首页
│   ├── Dashboard.tsx        # 分析仪表盘
│   ├── MultiDimensionAnalysis.tsx  # 多维分析
│   ├── CustomReports.tsx    # 自定义报表
│   ├── ReportExport.tsx     # 报表导出
│   ├── AnalyticsSettings.tsx # 分析设置
│   └── components/          # 分析组件
├── message/                 # 消息管理
│   ├── list.tsx             # 消息列表
│   └── template.tsx         # 消息模板
├── comment/                 # 评论管理
│   ├── index.tsx            # 评论首页
│   ├── list.tsx             # 评论列表
│   ├── reply.tsx            # 评论回复
│   └── statistics.tsx       # 评论统计
├── afterSale/               # 售后管理
│   ├── list.tsx             # 售后列表
│   ├── detail.tsx           # 售后详情
│   └── statistics.tsx       # 售后统计
├── system/                  # 系统管理
│   ├── config.tsx           # 系统配置
│   ├── log.tsx              # 系统日志
│   ├── redis.tsx            # Redis 监控
│   └── redis.css            # Redis 样式
├── admin/                   # 管理员
│   ├── profile/             # 个人资料
│   └── settings/            # 设置
├── components/              # 组件展示
│   └── index.tsx
├── test/                    # 测试页面
└── error/                   # 错误页面
    └── 404.tsx              # 404 页面
```

### `/src/utils/` - 工具函数
```
utils/
├── auth.ts                  # 认证工具
├── request.ts               # 请求工具
├── storage.ts               # 存储工具
├── format.ts                # 格式化工具
├── validation.ts            # 验证工具
├── constants.ts             # 常量定义
├── helpers.ts               # 辅助函数
└── index.ts                 # 工具统一导出
```

### `/src/types/` - 类型定义
```
types/
├── api.ts                   # API 类型
├── user.ts                  # 用户类型
├── product.ts               # 商品类型
├── order.ts                 # 订单类型
├── common.ts                # 通用类型
├── store.ts                 # Store 类型
└── index.ts                 # 类型统一导出
```

## 📋 文件命名规范

### 组件文件
- **React 组件**: PascalCase (如 `UserList.tsx`)
- **组件样式**: kebab-case (如 `user-list.css`)
- **组件目录**: PascalCase (如 `UserList/`)

### 工具文件
- **工具函数**: camelCase (如 `formatDate.ts`)
- **常量文件**: camelCase (如 `apiConstants.ts`)
- **类型文件**: camelCase (如 `userTypes.ts`)

### 页面文件
- **页面组件**: camelCase (如 `index.tsx`, `list.tsx`)
- **页面目录**: camelCase (如 `user/`, `product/`)

## 🎯 目录设计原则

### 1. 按功能模块划分
- 相关功能放在同一目录下
- 便于维护和查找
- 降低模块间耦合

### 2. 分层清晰
- 表现层、业务层、数据层分离
- 职责单一，边界清晰
- 便于测试和重构

### 3. 可扩展性
- 预留扩展空间
- 支持新功能模块添加
- 保持结构一致性

### 4. 开发友好
- 目录结构直观
- 文件命名规范
- 便于团队协作

---

*本文档详细说明了项目的目录结构和组织方式，为开发团队提供结构化指导。*
