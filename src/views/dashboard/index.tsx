import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, Progress, Tooltip, Table, DatePicker } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  ShoppingOutlined, 
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FireOutlined,
  RiseOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Line, Bar, Pie } from '@ant-design/charts'
import Card from '@/components/Card'
import Button from '@/components/Button'
import MotionWrapper from '@/components/animations/MotionWrapper'
import { formatPrice, formatNumber } from '@/lib/utils'
import { 
  slideUpAnimation,
  staggerContainerAnimation,
  fadeAnimation,
  hoverCardAnimation
} from '@/components/animations/MotionVariants'

/**
 * 仪表盘页面
 * 展示系统关键数据和统计信息
 */
const Dashboard: React.FC = () => {
  const [statsLoading, setStatsLoading] = useState(true)
  
  // 模拟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // 销售数据
  const salesData = [
    { month: '1月', sales: 3500 },
    { month: '2月', sales: 4200 },
    { month: '3月', sales: 3800 },
    { month: '4月', sales: 5000 },
    { month: '5月', sales: 4800 },
    { month: '6月', sales: 6000 },
    { month: '7月', sales: 6500 },
    { month: '8月', sales: 5800 },
    { month: '9月', sales: 7200 },
    { month: '10月', sales: 8500 },
    { month: '11月', sales: 9200 },
    { month: '12月', sales: 11000 },
  ]

  // 品类销售数据
  const categoryData = [
    { category: '奶粉', value: 28 },
    { category: '尿布', value: 22 },
    { category: '玩具', value: 15 },
    { category: '辅食', value: 12 },
    { category: '童装', value: 11 },
    { category: '洗护', value: 8 },
    { category: '其它', value: 4 },
  ]

  // 流量来源数据
  const trafficData = [
    { type: '直接访问', value: 35 },
    { type: '搜索引擎', value: 30 },
    { type: '社交媒体', value: 20 },
    { type: '外部链接', value: 10 },
    { type: '其他', value: 5 },
  ]

  // 近期订单数据
  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '商品',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatPrice(amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = ''
        switch (status) {
          case '已付款':
            color = 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300'
            break
          case '已发货':
            color = 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
            break
          case '已完成':
            color = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            break
          case '已取消':
            color = 'bg-danger-100 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300'
            break
          default:
            color = 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        )
      },
    },
  ]

  const orderData = [
    {
      key: '1',
      id: 'ORD-20230001',
      customer: '张小姐',
      product: '婴儿奶粉套装',
      amount: 568,
      status: '已付款',
    },
    {
      key: '2',
      id: 'ORD-20230002',
      customer: '王先生',
      product: '婴儿推车',
      amount: 1299,
      status: '已发货',
    },
    {
      key: '3',
      id: 'ORD-20230003',
      customer: '李女士',
      product: '尿不湿纸尿裤',
      amount: 298,
      status: '已完成',
    },
    {
      key: '4',
      id: 'ORD-20230004',
      customer: '赵先生',
      product: '婴儿玩具套装',
      amount: 458,
      status: '已付款',
    },
    {
      key: '5',
      id: 'ORD-20230005',
      customer: '孙女士',
      product: '儿童餐椅',
      amount: 899,
      status: '已取消',
    },
  ]

  // 销售趋势图配置
  const salesConfig = {
    data: salesData,
    xField: 'month',
    yField: 'sales',
    smooth: true,
    color: '#3182ff',
    point: {
      size: 4,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#3182ff',
        lineWidth: 2,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '销售额', value: formatPrice(datum.sales) }
      },
    },
    areaStyle: {
      fill: 'l(270) 0:#3182ff20 1:#3182ff00',
    },
  }

  // 品类销售图配置
  const categoryConfig = {
    data: categoryData,
    xField: 'value',
    yField: 'category',
    seriesField: 'category',
    legend: {
      position: 'bottom',
    },
    barBackground: {
      style: {
        fill: 'rgba(0, 0, 0, 0.05)',
      },
    },
    colorField: 'category',
    color: ['#3182ff', '#4e6fff', '#60a5fa', '#7dd3fc', '#93c5fd', '#c7d2fe', '#ddd6fe'],
  }

  // 流量来源图配置
  const trafficConfig = {
    data: trafficData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    color: ['#3182ff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'],
    legend: {
      position: 'bottom',
    },
  }

  // 统计卡片数据
  const statCards = [
    {
      title: '今日销售额',
      value: 12680,
      prefix: <DollarOutlined />,
      suffix: '元',
      color: '#3182ff',
      formatter: (value: number) => `¥ ${formatNumber(value)}`,
      change: {
        type: 'increase',
        value: '12.5%',
        text: '较昨日增长'
      },
      gradient: ['from-primary-500', 'to-primary-600'],
      icon: <DollarOutlined className="text-2xl" />,
    },
    {
      title: '今日订单数',
      value: 186,
      prefix: <ShoppingCartOutlined />,
      suffix: '笔',
      color: '#22c55e',
      change: {
        type: 'increase',
        value: '8.2%',
        text: '较昨日增长'
      },
      gradient: ['from-success-500', 'to-success-600'],
      icon: <ShoppingCartOutlined className="text-2xl" />,
    },
    {
      title: '产品销量',
      value: 352,
      prefix: <ShoppingOutlined />,
      suffix: '件',
      color: '#f59e0b',
      change: {
        type: 'increase',
        value: '5.3%',
        text: '较昨日增长'
      },
      gradient: ['from-warning-500', 'to-warning-600'],
      icon: <ShoppingOutlined className="text-2xl" />,
    },
    {
      title: '新增用户',
      value: 28,
      prefix: <UserOutlined />,
      suffix: '人',
      color: '#a855f7',
      change: {
        type: 'decrease',
        value: '2.1%',
        text: '较昨日下降'
      },
      gradient: ['from-purple-500', 'to-purple-600'],
      icon: <UserOutlined className="text-2xl" />,
    },
  ]

  // 渲染统计卡片
  const renderStatCard = (stat: any, index: number) => {
    const { title, value, color, change, formatter, gradient, icon } = stat;
    
    return (
      <Col xs={24} sm={12} md={6} key={index}>
        <motion.div 
          variants={slideUpAnimation}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          whileTap={{ y: 0, transition: { duration: 0.2 } }}
        >
          <Card 
            hoverable 
            glass 
            className="h-full overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
                <div className="mt-2 text-2xl font-bold" style={{ color }}>
                  {formatter ? formatter(value) : value}
                  <span className="text-sm font-normal ml-1">{stat.suffix}</span>
                </div>
                
                <div className="mt-2 text-xs flex items-center">
                  {change.type === 'increase' ? (
                    <RiseOutlined className="text-success-500 mr-1" />
                  ) : (
                    <ArrowDownOutlined className="text-danger-500 mr-1" />
                  )}
                  <span className={change.type === 'increase' ? 'text-success-500' : 'text-danger-500'}>
                    {change.value}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {change.text}
                  </span>
                </div>
              </div>
              
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient[0]} ${gradient[1]} flex items-center justify-center text-white`}>
                {icon}
              </div>
            </div>
            
            <div className="mt-4 -mx-6 -mb-6 pb-1">
              <div className="h-1 bg-gradient-to-r from-white/5 via-white/10 to-transparent dark:from-gray-700/30 dark:via-gray-700/20 dark:to-transparent"></div>
              <div className="flex justify-between px-6 pt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">今日目标</div>
                <div className="text-xs font-medium">
                  {Math.floor(Math.random() * 30) + 70}%
                </div>
              </div>
              <div className="px-6 pt-1">
                <Progress 
                  percent={Math.floor(Math.random() * 30) + 70} 
                  showInfo={false}
                  strokeColor={color}
                  size="small"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>
    );
  };

  return (
    <div className="p-1">
      <motion.div 
        variants={staggerContainerAnimation}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* 页面标题 */}
        <MotionWrapper 
          animation="slideDown"
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <FireOutlined className="mr-2 text-primary-500" /> 仪表盘
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              欢迎回来，这是您的业务概览
            </p>
          </div>
          <DatePicker.RangePicker 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
          />
        </MotionWrapper>

        {/* 数据卡片区域 */}
        <MotionWrapper staggerChildren={true} staggerDelay={0.1}>
          <Row gutter={[16, 16]}>
            {statCards.map(renderStatCard)}
          </Row>
        </MotionWrapper>

        {/* 图表区域 */}
        <MotionWrapper animation="fade" delay={0.2}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title="销售趋势"
                glass
                extra={
                  <Button 
                    variant="glass" 
                    size="sm"
                  >
                    查看详情
                  </Button>
                }
                className="h-full"
              >
                <div className="h-80">
                  <Line {...salesConfig} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title="销售品类分布"
                glass
                className="h-full"
              >
                <div className="h-80">
                  <Bar {...categoryConfig} />
                </div>
              </Card>
            </Col>
          </Row>
        </MotionWrapper>

        {/* 数据表格和环形图 */}
        <MotionWrapper animation="fade" delay={0.3}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title="最近订单"
                glass
                extra={
                  <Button 
                    variant="glass" 
                    size="sm"
                  >
                    查看全部
                  </Button>
                }
              >
                <Table 
                  columns={orderColumns}
                  dataSource={orderData}
                  pagination={false}
                  className="custom-table"
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title="流量来源"
                glass
                className="h-full"
              >
                <div className="h-80 flex items-center justify-center">
                  <Pie {...trafficConfig} />
                </div>
              </Card>
            </Col>
          </Row>
        </MotionWrapper>
      </motion.div>
    </div>
  )
}

export default Dashboard 