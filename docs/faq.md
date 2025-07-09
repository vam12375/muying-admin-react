# 常见问题 FAQ

## 🚀 开发环境问题

### Q: 启动项目时报错 "Cannot find module"
**A:** 这通常是依赖包没有正确安装导致的。

**解决方案:**
```bash
# 1. 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 2. 清理 npm 缓存
npm cache clean --force

# 3. 重新安装依赖
npm install

# 4. 如果仍然有问题，尝试使用 yarn
npm install -g yarn
yarn install
```

### Q: 端口 3000 被占用
**A:** 默认端口被其他应用占用。

**解决方案:**
```bash
# 方法1: 查找并杀死占用端口的进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 方法2: 使用其他端口启动
npm run dev -- --port 3001

# 方法3: 在 vite.config.ts 中配置默认端口
export default defineConfig({
  server: {
    port: 3001
  }
})
```

### Q: TypeScript 类型错误
**A:** TypeScript 编译时出现类型错误。

**解决方案:**
```bash
# 1. 检查 TypeScript 版本
npx tsc --version

# 2. 重新生成类型声明
npx tsc --noEmit

# 3. 更新类型定义包
npm update @types/react @types/react-dom

# 4. 如果是第三方库类型问题，安装对应的类型包
npm install @types/[package-name]
```

## 🎨 UI 组件问题

### Q: Ant Design 样式不生效
**A:** 样式加载或覆盖问题。

**解决方案:**
```typescript
// 1. 确保正确导入 Ant Design 样式
import 'antd/dist/reset.css'

// 2. 检查 ConfigProvider 配置
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

<ConfigProvider locale={zhCN}>
  <App />
</ConfigProvider>

// 3. 自定义主题配置
const theme = {
  token: {
    colorPrimary: '#1890ff',
  },
}
```

### Q: Tailwind CSS 类名不生效
**A:** Tailwind CSS 配置或构建问题。

**解决方案:**
```javascript
// 1. 检查 tailwind.config.js 配置
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// 2. 确保在 main.tsx 中导入 Tailwind CSS
import './index.css'

// 3. 检查 index.css 中的 Tailwind 指令
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Q: 图标不显示
**A:** 图标库导入或使用问题。

**解决方案:**
```typescript
// 1. 确保正确安装图标库
npm install @ant-design/icons lucide-react

// 2. 正确导入和使用图标
import { UserOutlined, SettingOutlined } from '@ant-design/icons'
import { User, Settings } from 'lucide-react'

// 3. 检查图标名称是否正确
<UserOutlined />
<User size={16} />
```

## 🔐 认证授权问题

### Q: 登录后立即跳转到登录页
**A:** Token 存储或验证问题。

**解决方案:**
```typescript
// 1. 检查 token 存储
const token = localStorage.getItem('token')
console.log('Token:', token)

// 2. 检查 token 格式和有效期
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Token payload:', payload)

// 3. 检查 API 请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

// 4. 检查路由守卫逻辑
const isLoggedIn = () => {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp > Date.now() / 1000
  } catch {
    return false
  }
}
```

### Q: API 请求返回 401 未授权
**A:** Token 过期或无效。

**解决方案:**
```typescript
// 1. 实现 token 刷新机制
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post('/auth/refresh', { refreshToken })
    const { token } = response.data
    localStorage.setItem('token', token)
    return token
  } catch (error) {
    // 刷新失败，跳转到登录页
    localStorage.clear()
    window.location.href = '/login'
  }
}

// 2. 在 axios 拦截器中处理
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken()
      if (newToken) {
        // 重试原请求
        error.config.headers.Authorization = `Bearer ${newToken}`
        return api.request(error.config)
      }
    }
    return Promise.reject(error)
  }
)
```

## 📊 数据管理问题

### Q: Redux 状态更新不生效
**A:** 状态不可变性或 reducer 问题。

**解决方案:**
```typescript
// 1. 确保使用 Redux Toolkit 的 createSlice
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ✅ 正确：使用 Immer 自动处理不可变性
    setUser: (state, action) => {
      state.userInfo = action.payload
    },
    // ❌ 错误：直接修改状态
    // setUser: (state, action) => {
    //   return { ...state, userInfo: action.payload }
    // }
  }
})

