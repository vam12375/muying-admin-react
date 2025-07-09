# 编码规范

## 📋 总体原则

### 代码质量原则
1. **可读性优先**: 代码应该易于理解和维护
2. **一致性**: 保持代码风格的一致性
3. **简洁性**: 避免不必要的复杂性
4. **可测试性**: 编写易于测试的代码
5. **性能考虑**: 在保证可读性的前提下优化性能

## 🎯 TypeScript 规范

### 类型定义

#### Interface vs Type
```typescript
// ✅ 推荐：使用 interface 定义对象结构
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

// ✅ 推荐：使用 type 定义联合类型、函数类型
type Status = 'pending' | 'approved' | 'rejected'
type EventHandler = (event: Event) => void

// ✅ 推荐：interface 可以扩展
interface AdminUser extends User {
  role: 'admin'
  permissions: string[]
}
```

#### 泛型使用
```typescript
// ✅ 推荐：泛型命名使用 T, K, V 等
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// ✅ 推荐：约束泛型
interface Repository<T extends { id: number }> {
  findById(id: number): Promise<T>
  save(entity: T): Promise<T>
}

// ✅ 推荐：默认泛型参数
interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

#### 类型断言
```typescript
// ✅ 推荐：使用 as 语法
const userElement = document.getElementById('user') as HTMLInputElement

// ❌ 避免：使用 <> 语法（与 JSX 冲突）
const userElement = <HTMLInputElement>document.getElementById('user')

// ✅ 推荐：类型守卫
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string'
}
```

### 函数定义
```typescript
// ✅ 推荐：明确的参数和返回类型
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// ✅ 推荐：可选参数和默认值
function createUser(
  name: string,
  email: string,
  role: UserRole = 'user'
): User {
  return { name, email, role, id: generateId() }
}

// ✅ 推荐：函数重载
function formatDate(date: Date): string
function formatDate(date: string): string
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}
```

## ⚛️ React 组件规范

### 组件定义
```typescript
// ✅ 推荐：函数组件 + TypeScript
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: number) => void
  className?: string
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  className
}) => {
  // 组件实现
  return (
    <div className={clsx('user-card', className)}>
      {/* JSX 内容 */}
    </div>
  )
}

