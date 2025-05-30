import React, { useState, useEffect } from 'react'
import { Dropdown, Button, Tooltip, Avatar, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'
import MessageCenter from '@/components/MessageCenter'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/slices/userSlice'
import type { RootState } from '@/store'

type MenuItem = Required<MenuProps>['items'][number];

interface HeaderProps {
  collapsed: boolean
  toggle: () => void
}

const Header: React.FC<HeaderProps> = ({ collapsed, toggle }) => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [searchVisible, setSearchVisible] = useState(false)
  const dispatch = useDispatch()
  
  // 从Redux获取用户信息，包括头像
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  
  // 添加状态来存储处理过的头像URL
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined)
  
  // 当Redux中的头像URL变化时更新本地状态
  useEffect(() => {
    if (userInfo?.avatar) {
      // 使用已经带有时间戳的URL或为不带时间戳的URL添加时间戳
      if (userInfo.avatar.includes('t=')) {
        setAvatarSrc(userInfo.avatar);
      } else {
        setAvatarSrc(userInfo.avatar + (userInfo.avatar.includes('?') ? '&' : '?') + 't=' + new Date().getTime());
      }
    } else {
      setAvatarSrc(undefined);
    }
  }, [userInfo?.avatar]);

  const handleLogout = () => {
    // 处理登出逻辑
    dispatch(logout())
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

  return (
    <div className="px-4 h-full flex items-center justify-between">
      {/* 左侧区域 */}
      <div className="flex items-center gap-3">
        <MotionWrapper animation="fade" delay={0.1}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggle}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 rounded-lg"
            size="large"
          />
        </MotionWrapper>
        
        <AnimatePresence mode="wait" initial={false}>
          {searchVisible ? (
            <motion.div
              key="search-input"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 250 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative"
            >
              <Input
                placeholder="搜索..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-lg bg-white dark:bg-gray-700 backdrop-blur-md bg-opacity-50 dark:bg-opacity-50 border-gray-200 dark:border-gray-600"
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="search-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setSearchVisible(true)}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 rounded-lg"
                size="large"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-2">
        <MotionWrapper animation="fade" delay={0.3}>
          <Tooltip title="帮助中心">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 rounded-lg"
              size="large"
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
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 rounded-lg"
              size="large"
            />
          </Tooltip>
        </MotionWrapper>

        <MotionWrapper animation="fade" delay={0.5}>
          <MessageCenter />
        </MotionWrapper>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <MotionWrapper animation="fade" delay={0.6}>
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight" 
            trigger={['click']}
            arrow={{ pointAtCenter: true }}
            popupRender={(menu) => (
              <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                {React.cloneElement(menu as React.ReactElement)}
              </div>
            )}
          >
            <div className={cn(
              "flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-colors"
            )}>
              <Avatar 
                className="bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm"
                icon={<UserOutlined />}
                src={avatarSrc}
              />
              <span className="ml-2 text-gray-800 dark:text-gray-200 hidden sm:inline font-medium">
                {userInfo?.nickname || userInfo?.admin_name || '管理员'}
              </span>
            </div>
          </Dropdown>
        </MotionWrapper>
      </div>
    </div>
  )
}

export default Header 