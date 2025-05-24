import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, DatePicker, Tooltip, Segmented, Empty, Skeleton } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Radar } from '@ant-design/charts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { analyticsApi } from '@/api/analytics';
import type { DashboardSummary, SalesTrend, CategorySales, UserRegion } from '@/api/analytics';
import type { TimeRange } from '@/types/analytics';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AnalyticsDashboard: React.FC = () => {
  // 状态定义
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [userRegions, setUserRegions] = useState<UserRegion[]>([]);
  
  // 加载数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 准备日期参数
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (timeRange === 'custom' && customRange) {
        startDate = customRange[0].format('YYYY-MM-DD');
        endDate = customRange[1].format('YYYY-MM-DD');
      }
      
      // 并行请求数据
      const [summaryResult, trendResult, categoryResult, regionResult] = await Promise.all([
        analyticsApi.getDashboardSummary(timeRange, startDate, endDate),
        analyticsApi.getSalesTrend(timeRange, startDate, endDate),
        analyticsApi.getCategorySales(timeRange),
        analyticsApi.getUserRegions()
      ]);
      
      setSummaryData(summaryResult);
      setSalesTrend(trendResult);
      setCategorySales(categoryResult);
      setUserRegions(regionResult);
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和时间范围变化时重新加载数据
  useEffect(() => {
    loadDashboardData();
  }, [timeRange, customRange]);
  
  // 处理时间范围变化
  const handleTimeRangeChange = (value: TimeRange) => {
    if (value !== 'custom') {
      setTimeRange(value);
      setCustomRange(null);
    }
  };
  
  // 处理自定义日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setTimeRange('custom');
      setCustomRange(dates);
    } else {
      setCustomRange(null);
    }
  };
  
  // 销售趋势图表配置
  const salesTrendConfig = {
    data: salesTrend,
    xField: 'date',
    yField: 'sales',
    meta: {
      sales: {
        alias: '销售额(元)'
      },
      date: {
        alias: '日期'
      }
    },
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '销售额', value: `¥${datum.sales.toFixed(2)}` };
      }
    },
    lineStyle: {
      lineWidth: 3
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2
      }
    },
    color: '#1890ff',
    annotations: [
      {
        type: 'regionFilter',
        start: ['min', 'median'],
        end: ['max', '0'],
        color: 'rgb(0, 128, 255, 0.1)'
      }
    ]
  };
  
  // 订单趋势图表配置
  const orderTrendConfig = {
    data: salesTrend,
    xField: 'date',
    yField: 'orders',
    columnWidthRatio: 0.6,
    meta: {
      orders: {
        alias: '订单数(笔)'
      },
      date: {
        alias: '日期'
      }
    },
    color: '#52c41a',
    label: {
      position: 'top',
      style: {
        fill: '#999',
        opacity: 0.5
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '订单数', value: datum.orders };
      }
    },
    xAxis: {
      label: {
        autoRotate: true
      }
    }
  };
  
  // 分类销售图表配置
  const categorySalesConfig = {
    data: categorySales,
    angleField: 'percentage',
    colorField: 'category',
    radius: 0.8,
    innerRadius: 0.6,
    meta: {
      percentage: {
        formatter: (v: number) => `${v}%`
      }
    },
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}%',
      autoRotate: false,
      style: {
        fill: '#fff',
        fontSize: 14,
        textAlign: 'center'
      }
    },
    statistic: {
      title: {
        content: '分类\n占比'
      },
      content: {
        style: {
          fontSize: '16px'
        }
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.category, value: `${datum.percentage}% (¥${datum.sales.toFixed(2)})` };
      }
    },
    interactions: [{ type: 'element-active' }],
    color: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#fa541c', '#fa8c16']
  };
  
  // 用户地域分布图表配置
  const userRegionConfig = {
    data: userRegions,
    xField: 'region',
    yField: 'percentage',
    meta: {
      percentage: {
        alias: '占比(%)'
      }
    },
    radius: 0.8,
    angleField: 'percentage',
    seriesField: 'region',
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.region, value: `${datum.percentage}% (${datum.users}人)` };
      }
    },
    interactions: [{ type: 'element-highlight' }],
    color: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#eb2f96']
  };
  
  return (
    <div className="analytics-dashboard">
      {/* 时间范围选择器 */}
      <div className="mb-6 flex justify-end">
        <div className="mr-4">
          <Segmented
            value={timeRange}
            onChange={(value) => handleTimeRangeChange(value as TimeRange)}
            options={[
              { label: '今日', value: 'today' },
              { label: '本周', value: 'week' },
              { label: '本月', value: 'month' },
              { label: '本季度', value: 'quarter' },
              { label: '本年', value: 'year' },
              { label: '自定义', value: 'custom' }
            ]}
          />
        </div>
        
        <RangePicker
          value={customRange}
          onChange={handleDateRangeChange}
          disabled={timeRange !== 'custom'}
        />
      </div>
      
      {/* 统计卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Row gutter={[16, 16]}>
          {/* 销售额 */}
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="销售额"
                value={summaryData?.totalSales || 0}
                precision={2}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
                suffix="元"
              />
              <div className="mt-2">
                <Tooltip title="相比上一时段">
                  <Text type={summaryData?.salesGrowth && summaryData.salesGrowth >= 0 ? 'success' : 'danger'}>
                    {summaryData?.salesGrowth && summaryData.salesGrowth >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {' '}
                    {Math.abs(summaryData?.salesGrowth || 0)}%
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
          
          {/* 订单数 */}
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="订单数"
                value={summaryData?.totalOrders || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ShoppingCartOutlined />}
                suffix="笔"
              />
              <div className="mt-2">
                <Tooltip title="相比上一时段">
                  <Text type={summaryData?.orderGrowth && summaryData.orderGrowth >= 0 ? 'success' : 'danger'}>
                    {summaryData?.orderGrowth && summaryData.orderGrowth >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {' '}
                    {Math.abs(summaryData?.orderGrowth || 0)}%
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
          
          {/* 用户数 */}
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="用户数"
                value={summaryData?.totalUsers || 0}
                valueStyle={{ color: '#722ed1' }}
                prefix={<UserOutlined />}
                suffix="人"
              />
              <div className="mt-2">
                <Tooltip title="相比上一时段">
                  <Text type={summaryData?.userGrowth && summaryData.userGrowth >= 0 ? 'success' : 'danger'}>
                    {summaryData?.userGrowth && summaryData.userGrowth >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {' '}
                    {Math.abs(summaryData?.userGrowth || 0)}%
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
          
          {/* 商品数 */}
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="商品数"
                value={summaryData?.totalProducts || 0}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ShoppingOutlined />}
                suffix="件"
              />
              <div className="mt-2">
                <Tooltip title="相比上一时段">
                  <Text type={summaryData?.productGrowth && summaryData.productGrowth >= 0 ? 'success' : 'danger'}>
                    {summaryData?.productGrowth && summaryData.productGrowth >= 0 ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                    {' '}
                    {Math.abs(summaryData?.productGrowth || 0)}%
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
      
      {/* 图表区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6"
      >
        <Row gutter={[16, 16]}>
          {/* 销售趋势图 */}
          <Col xs={24} lg={12}>
            <Card 
              title="销售趋势" 
              loading={loading}
              className="h-full"
            >
              {salesTrend.length > 0 ? (
                <div className="h-80">
                  <Line {...salesTrendConfig} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </Card>
          </Col>
          
          {/* 订单趋势图 */}
          <Col xs={24} lg={12}>
            <Card 
              title="订单趋势" 
              loading={loading}
              className="h-full"
            >
              {salesTrend.length > 0 ? (
                <div className="h-80">
                  <Column {...orderTrendConfig} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-6"
      >
        <Row gutter={[16, 16]}>
          {/* 分类销售占比图 */}
          <Col xs={24} lg={12}>
            <Card 
              title="分类销售占比" 
              loading={loading}
              className="h-full"
            >
              {categorySales.length > 0 ? (
                <div className="h-80">
                  <Pie {...categorySalesConfig} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </Card>
          </Col>
          
          {/* 用户地域分布图 */}
          <Col xs={24} lg={12}>
            <Card 
              title="用户地域分布" 
              loading={loading}
              className="h-full"
            >
              {userRegions.length > 0 ? (
                <div className="h-80">
                  <Radar {...userRegionConfig} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard; 