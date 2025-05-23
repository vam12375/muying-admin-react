import { useState, useEffect, useMemo } from 'react'
import { Row, Col, Spin, Segmented, Select } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

import StatsCard from '@/components/StatsCard'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Tag from '@/components/Tag'
import PageTransition from '@/components/PageTransition'
import { useTheme } from '@/theme/useTheme'
import FadeIn from '@/components/animations/FadeIn'
import { FadeInItem } from '@/components/animations/FadeIn'
import StatusIndicator from '@/components/StatusIndicator'

// 销售数据
const salesData = [
  { month: '1月', 婴儿用品: 1200, 孕妇用品: 800, 儿童用品: 1000, total: 3000 },
  { month: '2月', 婴儿用品: 1350, 孕妇用品: 750, 儿童用品: 1100, total: 3200 },
  { month: '3月', 婴儿用品: 1400, 孕妇用品: 880, 儿童用品: 1300, total: 3580 },
  { month: '4月', 婴儿用品: 1500, 孕妇用品: 900, 儿童用品: 1400, total: 3800 },
  { month: '5月', 婴儿用品: 1600, 孕妇用品: 1000, 儿童用品: 1500, total: 4100 },
  { month: '6月', 婴儿用品: 1750, 孕妇用品: 1050, 儿童用品: 1600, total: 4400 },
]

// 订单数据
const orderStatusData = [
  { name: '已完成', value: 850, color: '#22c55e' },
  { name: '处理中', value: 320, color: '#3b82f6' },
  { name: '待支付', value: 200, color: '#f59e0b' },
  { name: '已取消', value: 100, color: '#ef4444' },
]

// 产品类别数据
const categoryData = [
  { name: '婴儿用品', 销量: 1800 },
  { name: '孕妇用品', 销量: 1200 },
  { name: '儿童服饰', 销量: 1400 },
  { name: '玩具', 销量: 1000 },
  { name: '童车', 销量: 600 },
  { name: '洗护', 销量: 800 },
]

// 用户增长数据
const userGrowthData = [
  { day: '周一', 新用户: 120, 活跃用户: 220 },
  { day: '周二', 新用户: 132, 活跃用户: 232 },
  { day: '周三', 新用户: 101, 活跃用户: 201 },
  { day: '周四', 新用户: 134, 活跃用户: 234 },
  { day: '周五', 新用户: 190, 活跃用户: 290 },
  { day: '周六', 新用户: 230, 活跃用户: 330 },
  { day: '周日', 新用户: 210, 活跃用户: 310 },
]

// 转化率数据
const conversionData = [
  { name: '访问', value: 1000 },
  { name: '浏览商品', value: 800 },
  { name: '加入购物车', value: 600 },
  { name: '下单', value: 300 },
  { name: '支付', value: 200 },
];

// 最近订单数据
const recentOrders = [
  { id: 'ORD-2023-06-28-1', customer: '王小明', amount: 1250, status: 'success', time: '10分钟前' },
  { id: 'ORD-2023-06-28-2', customer: '李小红', amount: 890, status: 'processing', time: '30分钟前' },
  { id: 'ORD-2023-06-28-3', customer: '张三', amount: 2300, status: 'warning', time: '1小时前' },
  { id: 'ORD-2023-06-27-4', customer: '赵四', amount: 1650, status: 'error', time: '2小时前' },
  { id: 'ORD-2023-06-27-5', customer: '刘备', amount: 780, status: 'success', time: '3小时前' },
];

