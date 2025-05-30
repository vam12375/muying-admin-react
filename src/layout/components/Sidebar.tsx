import React, { useEffect, useState } from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  BellOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  TrophyOutlined,
  CarOutlined,
  MessageOutlined,
  MoneyCollectOutlined,
  CustomerServiceOutlined,
  CommentOutlined
} from '@ant-design/icons'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'
import './Sidebar.css'

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
      key: '/product',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/product/list',
          label: '商品列表',
        },
        {
          key: '/product/category',
          label: '商品分类',
        },
        {
          key: '/product/brand',
          label: '品牌管理',
        },
        {
          key: '/product/analysis',
          label: '商品分析',
        },
      ],
    },
    {
      key: '/comment',
      icon: <CommentOutlined />,
      label: '评价管理',
      children: [
        {
          key: '/comment/list',
          label: '评价列表',
        },
        {
          key: '/comment/statistics',
          label: '评价统计',
        }
      ],
    },
    {
      key: '/order',
      icon: <FileTextOutlined />,
      label: '订单管理',
      children: [
        {
          key: '/order/list',
          label: '订单列表',
        }
      ],
    },
    {
      key: '/afterSale',
      icon: <CustomerServiceOutlined />,
      label: '售后管理',
      children: [
        {
          key: '/afterSale/list',
          label: '退款申请列表',
        },
        {
          key: '/afterSale/statistics',
          label: '退款统计',
        },
      ],
    },
    {
      key: '/user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: '/user/list',
          label: '用户列表',
        },
      ],
    },
    {
      key: '/coupon',
      icon: <TagOutlined />,
      label: '优惠券管理',
      children: [
        {
          key: '/coupon/list',
          label: '优惠券列表',
        },
        {
          key: '/coupon/form',
          label: '优惠券表单',
        },
        {
          key: '/coupon/batch',
          label: '批量发放',
        },
        {
          key: '/coupon/rule',
          label: '优惠规则',
        },
      ],
    },
    {
      key: '/points',
      icon: <TrophyOutlined />,
      label: '积分管理',
      children: [
        {
          key: '/points/history',
          label: '积分列表',
        },
        {
          key: '/points/product',
          label: '积分商品',
        },
        {
          key: '/points/rule',
          label: '积分规则',
        },
        {
          key: '/points/user',
          label: '用户积分',
        },
        {
          key: '/points/exchange',
          label: '兑换记录',
        },
      ],
    },
    {
      key: '/message',
      icon: <MessageOutlined />,
      label: '消息管理',
      children: [
        {
          key: '/message/list',
          label: '消息列表',
        },
        {
          key: '/message/template',
          label: '消息模板',
        },
      ],
    },
    {
      key: '/logistics',
      icon: <CarOutlined />,
      label: '物流管理',
      children: [
        {
          key: '/logistics/list',
          label: '物流列表',
        },
        {
          key: '/logistics/company',
          label: '物流公司',
        },
      ],
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/system/config',
          label: '系统配置',
        },
        {
          key: '/system/log',
          label: '系统日志',
        },
        {
          key: '/system/redis',
          label: 'Redis管理',
        },
      ],
    },
  ]

  return (
    <div className={cn(
      "sidebar-container",
      collapsed && "sidebar-collapsed"
    )}>
      <div className="sidebar-logo">
        <motion.div 
          initial={false}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4"
        >
          <div className="logo-icon">
            <BarcodeOutlined className="text-white text-xl" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.h1 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="logo-text"
              >
                母婴商城
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="sidebar-menu-container">
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          className="sidebar-menu"
          inlineCollapsed={collapsed}
        />
      </div>
    </div>
  )
}

export default Sidebar 