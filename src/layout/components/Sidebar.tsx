import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  GiftOutlined,
  TagOutlined,
  TeamOutlined,
  ShopOutlined,
  BarcodeOutlined,
  PieChartOutlined,
  BellOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  // 当路由变化时，更新选中的菜单项
  useEffect(() => {
    const pathname = location.pathname
    const paths = pathname.split('/').filter(Boolean)
    
    // 设置选中的菜单项
    setSelectedKeys([pathname])
    
    // 设置展开的子菜单
    if (paths.length > 0 && !collapsed) {
      setOpenKeys([`/${paths[0]}`])
    }
  }, [location.pathname, collapsed])

  // 处理菜单项点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/products/list',
          label: '商品列表',
        },
        {
          key: '/products/categories',
          label: '商品分类',
        },
        {
          key: '/products/attributes',
          label: '商品属性',
        },
        {
          key: '/products/brands',
          label: '品牌管理',
        },
      ],
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
      children: [
        {
          key: '/orders/list',
          label: '订单列表',
        },
        {
          key: '/orders/returns',
          label: '退货管理',
        },
      ],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/users/list',
          label: '用户列表',
        },
        {
          key: '/users/levels',
          label: '会员等级',
        },
      ],
    },
    {
      key: '/marketing',
      icon: <GiftOutlined />,
      label: '营销管理',
      children: [
        {
          key: '/marketing/promotions',
          label: '促销活动',
        },
        {
          key: '/marketing/coupons',
          label: '优惠券',
        },
        {
          key: '/marketing/flash-sales',
          label: '限时抢购',
        },
      ],
    },
    {
      key: '/content',
      icon: <AppstoreOutlined />,
      label: '内容管理',
      children: [
        {
          key: '/content/banners',
          label: '轮播图',
        },
        {
          key: '/content/articles',
          label: '文章管理',
        },
      ],
    },
    {
      key: '/statistics',
      icon: <PieChartOutlined />,
      label: '统计分析',
      children: [
        {
          key: '/statistics/sales',
          label: '销售统计',
        },
        {
          key: '/statistics/users',
          label: '用户统计',
        },
        {
          key: '/statistics/products',
          label: '商品统计',
        },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/settings/basic',
          label: '基础设置',
        },
        {
          key: '/settings/payment',
          label: '支付设置',
        },
        {
          key: '/settings/shipping',
          label: '物流设置',
        },
        {
          key: '/settings/admin',
          label: '管理员',
        },
        {
          key: '/settings/roles',
          label: '角色权限',
        },
      ],
    },
  ]

  const sidebarVariants = {
    expanded: {
      width: 220,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    collapsed: {
      width: 80,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  }

  return (
    <motion.div
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        className={cn(
          "h-screen fixed left-0 top-0 z-10 overflow-auto",
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
          "transition-all duration-300"
        )}
      >
        <MotionWrapper animation="slideDown" delay={0.1}>
          <div className={cn(
            "logo h-16 flex items-center justify-center",
            "border-b border-gray-200 dark:border-gray-700"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <BarcodeOutlined className="text-white text-lg" />
              </div>
              {!collapsed && (
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">母婴商城</h1>
              )}
            </div>
          </div>
        </MotionWrapper>

        <div className="mt-4">
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            className={cn(
              "border-none bg-transparent",
              "text-gray-700 dark:text-gray-300"
            )}
          />
        </div>
      </Sider>
    </motion.div>
  )
}

export default Sidebar 