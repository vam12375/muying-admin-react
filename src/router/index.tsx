import React from 'react'
import { lazy, Suspense, useEffect } from 'react'
import { Navigate, useRoutes, useNavigate, useLocation } from 'react-router-dom'
import { Spin, message } from 'antd'
import { isLoggedIn, getToken } from '@/utils/auth'
import type { RouteObject } from 'react-router'
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
const LogisticsDetail = lazy(() => import('@/views/logistics/detail'))
const LogisticsCompany = lazy(() => import('@/views/logistics/company'))
const ComponentsShowcase = lazy(() => import('@/views/components'))
const RedisManage = lazy(() => import('@/views/system/redis'))
// 管理员个人中心和设置页面
const AdminProfile = lazy(() => import('@/views/admin/profile'))
const AdminSettings = lazy(() => import('@/views/admin/settings'))
// 售后管理组件
const AfterSaleList = lazy(() => import('@/views/afterSale/list'))
const AfterSaleDetail = lazy(() => import('@/views/afterSale/detail'))
const AfterSaleStatistics = lazy(() => import('@/views/afterSale/statistics'))
// 评价管理组件
const CommentList = lazy(() => import('@/views/comment/list'))
const CommentStatistics = lazy(() => import('@/views/comment/statistics'))
const CommentDetail = lazy(() => import('@/views/comment/index').then(module => ({ default: module.CommentDetail })))

// 数据分析模块
const Analytics = lazy(() => import('@/views/analytics'))
const AnalyticsDashboard = lazy(() => import('@/views/analytics/Dashboard'))
const MultiDimensionAnalysis = lazy(() => import('@/views/analytics/MultiDimensionAnalysis'))
const CustomReports = lazy(() => import('@/views/analytics/CustomReports'))
const ReportExport = lazy(() => import('@/views/analytics/ReportExport'))
const AnalyticsSettings = lazy(() => import('@/views/analytics/AnalyticsSettings'))


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

// 需要认证的路由守卫组件
const AuthRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = isLoggedIn()
  
  useEffect(() => {
    // 检查token是否存在
    if (!isAuthenticated) {
      message.warning('请先登录')
      // 保存当前路径，以便登录后重定向回来
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
  }, [isAuthenticated, navigate, location.pathname])
  
  // 如果未登录，返回null，等待useEffect中的重定向
  if (!isAuthenticated) {
    return null
  }
  
  // 已登录，渲染子组件
  return children
}

// 登录页面路由守卫
const LoginRoute = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = isLoggedIn()
  
  useEffect(() => {
    // 如果已登录且在登录页，重定向到首页或查询参数中的redirect
    if (isAuthenticated) {
      const params = new URLSearchParams(location.search)
      const redirect = params.get('redirect')
      navigate(redirect || '/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, location.search])
  
  // 如果已登录，返回null，等待useEffect中的重定向
  if (isAuthenticated) {
    return null
  }
  
  // 未登录，渲染登录页
  return children
}

// 路由配置
const routeConfig: RouteObject[] = [
  {
    path: '/login',
    element: <LoginRoute>{LazyLoad(Login)}</LoginRoute>
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
        path: 'analytics',
        children: [
          {
            path: '',
            element: LazyLoad(Analytics)
          },
          {
            path: 'dashboard',
            element: LazyLoad(AnalyticsDashboard)
          },
          {
            path: 'multi-dimension',
            element: LazyLoad(MultiDimensionAnalysis)
          },
          {
            path: 'custom-reports',
            element: LazyLoad(CustomReports)
          },
          {
            path: 'export',
            element: LazyLoad(ReportExport)
          },
          {
            path: 'settings',
            element: LazyLoad(AnalyticsSettings)
          }
        ]
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
        path: 'afterSale',
        children: [
          {
            path: 'list',
            element: LazyLoad(AfterSaleList)
          },
          {
            path: 'detail/:id',
            element: LazyLoad(AfterSaleDetail)
          },
          {
            path: 'statistics',
            element: LazyLoad(AfterSaleStatistics)
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
            path: 'detail/:id',
            element: LazyLoad(LogisticsDetail)
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
          },
          {
            path: 'exchange',
            element: LazyLoad(lazy(() => import('@/views/points/exchange')))
          }
        ]
      },
      {
        path: 'message',
        children: [
          {
            path: '',
            element: LazyLoad(lazy(() => import('@/views/message/list')))
          },
          {
            path: 'list',
            element: LazyLoad(lazy(() => import('@/views/message/list')))
          },
          {
            path: 'detail/:id',
            element: LazyLoad(lazy(() => import('@/views/message/template')))
          }
        ]
      },
      {
        path: 'system',
        children: [
          {
            path: 'redis',
            element: LazyLoad(RedisManage)
          },
          {
            path: 'log',
            element: LazyLoad(lazy(() => import('@/views/system/log')))
          },
          {
            path: 'config',
            element: LazyLoad(lazy(() => import('@/views/system/config')))
          }
        ]
      },
      // 管理员个人中心和设置路由
      {
        path: 'profile',
        element: LazyLoad(AdminProfile)
      },
      {
        path: 'settings',
        element: LazyLoad(AdminSettings)
      },
      {
        path: 'comment',
        children: [
          {
            path: '',
            element: <Navigate to="/comment/list" replace />
          },
          {
            path: 'list',
            element: LazyLoad(CommentList)
          },
          {
            path: 'statistics',
            element: LazyLoad(CommentStatistics)
          },
          {
            path: 'detail/:id',
            element: LazyLoad(CommentDetail)
          }
        ]
      }
    ]
  },
  {
    path: '/404',
    element: LazyLoad(NotFound)
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
]

// 路由组件
const Router: React.FC = () => {
  const routes = useRoutes(routeConfig)
  return routes
}

export default Router 