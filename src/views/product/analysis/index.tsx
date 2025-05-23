import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Select, DatePicker, message } from 'antd'
import { ShoppingOutlined, RiseOutlined, FallOutlined, DollarOutlined } from '@ant-design/icons'
import { productApi } from '@/api/product'
import type { ProductAnalysisData } from '@/api/product'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const ProductAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProductAnalysisData | null>(null)
  const [timeRange, setTimeRange] = useState<string>('week')
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)
  
  // 加载商品分析数据
  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      const analysisData = await productApi.getProductAnalysis(
        timeRange, 
        dateRange ? dateRange[0] : undefined, 
        dateRange ? dateRange[1] : undefined
      )
      setData(analysisData)
    } catch (error: any) {
      message.error(error.message || '获取商品分析数据失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 初始加载数据
  useEffect(() => {
    fetchAnalysisData()
  }, [])
  
  // 处理时间范围变化
  const handleRangeChange = (value: string) => {
    setTimeRange(value)
    setDateRange(null) // 清除自定义日期范围
    
    // 重新获取数据
    setTimeout(() => {
      fetchAnalysisData()
    }, 0)
  }
  
  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      // 将日期格式化为字符串
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD')
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD')
      
      setDateRange([startDate, endDate])
      setTimeRange('custom') // 设置为自定义时间范围
      
      // 重新获取数据
      setTimeout(() => {
        fetchAnalysisData()
      }, 0)
    } else {
      setDateRange(null)
    }
  }
  
  return (
    <div className="product-analysis-container">
      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>商品分析</Title>
        
        <div className="filter-container">
          <Select
            defaultValue="week"
            style={{ width: 120, marginRight: 16 }}
            onChange={handleRangeChange}
            value={timeRange}
          >
            <Option value="today">今天</Option>
            <Option value="week">本周</Option>
            <Option value="month">本月</Option>
            <Option value="year">本年</Option>
            {dateRange && <Option value="custom">自定义</Option>}
          </Select>
          
          <RangePicker 
            onChange={handleDateRangeChange}
            value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
          />
        </div>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="商品总数"
              value={data?.totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="新增商品"
              value={data?.newProducts}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={`/ ${timeRange === 'week' ? '周' : timeRange === 'month' ? '月' : timeRange === 'year' ? '年' : timeRange === 'custom' ? '期间' : '日'}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="缺货商品"
              value={data?.outOfStock}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="销售总额"
              value={data?.totalSales}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>
      
      {/* 热门分类和品牌 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card 
            title="热门分类" 
            loading={loading}
          >
            {data?.topCategories && data.topCategories.length > 0 ? (
              data.topCategories.map((category, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{category.name}</span>
                  <span>{category.count} 件商品</span>
                </div>
              ))
            ) : (
              <div>暂无数据</div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="热门品牌" 
            loading={loading}
          >
            {data?.topBrands && data.topBrands.length > 0 ? (
              data.topBrands.map((brand, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{brand.name}</span>
                  <span>{brand.count} 件商品</span>
                </div>
              ))
            ) : (
              <div>暂无数据</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProductAnalysis 