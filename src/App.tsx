import { useEffect, useState, Suspense, lazy } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import type { ThemeConfig } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './theme/themeContext'
import { useTheme } from './theme/useTheme'
import NotificationProvider from './components/Notification/NotificationManager'
import Loader from './components/Loader'
import { isLoggedIn, getToken } from './utils/auth'
import axios from 'axios'
import './App.css'

// 懒加载路由组件
const Router = lazy(() => import('./router'))

// 确保API请求路径正确
const ensureApiPath = (url: string): string => {
  // 如果是admin/开头但没有/api前缀，添加/api前缀
  if (url.startsWith('admin/') && !url.startsWith('/')) {
    return `/api/${url}`
  }
  
  // 如果是/admin开头但没有/api前缀，添加/api前缀
  if (url.startsWith('/admin') && !url.startsWith('/api')) {
    return `/api${url}`
  }
  
  return url
}

// 配置全局axios请求拦截器
axios.interceptors.request.use(
  config => {
    // 确保API路径正确
    if (config.url) {
      config.url = ensureApiPath(config.url)
    }
    
    const token = getToken()
    if (token) {
      console.log('全局请求拦截器: 添加Authorization头')
      config.headers['Authorization'] = `Bearer ${token}`
    } else {
      console.log('全局请求拦截器: 未找到token')
    }
    return config
  },
  error => {
    console.error('全局请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 配置全局axios响应拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('全局响应拦截器: 认证错误', error.response.status)
        // 可以在这里添加全局处理逻辑
      }
    }
    return Promise.reject(error)
  }
)

// Ant Design主题配置
const antdLightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3182ff',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',
    borderRadius: 6,
  }
}

const antdDarkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3182ff',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',
    borderRadius: 6,
  },
  algorithm: theme.darkAlgorithm
}

// 全局加载组件
const GlobalLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader variant="infinite" size="xl" color="primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">加载中...</p>
    </div>
  </div>
)

// 验证token有效性
const validateToken = async (): Promise<boolean> => {
  const token = getToken()
  if (!token) {
    console.log('validateToken: 未找到token')
    return false
  }
  
  console.log('validateToken: 开始验证token')
  try {
    // 调用后端验证token的接口，使用正确的API路径
    const response = await axios.get('/api/admin/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('validateToken: 验证成功，响应状态:', response.status)
    console.log('validateToken: 响应数据:', response.data)
    return response.data && response.data.code === 200
  } catch (error) {
    console.error('Token验证失败:', error)
    // 如果是网络错误，可能是后端服务未启动
    if (axios.isAxiosError(error) && !error.response) {
      console.error('validateToken: 网络错误，可能是后端服务未启动')
    }
    // 如果是401或403错误，说明token无效
    if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('validateToken: token无效，状态码:', error.response.status)
    }
    return false
  }
}

// 内部包装组件，负责应用主题配置
const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // 应用初始化时检查token有效性
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 如果当前不在登录页且用户已登录，验证token有效性
        if (location.pathname !== '/login' && isLoggedIn()) {
          console.log('AppContent: 检查token有效性')
          const isValid = await validateToken()
          if (!isValid) {
            console.error('AppContent: token无效，重定向到登录页')
            // 如果token无效，清除本地存储并重定向到登录页
            localStorage.removeItem('muying_admin_token')
            localStorage.removeItem('muying_admin_user')
            
            // 保存当前路径，以便登录后返回
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true })
            setAuthError('登录已过期，请重新登录')
          } else {
            console.log('AppContent: token有效')
          }
        } else if (location.pathname !== '/login') {
          console.log('AppContent: 未登录且不在登录页，重定向到登录页')
          navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true })
        }
      } catch (error) {
        console.error('AppContent: 检查认证时出错', error)
        setAuthError('检查认证时出错，请重新登录')
      } finally {
        // 完成加载
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [location.pathname, navigate])

  // 监听路由变化
  useEffect(() => {
    // 滚动到顶部
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (isLoading) {
    return <GlobalLoader />
  }

  return (
    <ConfigProvider theme={isDark ? antdDarkTheme : antdLightTheme} locale={zhCN}>
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        {authError && location.pathname === '/login' && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
            {authError}
          </div>
        )}
        <Suspense fallback={<GlobalLoader />}>
          <Router />
        </Suspense>
      </div>
    </ConfigProvider>
  )
}

// 主App组件，提供主题上下文
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