// 2. 检查 useSelector 的使用
const userInfo = useSelector((state: RootState) => state.user.userInfo)

// 3. 确保正确派发 action
const dispatch = useDispatch()
dispatch(setUser(userData))
```

### Q: 异步数据加载失败
**A:** API 调用或错误处理问题。

**解决方案:**
```typescript
// 1. 使用 createAsyncThunk 处理异步操作
export const fetchUserList = createAsyncThunk(
  'user/fetchList',
  async (params: UserListParams, { rejectWithValue }) => {
    try {
      const response = await userApi.getUsers(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// 2. 在组件中正确处理加载状态
const { users, loading, error } = useSelector((state: RootState) => state.user)

useEffect(() => {
  dispatch(fetchUserList())
}, [dispatch])

// 3. 添加错误处理
if (error) {
  return <div>加载失败: {error}</div>
}
```

## 🚀 性能优化问题

### Q: 页面加载缓慢
**A:** 组件渲染或资源加载问题。

**解决方案:**
```typescript
// 1. 使用 React.memo 优化组件
const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  return <div>{/* 组件内容 */}</div>
})

// 2. 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// 3. 使用 useCallback 缓存函数
const handleClick = useCallback((id: number) => {
  onItemClick(id)
}, [onItemClick])

// 4. 实现虚拟滚动（大列表）
import { FixedSizeList as List } from 'react-window'

const VirtualList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {Row}
  </List>
)
```

### Q: 内存泄漏问题
**A:** 组件卸载时未清理资源。

**解决方案:**
```typescript
// 1. 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    // 定时任务
  }, 1000)
  
  return () => clearInterval(timer)
}, [])

// 2. 取消网络请求
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data))
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error)
      }
    })
  
  return () => controller.abort()
}, [])

// 3. 清理事件监听器
useEffect(() => {
  const handleResize = () => {
    // 处理窗口大小变化
  }
  
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

## 🔧 构建部署问题

### Q: 构建失败
**A:** 依赖或配置问题。

**解决方案:**
```bash
# 1. 检查 Node.js 版本
node --version  # 确保 >= 18.0.0

# 2. 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 检查 TypeScript 错误
npx tsc --noEmit

# 4. 增加构建内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Q: 部署后页面空白
**A:** 路由或资源路径问题。

**解决方案:**
```typescript
// 1. 检查 vite.config.ts 中的 base 配置
export default defineConfig({
  base: '/admin/', // 如果部署在子路径下
  // ...
})

// 2. 检查路由配置
const router = createBrowserRouter([
  // 路由配置
], {
  basename: '/admin' // 与 base 保持一致
})

// 3. 检查 Nginx 配置
location /admin {
  try_files $uri $uri/ /admin/index.html;
}
```

### Q: 静态资源 404
**A:** 资源路径或服务器配置问题。

**解决方案:**
```nginx
# 1. 配置正确的静态资源路径
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  root /var/www/muying-admin/dist;
  expires 1y;
}

# 2. 检查文件权限
sudo chown -R www-data:www-data /var/www/muying-admin/
sudo chmod -R 755 /var/www/muying-admin/

# 3. 检查构建输出
ls -la dist/assets/
```

## 📞 获取帮助

如果以上解决方案无法解决您的问题，请通过以下方式获取帮助：

1. **查看控制台错误**: 打开浏览器开发者工具查看详细错误信息
2. **检查网络请求**: 在 Network 面板中查看 API 请求状态
3. **查看文档**: 参考项目文档和相关技术文档
4. **提交 Issue**: 在项目仓库中提交详细的问题描述
5. **联系团队**: 联系开发团队获取技术支持

---

*本文档收集了开发过程中的常见问题和解决方案，持续更新中。*
