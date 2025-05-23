import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Select, DatePicker } from 'antd'
import { ShoppingOutlined, RiseOutlined, FallOutlined, DollarOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// 模拟数据
interface AnalysisData {
  totalProducts: number
  newProducts: number
  outOfStock: number
  totalSales: number
  topCategories: { name: string, count: number }[]
  topBrands: { name: string, count: number }[]
}

const mockData: AnalysisData = {
  totalProducts: 386,
  newProducts: 24,
  outOfStock: 8,
  totalSales: 126800,
  topCategories: [
    { name: '奶粉', count: 86 },
    { name: '纸尿裤', count: 72 },
    { name: '洗护', count: 65 },
    { name: '玩具', count: 58 },
    { name: '童车', count: 45 }
  ],
  topBrands: [
    { name: '美素佳儿', count: 32 },
    { name: '帮宝适', count: 28 },
    { name: '好孩子', count: 25 },
    { name: '强生', count: 22 },
    { name: '费雪', count: 18 }
  ]
}

const ProductAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalysisData | null>(null)
  const [timeRange, setTimeRange] = useState<string>('week')
  
  useEffect(() => {
    // 模拟API请求
    const timer = setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleRangeChange = (value: string) => {
    setTimeRange(value)
    setLoading(true)
    
    // 模拟API请求
    setTimeout(() => {
      // 根据不同的时间范围，可以返回不同的数据
      setData(mockData)
      setLoading(false)
    }, 1000)
  }
  
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setLoading(true)
      
      // 模拟API请求
      setTimeout(() => {
        // 根据选择的日期范围，可以返回不同的数据
        setData(mockData)
        setLoading(false)
      }, 1000)
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
          >
            <Option value="today">今天</Option>
            <Option value="week">本周</Option>
            <Option value="month">本月</Option>
            <Option value="year">本年</Option>
          </Select>
          
          <RangePicker onChange={handleDateRangeChange} />
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
              suffix={`/ ${timeRange === 'week' ? '周' : timeRange === 'month' ? '月' : timeRange === 'year' ? '年' : '日'}`}
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
            {data?.topCategories.map((category, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{category.name}</span>
                <span>{category.count} 件商品</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="热门品牌" 
            loading={loading}
          >
            {data?.topBrands.map((brand, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{brand.name}</span>
                <span>{brand.count} 件商品</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProductAnalysis 