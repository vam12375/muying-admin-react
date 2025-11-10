import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  GiftOutlined,
  GoldOutlined,
  SettingOutlined,
  BellOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  LineChartOutlined,
  CommentOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ItemType } from 'antd/es/breadcrumb/Breadcrumb';

type MenuItem = Required<MenuProps>['items'][number];

// 面包屑项类型定义
export type BreadcrumbItem = ItemType;

// 菜单项配置
export const getMenuItems = (): MenuItem[] => {
  return [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        {
          key: 'user/list',
          label: '用户列表',
        },
        {
          key: 'user/transactions',
          label: '交易记录',
        },
      ],
    },
    {
      key: 'product',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      children: [
        {
          key: 'product/list',
          label: '商品列表',
        },
        {
          key: 'product/category',
          label: '分类管理',
        },
        {
          key: 'product/brand',
          label: '品牌管理',
        },
        {
          key: 'product/analysis',
          label: '商品分析',
        },
      ],
    },
    {
      key: 'comment',
      icon: <CommentOutlined />,
      label: '评价管理',
    },
    {
      key: 'order',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
      children: [
        {
          key: 'order/list',
          label: '订单列表',
        },
      ],
    },
    {
      key: 'afterSale',
      icon: <CustomerServiceOutlined />,
      label: '售后管理',
      children: [
        {
          key: 'afterSale/list',
          label: '退款申请列表',
        },
        {
          key: 'afterSale/statistics',
          label: '退款统计',
        },
      ],
    },
    {
      key: 'logistics',
      icon: <CarOutlined />,
      label: '物流管理',
      children: [
        {
          key: 'logistics/list',
          label: '物流列表',
        },
        {
          key: 'logistics/company',
          label: '物流公司',
        },
      ],
    },
    {
      key: 'coupon',
      icon: <GiftOutlined />,
      label: '优惠券管理',
      children: [
        {
          key: 'coupon/list',
          label: '优惠券列表',
        },
        {
          key: 'coupon/rule',
          label: '优惠规则',
        },
      ],
    },
    {
      key: 'points',
      icon: <GoldOutlined />,
      label: '积分管理',
      children: [
        {
          key: 'points/list',
          label: '积分列表',
        },
        {
          key: 'points/rule',
          label: '积分规则',
        },
        {
          key: 'points/product',
          label: '积分商品',
        },
      ],
    },
    {
      key: 'message',
      icon: <BellOutlined />,
      label: '消息管理',
      children: [
        {
          key: 'message/list',
          label: '消息列表',
        },
        {
          key: 'message/template',
          label: '消息模板',
        },
      ],
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: 'analytics',
          label: '分析仪表盘',
        },
        {
          key: 'analytics/multi-dimension',
          label: '多维分析',
        },
        {
          key: 'analytics/custom-reports',
          label: '自定义报表',
        },
        {
          key: 'analytics/export',
          label: '报表导出',
        },
        {
          key: 'analytics/settings',
          label: '分析设置',
        },
      ],
    },
    {
      key: 'components',
      icon: <AppstoreOutlined />,
      label: '组件展示',
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: 'system/monitor',
          label: '系统监控',
        },
        {
          key: 'system/config',
          label: '系统配置',
        },
        {
          key: 'system/log',
          label: '系统日志',
        },
        {
          key: 'system/redis',
          label: 'Redis管理',
        },
      ],
    },
  ];
};

// 菜单组件
const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathname = location.pathname.substring(1); // 去掉开头的斜杠
    const pathnameArr = pathname.split('/');
    
    // 设置选中的菜单项
    setSelectedKeys([pathname]);
    
    // 设置展开的子菜单
    if (pathnameArr.length > 0) {
      setOpenKeys([pathnameArr[0]]);
    }
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = (info: { key: string }) => {
    navigate(`/${info.key}`);
  };

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuClick}
      items={getMenuItems()}
    />
  );
};

// 根据路径获取面包屑项
export const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  // 默认包含首页
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      title: <a href="/">首页</a>,
      key: 'home'
    }
  ];

  // 如果是首页，直接返回
  if (pathname === '/' || pathname === '/dashboard') {
    return breadcrumbItems;
  }

  // 去掉开头的斜杠
  const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
  const pathSegments = path.split('/');
  
  // 获取所有菜单项
  const menuItems = getMenuItems();
  
  // 处理一级菜单
  if (pathSegments.length > 0) {
    const parentKey = pathSegments[0];
    const parentItem = menuItems.find(item => item && item.key === parentKey);
    
    if (parentItem && 'label' in parentItem) {
      breadcrumbItems.push({
        title: parentItem.label,
        key: parentKey
      });
      
      // 处理二级菜单
      if (pathSegments.length > 1 && 'children' in parentItem && parentItem.children) {
        const childKey = `${parentKey}/${pathSegments[1]}`;
        const childItems = parentItem.children as MenuItem[];
        
        if (childItems) {
          const childItem = childItems.find(item => item && item.key === childKey);
          if (childItem && 'label' in childItem) {
            breadcrumbItems.push({
              title: childItem.label,
              key: childKey
            });
          }
          
          // 处理三级路径（如果有）
          if (pathSegments.length > 2) {
            // 对于详情页等，添加额外的面包屑项
            if (pathSegments[1] === 'detail') {
              breadcrumbItems.push({
                title: '详情',
                key: 'detail'
              });
            } else if (pathSegments[1] === 'edit') {
              breadcrumbItems.push({
                title: '编辑',
                key: 'edit'
              });
            }
          }
        }
      }
    }
  }
  
  return breadcrumbItems;
};

export default SideMenu; 