export default UserCard
```

### 组件结构顺序
```typescript
const UserList: React.FC<UserListProps> = (props) => {
  // 1. Props 解构
  const { users, loading, onUserSelect } = props
  
  // 2. Hooks（按依赖顺序）
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 3. 计算属性
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])
  
  // 4. 事件处理函数
  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user)
    onUserSelect?.(user)
  }, [onUserSelect])
  
  // 5. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [])
  
  // 6. 条件渲染
  if (loading) {
    return <Spin size="large" />
  }
  
  // 7. 主要渲染
  return (
    <div className="user-list">
      {/* JSX 内容 */}
    </div>
  )
}
```

### Hooks 使用规范
```typescript
// ✅ 推荐：自定义 Hook
const useUserList = (initialFilters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await userApi.getUsers(filters)
      setUsers(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户失败')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchUsers(initialFilters)
  }, [fetchUsers, initialFilters])
  
  return {
    users,
    loading,
    error,
    fetchUsers,
    refetch: () => fetchUsers(initialFilters)
  }
}
```

## 🎨 样式规范

### Tailwind CSS 使用
```typescript
// ✅ 推荐：使用 clsx 处理条件类名
import clsx from 'clsx'

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  children,
  className,
  ...props 
}) => {
  return (
    <button
      className={clsx(
        // 基础样式
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // 尺寸变体
        {
          'px-3 py-1.5 text-sm': size === 'small',
          'px-4 py-2 text-base': size === 'medium',
          'px-6 py-3 text-lg': size === 'large',
        },
        
        // 颜色变体
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': 
            variant === 'primary' && !disabled,
          'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500': 
            variant === 'secondary' && !disabled,
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': 
            variant === 'danger' && !disabled,
        },
        
        // 禁用状态
        {
          'opacity-50 cursor-not-allowed': disabled,
        },
        
        // 自定义类名
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

### CSS 模块化
```css
/* UserCard.module.css */
.userCard {
  @apply bg-white rounded-lg shadow-md p-6 transition-shadow;
}

.userCard:hover {
  @apply shadow-lg;
}

.userCard__header {
  @apply flex items-center justify-between mb-4;
}

.userCard__avatar {
  @apply w-12 h-12 rounded-full object-cover;
}

.userCard__info {
  @apply flex-1 ml-4;
}

.userCard__name {
  @apply text-lg font-semibold text-gray-900;
}

.userCard__email {
  @apply text-sm text-gray-600;
}
```

## 📁 文件和目录命名

### 文件命名规范
```
components/
├── UserCard/
│   ├── index.ts              # 导出文件
│   ├── UserCard.tsx          # 主组件文件
│   ├── UserCard.test.tsx     # 测试文件
│   ├── UserCard.stories.tsx  # Storybook 文件
│   └── UserCard.module.css   # 样式文件
├── hooks/
│   ├── useUserList.ts        # 自定义 Hook
│   └── useAuth.ts
├── utils/
│   ├── formatDate.ts         # 工具函数
│   ├── validation.ts
│   └── constants.ts          # 常量定义
└── types/
    ├── user.ts               # 类型定义
    └── api.ts
```

### 变量命名规范
```typescript
// ✅ 推荐：语义化命名
const userList = []
const isLoading = false
const hasPermission = true
const userCount = 0

// ✅ 推荐：事件处理函数
const handleUserClick = () => {}
const handleFormSubmit = () => {}
const handleInputChange = () => {}

// ✅ 推荐：布尔值命名
const isVisible = true
const hasError = false
const canEdit = true
const shouldUpdate = false

// ✅ 推荐：常量命名
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3
const DEFAULT_PAGE_SIZE = 20

// ✅ 推荐：枚举命名
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## 📝 注释规范

### JSDoc 注释
```typescript
/**
 * 用户卡片组件
 * @param user - 用户信息
 * @param onEdit - 编辑回调函数
 * @param onDelete - 删除回调函数
 * @param className - 自定义样式类名
 * @returns 用户卡片 JSX 元素
 */
const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  onDelete, 
  className 
}) => {
  // 组件实现
}

/**
 * 格式化日期
 * @param date - 要格式化的日期
 * @param format - 格式化模式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 * @example
 * formatDate(new Date()) // '2023-12-01'
 * formatDate(new Date(), 'YYYY/MM/DD') // '2023/12/01'
 */
function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  // 实现
}
```

### 行内注释
```typescript
// ✅ 推荐：解释复杂逻辑
const calculateDiscount = (price: number, userLevel: string) => {
  // 根据用户等级计算折扣率
  const discountRate = userLevel === 'vip' ? 0.2 : 0.1
  
  // 最低折扣金额为 5 元
  const discount = Math.max(price * discountRate, 5)
  
  return discount
}

// ✅ 推荐：TODO 注释
// TODO: 添加用户权限检查
// FIXME: 修复在 Safari 中的样式问题
// NOTE: 这个方法在下个版本中会被废弃
```

## 🚫 代码禁忌

### 避免的写法
```typescript
// ❌ 避免：any 类型
const userData: any = {}

// ✅ 推荐：明确类型
const userData: User = {}

// ❌ 避免：魔法数字
if (user.age > 18) {}

// ✅ 推荐：命名常量
const ADULT_AGE = 18
if (user.age > ADULT_AGE) {}

// ❌ 避免：深层嵌套
if (user) {
  if (user.profile) {
    if (user.profile.settings) {
      // 处理逻辑
    }
  }
}

// ✅ 推荐：可选链
if (user?.profile?.settings) {
  // 处理逻辑
}

// ❌ 避免：直接修改 props
const Component = ({ items }) => {
  items.push(newItem) // 错误！
}

// ✅ 推荐：不可变更新
const Component = ({ items, onItemsChange }) => {
  const handleAddItem = () => {
    onItemsChange([...items, newItem])
  }
}
```

## 🔍 代码审查清单

### 提交前检查
- [ ] 代码符合 TypeScript 规范
- [ ] 组件结构清晰，职责单一
- [ ] 样式使用 Tailwind CSS 规范
- [ ] 变量和函数命名语义化
- [ ] 添加必要的注释
- [ ] 通过 ESLint 检查
- [ ] 通过单元测试
- [ ] 性能考虑（避免不必要的重渲染）

---

*本文档定义了项目的编码规范，确保代码质量和团队协作效率。*
