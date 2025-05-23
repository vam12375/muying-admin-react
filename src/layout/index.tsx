import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { Badge, Avatar, Input } from 'antd'
import { cn } from '@/lib/utils'
import { useTheme } from '@/theme/useTheme'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MotionWrapper from '@/components/animations/MotionWrapper'

/**
 * 主布局组件
 * 包含侧边栏、顶部导航和内容区域
 * 使用磨砂玻璃效果和现代化设计
 */
const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isDark } = useTheme()

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
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* 侧边栏 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={collapsed ? "collapsed" : "expanded"}
          initial={{ width: collapsed ? 240 : 80 }}
          animate={{ width: collapsed ? 80 : 240 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative h-full z-20"
        >
          <div className="absolute inset-0 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-700 shadow-md">
            <Sidebar collapsed={collapsed} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="h-16 z-10">
          <div className="h-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <Header collapsed={collapsed} toggle={toggleCollapsed} />
          </div>
        </div>

        {/* 内容区域 */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm">
          <MotionWrapper animation="fade" delay={0.2}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <Outlet />
            </div>
          </MotionWrapper>
        </main>
      </div>
    </div>
  )
}

export default Layout 