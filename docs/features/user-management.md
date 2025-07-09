# 用户管理模块

## 📋 模块概述

用户管理模块是母婴商城管理后台的核心模块之一，负责管理系统中的所有用户信息、权限控制和用户行为分析。

### 主要功能
- 👥 **用户列表管理**: 查看、搜索、筛选用户
- 📝 **用户信息编辑**: 修改用户基本信息
- 🔐 **权限管理**: 用户角色和权限分配
- 💰 **交易记录**: 用户消费和交易历史
- 📊 **用户分析**: 用户行为和统计分析

## 🏗️ 模块架构

### 文件结构
```
src/views/user/
├── components/           # 用户模块组件
│   ├── UserCard/        # 用户卡片组件
│   ├── UserForm/        # 用户表单组件
│   ├── UserFilter/      # 用户筛选组件
│   └── UserStats/       # 用户统计组件
├── hooks/               # 用户模块 Hooks
│   ├── useUserList.ts   # 用户列表 Hook
│   ├── useUserDetail.ts # 用户详情 Hook
│   └── useUserStats.ts  # 用户统计 Hook
├── types/               # 用户类型定义
│   └── index.ts
├── utils/               # 用户工具函数
│   └── index.ts
├── list.tsx            # 用户列表页面
├── detail.tsx          # 用户详情页面
├── transactions.tsx    # 交易记录页面
└── userList.css        # 样式文件
```

### 状态管理
```typescript
// src/store/slices/userSlice.ts
interface UserState {
  // 用户列表
  userList: User[]
  userDetail: User | null
  
  // 分页信息
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  
  // 筛选条件
  filters: UserFilters
  
  // 加载状态
  loading: {
    list: boolean
    detail: boolean
    update: boolean
  }
  
  // 错误信息
  error: string | null
}
```

## 🎯 核心功能

### 1. 用户列表管理

#### 功能特性
- ✅ 分页显示用户列表
- ✅ 多条件筛选（姓名、邮箱、状态、注册时间）
- ✅ 排序功能（注册时间、最后登录时间）
- ✅ 批量操作（启用/禁用、删除）
- ✅ 导出用户数据

#### 实现示例
```typescript
// 用户列表组件
const UserList: React.FC = () => {
  const dispatch = useDispatch()
  const { userList, loading, pagination } = useSelector(
    (state: RootState) => state.user
  )
  
  // 获取用户列表
  const fetchUsers = useCallback((params?: UserListParams) => {
    dispatch(fetchUserList(params))
  }, [dispatch])
  
  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: User) => (
        <Avatar src={avatar} size={40}>
          {record.name?.charAt(0)}
        </Avatar>
      )
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: User) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetail(record.id)}>
            查看
          </Button>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            size="small" 
            danger 
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]
  
  return (
    <div className="user-list">
      {/* 筛选区域 */}
      <UserFilter onFilter={fetchUsers} />
      
      {/* 用户表格 */}
      <Table
        columns={columns}
        dataSource={userList}
        loading={loading.list}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            fetchUsers({ page, pageSize })
          }
        }}
        rowKey="id"
      />
    </div>
  )
}
```

### 2. 用户详情管理

#### 功能特性
- ✅ 查看用户完整信息
- ✅ 编辑用户基本信息
- ✅ 查看用户订单历史
- ✅ 查看用户收货地址
- ✅ 用户行为日志

#### 实现示例
```typescript
// 用户详情组件
const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { userDetail, loading } = useSelector((state: RootState) => state.user)
  
  const [activeTab, setActiveTab] = useState('info')
  
  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetail(id))
    }
  }, [id, dispatch])
  
  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: <UserInfo user={userDetail} />
    },
    {
      key: 'orders',
      label: '订单历史',
      children: <UserOrders userId={id} />
    },
    {
      key: 'addresses',
      label: '收货地址',
      children: <UserAddresses userId={id} />
    },
    {
      key: 'logs',
      label: '操作日志',
      children: <UserLogs userId={id} />
    }
  ]
  
  if (loading.detail) {
    return <Spin size="large" />
  }
  
  return (
    <div className="user-detail">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  )
}
```

### 3. 交易记录管理

#### 功能特性
- ✅ 查看用户所有交易记录
- ✅ 按时间、金额、类型筛选
- ✅ 交易统计分析
- ✅ 导出交易数据