// 区域销售数据
const regionData = [
  { name: '华东区', value: 38 },
  { name: '华南区', value: 25 },
  { name: '华北区', value: 22 },
  { name: '西南区', value: 15 },
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string | number>('monthly')
  const [chartView, setChartView] = useState<string | number>('line')
  const { isDark } = useTheme()
  
  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // 图表主题色
  const chartColors = useMemo(() => ({
    text: isDark ? '#d1d5db' : '#4b5563',
    grid: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(229, 231, 235, 0.6)',
    tooltip: isDark ? '#1f2937' : '#ffffff',
    gradientStart: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    gradientEnd: isDark ? 'rgba(59, 130, 246, 0.01)' : 'rgba(59, 130, 246, 0.01)',
  }), [isDark]);

  // 根据状态获取对应组件
  const getStatusComponent = (status: string) => {
    switch (status) {
      case 'success': return <StatusIndicator type="success" text="已完成" />
      case 'processing': return <StatusIndicator type="processing" text="处理中" ping />
      case 'warning': return <StatusIndicator type="warning" text="待支付" />
      case 'error': return <StatusIndicator type="error" text="已取消" />
      default: return null
    }
  }

  // 自定义图表工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={clsx(
          'p-3 shadow-lg rounded-lg border',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        )}>
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm flex items-center">
              <span 
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="mr-2">{entry.name}:</span>
              <span className={clsx('font-bold', {
                'text-blue-500': entry.name === '婴儿用品',
                'text-yellow-500': entry.name === '孕妇用品',
                'text-green-500': entry.name === '儿童用品',
              })}>
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染销售图表
  const renderSalesChart = () => {
    switch (chartView) {
      case 'area':
        return (
          <AreaChart
            data={salesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBaby" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPregnant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorChildren" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text }} />
            <YAxis tick={{ fill: chartColors.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="婴儿用品" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorBaby)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="孕妇用品" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorPregnant)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="儿童用品" 
              stroke="#22c55e" 
              fillOpacity={1} 
              fill="url(#colorChildren)"
              strokeWidth={2}
            />
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart
            data={salesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text }} />
            <YAxis tick={{ fill: chartColors.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="婴儿用品" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="孕妇用品" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="儿童用品" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
        
      default:
        return (
          <LineChart
            data={salesData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text }} />
            <YAxis tick={{ fill: chartColors.text }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="婴儿用品" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={1200}
            />
            <Line 
              type="monotone" 
              dataKey="孕妇用品" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={1200}
              animationBegin={300}
            />
            <Line 
              type="monotone" 
              dataKey="儿童用品" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ r: 4 }}
              animationDuration={1200}
              animationBegin={600}
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <Spin size="large" />
          <p className="mt-3 text-gray-500 dark:text-gray-400">加载仪表盘数据...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="dashboard-container pb-10">
        <FadeIn className="mb-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                商城概览
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                欢迎回来，这里展示了您的商城数据分析和关键指标
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Tag color="blue" variant="light" rounded="full">
                <CalendarOutlined className="mr-1" /> 最近30天
              </Tag>
              <Button type="primary" size="middle" animated>
                数据导出
              </Button>
            </div>
          </div>
        </FadeIn>
        
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="总用户数"
              value={15840}
              icon={<UserOutlined />}
              color="primary"
              trend={{ value: 4.25, isUpward: true, text: '本月' }}
              duration={1.2}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="总订单数"
              value={3628}
              icon={<ShoppingCartOutlined />}
              color="success"
              trend={{ value: 6.8, isUpward: true, text: '本月' }}
              duration={1.2}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="总收入"
              value={128650}
              prefix="¥"
              icon={<DollarOutlined />}
              color="warning"
              trend={{ value: 2.5, isUpward: false, text: '本周' }}
              duration={1.2}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatsCard
              title="总商品数"
              value={1268}
              icon={<ShoppingOutlined />}
              color="default"
              trend={{ value: 12, isUpward: true, text: '本月' }}
              duration={1.2}
            />
          </Col>
        </Row>
        
        {/* 图表组件 */}
        <FadeIn staggerChildren={0.15}>
          <Row gutter={[16, 16]}>
            {/* 销售趋势图表 */}
            <Col xs={24} lg={16}>
              <FadeInItem>
                <Card 
                  title={
                    <div className="flex justify-between items-center">
                      <span>销售趋势</span>
                      <div className="flex items-center space-x-2">
                        <Select 
                          defaultValue="monthly" 
                          style={{ width: 100 }}
                          options={[
                            { value: 'weekly', label: '按周' },
                            { value: 'monthly', label: '按月' },
                            { value: 'quarterly', label: '按季度' },
                          ]}
                          onChange={setTimeRange}
                          size="small"
                        />
                        <Segmented
                          options={[
                            { value: 'line', label: '折线图' },
                            { value: 'area', label: '面积图' },
                            { value: 'bar', label: '柱状图' }
                          ]}
                          value={chartView}
                          onChange={setChartView}
                          size="small"
                        />
                      </div>
                    </div>
                  } 
                  className="mb-6 overflow-visible"
                  shadow="sm"
                >
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={chartView.toString()}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          {renderSalesChart()}
                        </motion.div>
                      </AnimatePresence>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeInItem>
              
              {/* 用户增长图表 */}
              <FadeInItem>
                <Card 
                  title="用户增长" 
                  className="mb-6"
                  shadow="sm"
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Tag color="blue" rounded="full">新增用户: +320</Tag>
                    <Tag color="green" rounded="full">转化率: 32%</Tag>
                    <Tag color="purple" rounded="full" variant="light">环比: +5.4%</Tag>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userGrowthData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        barSize={20}
                      >
                        <defs>
                          <linearGradient id="colorNewUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                          </linearGradient>
                          <linearGradient id="colorActiveUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.5}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fill: chartColors.text }}
                        />
                        <YAxis 
                          tick={{ fill: chartColors.text }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: chartColors.tooltip,
                            border: `1px solid ${chartColors.grid}`
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="新用户" 
                          fill="url(#colorNewUser)" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                        />
                        <Bar 
                          dataKey="活跃用户" 
                          fill="url(#colorActiveUser)" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={300}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeInItem>
              
              {/* 最近订单 */}
              <FadeInItem>
                <Card 
                  title={
                    <div className="flex justify-between items-center">
                      <span>最近订单</span>
                      <Button type="link" size="small">查看全部</Button>
                    </div>
                  }
                  className="mb-6 overflow-visible"
                  shadow="sm"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">订单号</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">客户</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">金额</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentOrders.map((order, index) => (
                          <motion.tr 
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={clsx(
                              'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                              index % 2 === 0 ? 'bg-white dark:bg-gray-800/20' : 'bg-gray-50/50 dark:bg-gray-800/10'
                            )}
                          >
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">{order.id}</td>
                            <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">{order.customer}</td>
                            <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">¥{order.amount.toLocaleString()}</td>
                            <td className="px-3 py-3 text-sm">{getStatusComponent(order.status)}</td>
                            <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{order.time}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </FadeInItem>
            </Col>
            
            {/* 侧边图表 */}
            <Col xs={24} lg={8}>
              {/* 订单状态图表 */}
              <FadeInItem>
                <Card 
                  title="订单状态" 
                  className="mb-6"
                  shadow="sm"
                >
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          animationDuration={1500}
                          animationBegin={300}
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: chartColors.tooltip,
                            border: `1px solid ${chartColors.grid}`
                          }}
                          formatter={(value, name) => [`${value} 个订单`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {orderStatusData.map((item) => (
                      <div 
                        key={item.name}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInItem>
              
              {/* 产品类别图表 */}
              <FadeInItem>
                <Card 
                  title="产品类别销量" 
                  className="mb-6"
                  shadow="sm"
                >
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={categoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          {categoryData.map((entry, index) => (
                            <linearGradient 
                              key={`gradient-${index}`}
                              id={`colorCategory${index}`} 
                              x1="0" 
                              y1="0" 
                              x2="1" 
                              y2="0"
                            >
                              <stop 
                                offset="5%" 
                                stopColor={
                                  index % 3 === 0 ? '#3b82f6' : 
                                  index % 3 === 1 ? '#22c55e' : '#f59e0b'
                                }
                                stopOpacity={0.8}
                              />
                              <stop 
                                offset="95%" 
                                stopColor={
                                  index % 3 === 0 ? '#3b82f6' : 
                                  index % 3 === 1 ? '#22c55e' : '#f59e0b'
                                }
                                stopOpacity={0.5}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis 
                          type="number" 
                          tick={{ fill: chartColors.text }}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fill: chartColors.text }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: chartColors.tooltip,
                            border: `1px solid ${chartColors.grid}`
                          }}
                        />
                        <Bar dataKey="销量" radius={[0, 4, 4, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#colorCategory${index})`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeInItem>
              
              {/* 区域销售分析 */}
              <FadeInItem>
                <Card 
                  title="区域销售分析" 
                  className="mb-6"
                  shadow="sm"
                >
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="20%" 
                        outerRadius="90%" 
                        barSize={15} 
                        data={regionData}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={15}
                          fill="#3b82f6"
                          animationDuration={1500}
                          label={{ position: 'insideStart', fill: '#fff', fontWeight: 'bold', fontSize: 12 }}
                        >
                          {regionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                index === 0 ? '#3b82f6' : 
                                index === 1 ? '#f59e0b' : 
                                index === 2 ? '#22c55e' : '#9333ea'
                              } 
                            />
                          ))}
                        </RadialBar>
                        <Legend 
                          iconSize={10} 
                          iconType="circle"
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: chartColors.tooltip,
                            border: `1px solid ${chartColors.grid}`
                          }}
                          formatter={(value) => [`${value}%`, '占比']}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </FadeInItem>
            </Col>
          </Row>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

export default Dashboard 