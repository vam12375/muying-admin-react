import { useEffect, useState, Suspense, lazy } from 'react'
import { useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './theme/themeContext'
import { lightTheme, darkTheme } from './theme'
import { useTheme } from './theme/useTheme'
import NotificationProvider from './components/Notification/NotificationManager'
import Loader from './components/Loader'
import './App.css'

// 懒加载路由组件
const Router = lazy(() => import('./router'))

// 全局加载组件
const GlobalLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader variant="infinite" size="xl" color="primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">加载中...</p>
    </div>
  </div>
)

// 内部包装组件，负责应用主题配置
const AppContent = () => {
  const location = useLocation()
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  // 模拟初始加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  // 监听路由变化
  useEffect(() => {
    // 滚动到顶部
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (isLoading) {
    return <GlobalLoader />
  }

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme} locale={zhCN}>
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
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