#### 实现示例
```typescript
// 交易记录组件
const UserTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({})
  
  const fetchTransactions = useCallback(async (params?: TransactionParams) => {
    setLoading(true)
    try {
      const response = await transactionApi.getTransactions(params)
      setTransactions(response.data.items)
    } catch (error) {
      message.error('获取交易记录失败')
    } finally {
      setLoading(false)
    }
  }, [])
  
  const columns: ColumnsType<Transaction> = [
    {
      title: '交易ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: TransactionType) => (
        <Tag color={getTransactionTypeColor(type)}>
          {getTransactionTypeName(type)}
        </Tag>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
          {record.type === 'income' ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '交易时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    }
  ]
  
  return (
    <div className="user-transactions">
      {/* 筛选器 */}
      <TransactionFilter onFilter={setFilters} />
      
      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <StatisticCard
            title="总收入"
            value={calculateTotalIncome(transactions)}
            prefix="¥"
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            title="总支出"
            value={calculateTotalExpense(transactions)}
            prefix="¥"
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
      </Row>
      
      {/* 交易表格 */}
      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        rowKey="id"
      />
    </div>
  )
}
```

## 🔐 权限控制

### 权限定义
```typescript
// 用户模块权限
export const USER_PERMISSIONS = {
  VIEW: 'user:view',           // 查看用户
  CREATE: 'user:create',       // 创建用户
  EDIT: 'user:edit',          // 编辑用户
  DELETE: 'user:delete',       // 删除用户
  EXPORT: 'user:export',       // 导出用户数据
  MANAGE_ROLES: 'user:roles'   // 管理用户角色
} as const
```

### 权限检查
```typescript
// 权限检查 Hook
const useUserPermissions = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth)
  
  return {
    canView: hasPermission(userInfo, USER_PERMISSIONS.VIEW),
    canCreate: hasPermission(userInfo, USER_PERMISSIONS.CREATE),
    canEdit: hasPermission(userInfo, USER_PERMISSIONS.EDIT),
    canDelete: hasPermission(userInfo, USER_PERMISSIONS.DELETE),
    canExport: hasPermission(userInfo, USER_PERMISSIONS.EXPORT),
    canManageRoles: hasPermission(userInfo, USER_PERMISSIONS.MANAGE_ROLES)
  }
}
```

## 📊 数据统计

### 用户统计指标
```typescript
interface UserStats {
  totalUsers: number          // 总用户数
  activeUsers: number         // 活跃用户数
  newUsersToday: number      // 今日新增用户
  newUsersThisMonth: number  // 本月新增用户
  userGrowthRate: number     // 用户增长率
  averageOrderValue: number  // 平均订单价值
  userRetentionRate: number  // 用户留存率
}
```

### 统计图表
```typescript
// 用户增长趋势图
const UserGrowthChart: React.FC = () => {
  const [chartData, setChartData] = useState([])
  
  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    smooth: true,
    color: '#1890ff'
  }
  
  return <Line {...config} />
}
```

## 🧪 测试用例

### 单元测试
```typescript
// UserList.test.tsx
describe('UserList Component', () => {
  it('should render user list correctly', () => {
    const mockUsers = [
      { id: 1, name: 'John', email: 'john@example.com', status: 'active' }
    ]
    
    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    )
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
  
  it('should handle user deletion', async () => {
    const mockDeleteUser = jest.fn()
    
    render(
      <Provider store={mockStore}>
        <UserList onDeleteUser={mockDeleteUser} />
      </Provider>
    )
    
    fireEvent.click(screen.getByText('删除'))
    fireEvent.click(screen.getByText('确认'))
    
    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalled()
    })
  })
})
```

## 📈 性能优化

### 优化策略
1. **虚拟滚动**: 大量用户数据的虚拟滚动
2. **分页加载**: 合理的分页大小设置
3. **缓存策略**: 用户数据的本地缓存
4. **防抖搜索**: 搜索输入的防抖处理

### 实现示例
```typescript
// 防抖搜索
const useDebounceSearch = (callback: (value: string) => void, delay: number) => {
  const [searchValue, setSearchValue] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue) {
        callback(searchValue)
      }
    }, delay)
    
    return () => clearTimeout(timer)
  }, [searchValue, callback, delay])
  
  return [searchValue, setSearchValue] as const
}
```

---

*本文档详细说明了用户管理模块的功能特性、技术实现和最佳实践。*
