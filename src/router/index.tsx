import React from 'react'
import { lazy, Suspense } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { Spin } from 'antd'
import { isLoggedIn } from '@/utils/auth'
import { RouteObject } from 'react-router'
import { motion } from 'framer-motion'
import FadeIn from '@/components/animations/FadeIn'

// 布局组件
const Layout = lazy(() => import('@/layout'))

// 页面组件
const Login = lazy(() => import('@/views/login'))
const Dashboard = lazy(() => import('@/views/dashboard'))
const NotFound = lazy(() => import('@/views/error/404'))
const UserList = lazy(() => import('@/views/user/list'))
const ProductList = lazy(() => import('@/views/product/ProductList'))
const CategoryManage = lazy(() => import('@/views/product/CategoryManage'))
const BrandManage = lazy(() => import('@/views/product/BrandManage'))
const ProductAnalysis = lazy(() => import('@/views/product/analysis'))
const OrderList = lazy(() => import('@/views/order/list'))
const OrderDetail = lazy(() => import('@/views/order/detail'))
const LogisticsList = lazy(() => import('@/views/logistics/list'))
const LogisticsCompany = lazy(() => import('@/views/logistics/company'))
const ComponentsShowcase = lazy(() => import('@/views/components'))

// 加载动画组件
const LoadingAnimation = () => (
  <div className="page-loading flex justify-center items-center min-h-[200px]">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }} 
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" 
      }}
    >
      <Spin size="large" />
    </motion.div>
  </div>
)

// 懒加载包装器
const LazyLoad = (Component: React.LazyExoticComponent<any>) => {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <FadeIn>
        <Component />
      </FadeIn>
    </Suspense>
  )
}

// 需要认证的路由
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return children
}

// 路由配置
const routeConfig: RouteObject[] = [
  {
    path: '/login',
    element: LazyLoad(Login)
  },
  {
    path: '/',
    element: <AuthRoute>{LazyLoad(Layout)}</AuthRoute>,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: LazyLoad(Dashboard)
      },
      {
        path: 'components',
        element: LazyLoad(ComponentsShowcase)
      },
      {
        path: 'user',
        children: [
          {
            path: 'list',
            element: LazyLoad(UserList)
          }
        ]
      },
      {
        path: 'product',
        children: [
          {
            path: 'list',
            element: LazyLoad(ProductList)
          },
          {
            path: 'category',
            element: LazyLoad(CategoryManage)
          },
          {
            path: 'brand',
            element: LazyLoad(BrandManage)
          },
          {
            path: 'analysis',
            element: LazyLoad(ProductAnalysis)
          }
        ]
      },
      {
        path: 'order',
        children: [
          {
            path: 'list',
            element: LazyLoad(OrderList)
          },
          {
            path: 'detail/:id',
            element: LazyLoad(OrderDetail)
          }
        ]
      },
      {
        path: 'logistics',
        children: [
          {
            path: 'list',
            element: LazyLoad(LogisticsList)
          },
          {
            path: 'company',
            element: LazyLoad(LogisticsCompany)
          }
        ]
      },
      {
        path: 'coupon',
        children: [
          {
            path: 'list',
            element: LazyLoad(lazy(() => import('@/views/coupon/list')))
          },
          {
            path: 'create',
            element: LazyLoad(lazy(() => import('@/views/coupon/form')))
          },
          {
            path: 'edit/:id',
            element: LazyLoad(lazy(() => import('@/views/coupon/form')))
          },
          {
            path: 'batch',
            element: LazyLoad(lazy(() => import('@/views/coupon/batch')))
          },
          {
            path: 'rule',
            element: LazyLoad(lazy(() => import('@/views/coupon/rule')))
          }
        ]
      },
      {
        path: 'points',
        children: [
          {
            path: 'history',
            element: LazyLoad(lazy(() => import('@/views/points/list')))
          },
          {
            path: 'user',
            element: LazyLoad(lazy(() => import('@/views/points/user')))
          },
          {
            path: 'rule',
            element: LazyLoad(lazy(() => import('@/views/points/rule')))
          },
          {
            path: 'product',
            element: LazyLoad(lazy(() => import('@/views/points/product')))
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: LazyLoad(NotFound)
  }
]

// 路由组件
const Router: React.FC = () => {
  const routes = useRoutes(routeConfig)
  return routes
}

export default Router 