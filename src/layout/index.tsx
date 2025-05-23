import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Layout as AntLayout } from 'antd'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'

const { Content } = AntLayout

/**
 * 主布局组件
 * 包含侧边栏、顶部导航和内容区域
 */
const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // 处理侧边栏折叠/展开
  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  // 在移动设备上自动折叠侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    // 初始化
    handleResize()

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 路由变化时，在移动设备上自动折叠侧边栏
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }, [location.pathname])

  return (
    <AntLayout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      
      <AntLayout 
        className={cn(
          "transition-all duration-300",
          collapsed ? "md:ml-[80px]" : "md:ml-[220px]"
        )}
      >
        <Header collapsed={collapsed} toggle={toggleCollapsed} />
        
        <Content className={cn(
          "p-6 m-6 bg-white dark:bg-gray-800 rounded-lg",
          "shadow-sm border border-gray-100 dark:border-gray-700"
        )}>
          <MotionWrapper animation="fade" delay={0.2}>
            <Outlet />
          </MotionWrapper>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout 