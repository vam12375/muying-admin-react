import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, Progress, Tooltip, Table, DatePicker, Spin, message } from 'antd'
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
import { useDispatch, useSelector } from 'react-redux'
import { fetchRecentOrders } from '@/store/slices/orderSlice'
import { RootState } from '@/store'
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
  const dispatch = useDispatch();
  const { recentOrders, loading, error } = useSelector((state: RootState) => state.order);
  const [statsLoading, setStatsLoading] = useState(true);
  const [localOrders, setLocalOrders] = useState<any[]>([]); // 用于存储本地备份订单数据
  
  // 模拟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // 备用订单数据（当API调用失败时使用）
  const fallbackOrderData = [
    {
      key: '1',
      orderNo: 'ORD-20230001',
      customerName: '张小姐',
      productName: '婴儿奶粉套装',
      totalAmount: 568,
      statusText: '已付款',
    },
    {
      key: '2',
      orderNo: 'ORD-20230002',
      customerName: '王先生',
      productName: '婴儿推车',
      totalAmount: 1299,
      statusText: '已发货',
    },
    {
      key: '3',
      orderNo: 'ORD-20230003',
      customerName: '李女士',
      productName: '尿不湿纸尿裤',
      totalAmount: 298,
      statusText: '已完成',
    },
    {
      key: '4',
      orderNo: 'ORD-20230004',
      customerName: '赵先生',
      productName: '婴儿玩具套装',
      totalAmount: 458,
      statusText: '已付款',
    },
    {
      key: '5',
      orderNo: 'ORD-20230005',
      customerName: '孙女士',
      productName: '儿童餐椅',
      totalAmount: 899,
      statusText: '已取消',
    },
  ];

  // 获取最近订单数据并处理错误
  useEffect(() => {
    dispatch(fetchRecentOrders(5) as any);
  }, [dispatch]);

  // 处理API错误，使用备用数据
  useEffect(() => {
    if (error) {
      console.error('获取最近订单失败:', error);
      message.error('获取最近订单数据失败，显示默认数据');
      setLocalOrders(fallbackOrderData);
    } else if (recentOrders && recentOrders.length > 0) {
      // 将API返回的数据映射到表格需要的结构
      const mappedOrders = recentOrders.map(order => {
        // 打印一条原始订单对象，帮助调试数据结构
        console.log('Original order data:', order);
        
        // 获取用户昵称
        let userNickname = '未知用户';
        if (order.user) {
          userNickname = order.user.nickname || order.user.userName || order.user.name || `用户${order.user.id}`;
        } else if (order.customer) {
          userNickname = order.customer.nickname || order.customer.userName || order.customer.name || `用户${order.customer.id}`;
        } else if (order.buyerName) {
          userNickname = order.buyerName;
        } else if (order.userId) {
          userNickname = `用户${order.userId}`;
        }
        
        // 根据实际返回的数据结构进行映射
        return {
          orderNo: order.orderNo || order.id || order.orderId || '',
          customerName: userNickname,
          productName: order.productName || order.itemName || order.productTitle || '多个商品',
          totalAmount: order.totalAmount || order.amount || order.orderAmount || 0,
          statusText: mapOrderStatus(order.statusText || order.status || order.statusCode) || '处理中'
        };
      });
      setLocalOrders(mappedOrders);
    } else if (!loading) {
      // 如果没有错误但数据为空，也使用备用数据
      setLocalOrders(fallbackOrderData);
    }
  }, [error, recentOrders, loading]);

  // 订单状态码映射函数
  const mapOrderStatus = (statusCode?: number | string): string => {
    if (!statusCode) return '处理中';
    
    // 如果是数字状态码，按数字映射
    if (typeof statusCode === 'number' || !isNaN(Number(statusCode))) {
      switch(Number(statusCode)) {
        case 1: return '待付款';
        case 2: return '已付款';
        case 3: return '已发货';
        case 4: return '已完成';
        case 5: return '已取消';
        case 6: return '已退款';
        default: return '处理中';
      }
    }
    
    // 如果是英文状态，映射到中文
    switch(statusCode.toLowerCase()) {
      case 'pending': 
      case 'unpaid': 
      case 'waiting for payment': return '待付款';
      
      case 'paid':
      case 'payment completed': return '已付款';
      
      case 'shipped':
      case 'delivering': return '已发货';
      
      case 'completed':
      case 'finished':
      case 'done': return '已完成';
      
      case 'cancelled':
      case 'canceled': return '已取消';
      
      case 'refunded':
      case 'refund completed': return '已退款';
      
      default: return statusCode; // 如果没有匹配项，保留原始状态
    }
  }

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

  // 近期订单数据（从Redux获取）
  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户信息',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: string) => (
        <span>
          {customer}
        </span>
      )
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
        // 调试状态值
        console.log('Rendering status:', status);
        
        let color = ''
        switch (status) {
          case '待付款':
            color = 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
            break
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
          case '已退款':
            color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
            break
          default:
            color = 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status || '处理中'}
          </span>
        )
      },
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
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table 
                    columns={orderColumns}
                    dataSource={localOrders.map((order, index) => ({
                      key: index.toString(),
                      id: order.orderNo,
                      customer: order.customerName,
                      product: order.productName,
                      amount: order.totalAmount,
                      status: order.statusText
                    }))}
                    pagination={false}
                    className="custom-table"
                  />
                )}
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