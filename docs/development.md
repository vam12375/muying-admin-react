# 开发指南

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **Git**: 最新版本

### 开发环境搭建

#### 1. 克隆项目
```bash
git clone <repository-url>
cd muying-admin-react
```

#### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 3. 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

#### 4. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 开发工具推荐

#### IDE/编辑器
- **VS Code** (推荐)
  - 安装 ES7+ React/Redux/React-Native snippets
  - 安装 TypeScript Importer
  - 安装 Tailwind CSS IntelliSense
  - 安装 ESLint 插件

#### 浏览器插件
- **React Developer Tools**
- **Redux DevTools**

## 📝 编码规范

### TypeScript 规范

#### 类型定义
```typescript
// ✅ 推荐：使用 interface 定义对象类型
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

// ✅ 推荐：使用 type 定义联合类型
type Status = 'pending' | 'approved' | 'rejected'

// ✅ 推荐：泛型使用
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

#### 组件类型
```typescript
// ✅ 推荐：函数组件类型定义
interface UserListProps {
  users: User[]
  onUserSelect: (user: User) => void
  loading?: boolean
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onUserSelect, 
  loading = false 
}) => {
  // 组件实现
}
```

### React 组件规范

#### 组件结构
```typescript
// ✅ 推荐的组件结构
import React, { useState, useEffect } from 'react'
import { Button, Table } from 'antd'
import type { User } from '@/types/user'
import './UserList.css'

interface UserListProps {
  // props 类型定义
}

const UserList: React.FC<UserListProps> = (props) => {
  // 1. Hooks
  const [loading, setLoading] = useState(false)
  
  // 2. 事件处理函数
  const handleUserClick = (user: User) => {
    // 处理逻辑
  }
  
  // 3. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [])
  
  // 4. 渲染
  return (
    <div className="user-list">
      {/* JSX 内容 */}
    </div>
  )
}

export default UserList
```

#### Hooks 使用规范
```typescript
// ✅ 推荐：自定义 Hook
const useUserList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await getUserList()
      setUsers(response.data)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return { users, loading, fetchUsers }
}
```

### 样式规范

#### Tailwind CSS 使用
```typescript
// ✅ 推荐：使用 clsx 处理条件类名
import clsx from 'clsx'

const Button = ({ variant, disabled, children }) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-md font-medium transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-700 hover:bg-gray-300': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

#### CSS 模块化
```css
/* UserList.css */
.user-list {
  @apply bg-white rounded-lg shadow-md p-6;
}

.user-list__header {
  @apply flex justify-between items-center mb-4;
}

.user-list__title {
  @apply text-xl font-semibold text-gray-800;
}
```

### 命名规范

#### 文件命名
- **组件文件**: PascalCase (如 `UserList.tsx`)
- **工具文件**: camelCase (如 `formatDate.ts`)
- **常量文件**: camelCase (如 `apiConstants.ts`)
- **样式文件**: kebab-case (如 `user-list.css`)

#### 变量命名
```typescript
// ✅ 推荐：语义化命名
const userList = []
const isLoading = false
const handleUserClick = () => {}

// ❌ 不推荐：无意义命名
const data = []
const flag = false
const fn = () => {}
```

#### 常量命名
```typescript
// ✅ 推荐：大写下划线
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const
```

## 🔧 开发工具配置

### ESLint 配置
```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  }
]
```

### TypeScript 配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Vite 配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

## 🧪 测试规范

### 单元测试
```typescript
// UserList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import UserList from './UserList'

describe('UserList', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' }
  ]
  
  it('should render user list', () => {
    render(<UserList users={mockUsers} onUserSelect={jest.fn()} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
  
  it('should call onUserSelect when user is clicked', () => {
    const mockOnUserSelect = jest.fn()
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />)
    
    fireEvent.click(screen.getByText('John Doe'))
    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0])
  })
})
```

## 📦 构建和部署

### 构建命令
```bash
# 开发环境构建
npm run build:dev

# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

### 环境变量
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=母婴商城管理后台（开发）

# .env.production
VITE_API_BASE_URL=https://api.muying.com
VITE_APP_TITLE=母婴商城管理后台
```

## 🔍 调试技巧

### React DevTools
- 使用 React DevTools 查看组件树
- 检查组件 props 和 state
- 性能分析和优化

### Redux DevTools
- 查看 action 派发历史
- 检查 state 变化
- 时间旅行调试

### 浏览器调试
```typescript
// 使用 console.log 调试
console.log('用户数据:', users)

// 使用 debugger 断点
const handleUserClick = (user: User) => {
  debugger // 浏览器会在此处暂停
  onUserSelect(user)
}
```

---

*本文档提供了完整的开发指南，帮助开发者快速上手项目开发。*
