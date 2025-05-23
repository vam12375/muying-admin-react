import React, { useState } from 'react'
import { Layout, Dropdown, Avatar, Badge, Button, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/useTheme'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'

type MenuItem = Required<MenuProps>['items'][number];

interface HeaderProps {
  collapsed: boolean
  toggle: () => void
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggle }) => {
  const { Header } = Layout
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [searchVisible, setSearchVisible] = useState(false)

  const handleLogout = () => {
    // 处理登出逻辑
    navigate('/login')
  }

  const userMenuItems: MenuItem[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const notificationItems: MenuItem[] = [
    {
      key: '1',
      label: (
        <div className="py-2">
          <div className="font-medium">系统通知</div>
          <div className="text-sm text-gray-500">系统将于今晚22:00进行维护</div>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <div className="py-2">
          <div className="font-medium">订单提醒</div>
          <div className="text-sm text-gray-500">有5个新订单待处理</div>
        </div>
      )
    },
    {
      key: '3',
      label: (
        <div className="py-2">
          <div className="font-medium">库存预警</div>
          <div className="text-sm text-gray-500">3个产品库存不足</div>
        </div>
      )
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: <div className="text-center text-primary-500">查看全部通知</div>
    }
  ]

  return (
    <Header className="bg-white dark:bg-gray-800 px-4 flex items-center justify-between shadow-sm transition-all duration-300">
      <div className="flex items-center">
        <MotionWrapper animation="fade" delay={0.1}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggle}
            className="mr-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          />
        </MotionWrapper>
        
        {searchVisible ? (
          <MotionWrapper animation="slideRight" delay={0}>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
              <SearchOutlined className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper animation="fade" delay={0.2}>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchVisible(true)}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </MotionWrapper>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <MotionWrapper animation="fade" delay={0.3}>
          <Tooltip title="帮助中心">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </Tooltip>
        </MotionWrapper>

        <MotionWrapper animation="fade" delay={0.4}>
          <Tooltip title={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
            <Button
              type="text"
              icon={
                isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )
              }
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </Tooltip>
        </MotionWrapper>

        <MotionWrapper animation="fade" delay={0.5}>
          <Dropdown
            menu={{ items: notificationItems }}
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="min-w-[300px]"
          >
            <Badge count={3} className="cursor-pointer">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              />
            </Badge>
          </Dropdown>
        </MotionWrapper>

        <MotionWrapper animation="fade" delay={0.6}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div className={cn(
              "flex items-center cursor-pointer px-2 py-1 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            )}>
              <Avatar icon={<UserOutlined />} className="bg-primary-500" />
              <span className="ml-2 text-gray-800 dark:text-gray-200 hidden sm:inline">管理员</span>
            </div>
          </Dropdown>
        </MotionWrapper>
      </div>
    </Header>
  )
}

export default Header 