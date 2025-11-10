import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Button,
  Space,
  Typography,
  Spin,
  Progress,
  Table,
  Tag,
  Tooltip,
  Alert
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  GiftOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockTrendData = [
  { date: '2024-01-01', issued: 120, received: 98, used: 45 },
  { date: '2024-01-02', issued: 150, received: 132, used: 67 },
  { date: '2024-01-03', issued: 180, received: 156, used: 89 },
  { date: '2024-01-04', issued: 200, received: 178, used: 112 },
  { date: '2024-01-05', issued: 160, received: 145, used: 98 },
  { date: '2024-01-06', issued: 220, received: 198, used: 134 },
  { date: '2024-01-07', issued: 190, received: 167, used: 123 }
];

const mockTypeData = [
  { name: '固定金额', value: 65, color: '#1890ff' },
  { name: '折扣比例', value: 35, color: '#52c41a' }
];

const mockStatusData = [
  { name: '生效中', value: 45, color: '#52c41a' },
  { name: '未生效', value: 25, color: '#faad14' },
  { name: '已过期', value: 30, color: '#f5222d' }
];

const CouponStatistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [timeType, setTimeType] = useState('day');

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 导出报表
  const exportReport = () => {
    // 模拟导出
    console.log('导出统计报表');
  };

  const topCoupons = [
    { id: 1, name: '新用户专享券', received: 1234, used: 567, rate: 46 },
    { id: 2, name: '满100减15', received: 987, used: 432, rate: 44 },
    { id: 3, name: '9.5折优惠券', received: 756, used: 298, rate: 39 },
    { id: 4, name: '满200减30', received: 654, used: 234, rate: 36 },
    { id: 5, name: '限时特惠券', received: 543, used: 187, rate: 34 }
  ];

  const columns = [
    {
      title: '排名',
      dataIndex: 'id',
      key: 'rank',
      width: 60,
      render: (_, __, index: number) => (
        <div style={{ textAlign: 'center' }}>
          {index < 3 ? (
            <TrophyOutlined style={{ 
              color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
              fontSize: '16px'
            }} />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      )
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '领取数量',
      dataIndex: 'received',
      key: 'received',
      render: (value: number) => value.toLocaleString()
    },
    {
      title: '使用数量',
      dataIndex: 'used',
      key: 'used',
      render: (value: number) => value.toLocaleString()
    },
    {
      title: '使用率',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => (
        <div>
          <Progress 
            percent={rate} 
            size="small" 
            status={rate > 40 ? 'success' : rate > 30 ? 'normal' : 'exception'}
          />
          <Text style={{ fontSize: '12px' }}>{rate}%</Text>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        {/* 页面头部 */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>优惠券统计分析</Title>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: 240 }}
            />
            <Select value={timeType} onChange={setTimeType} style={{ width: 100 }}>
              <Option value="day">按天</Option>
              <Option value="week">按周</Option>
              <Option value="month">按月</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportReport}>
              导出报表
            </Button>
          </Space>
        </div>

        {/* 核心指标 */}
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总发行量"
                value={12580}
                suffix="张"
                valueStyle={{ color: '#1890ff' }}
                prefix={<GiftOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <RiseOutlined style={{ color: '#52c41a' }} /> 较昨日 +12.5%
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总领取量"
                value={9876}
                suffix="张"
                valueStyle={{ color: '#52c41a' }}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <RiseOutlined style={{ color: '#52c41a' }} /> 较昨日 +8.3%
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总使用量"
                value={4321}
                suffix="张"
                valueStyle={{ color: '#faad14' }}
                prefix={<ShoppingCartOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <FallOutlined style={{ color: '#f5222d' }} /> 较昨日 -2.1%
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="核销金额"
                value={156789}
                suffix="元"
                valueStyle={{ color: '#f5222d' }}
                prefix={<DollarOutlined />}
                precision={2}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <RiseOutlined style={{ color: '#52c41a' }} /> 较昨日 +15.7%
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          {/* 趋势图 */}
          <Col span={16}>
            <Card title={<><LineChartOutlined /> 优惠券使用趋势</>}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="issued" stroke="#1890ff" name="发行量" />
                  <Line type="monotone" dataKey="received" stroke="#52c41a" name="领取量" />
                  <Line type="monotone" dataKey="used" stroke="#faad14" name="使用量" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          {/* 类型分布 */}
          <Col span={8}>
            <Card title={<><PieChartOutlined /> 优惠券类型分布</>}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 状态分布和热门优惠券 */}
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          {/* 状态分布 */}
          <Col span={8}>
            <Card title={<><BarChartOutlined /> 优惠券状态分布</>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#1890ff">
                    {mockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 热门优惠券排行 */}
          <Col span={16}>
            <Card title={<><TrophyOutlined /> 热门优惠券排行榜</>}>
              <Table
                dataSource={topCoupons}
                columns={columns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>

        {/* 使用率分析 */}
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Card title="使用率分析">
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message="使用率统计"
                  description="基于最近30天的数据统计，帮助优化优惠券策略"
                  type="info"
                  showIcon
                />
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Progress
                      type="circle"
                      percent={78}
                      format={() => '78%'}
                      strokeColor="#52c41a"
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>整体使用率</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Progress
                      type="circle"
                      percent={65}
                      format={() => '65%'}
                      strokeColor="#1890ff"
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>领取率</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Progress
                      type="circle"
                      percent={43}
                      format={() => '43%'}
                      strokeColor="#faad14"
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>转化率</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 时段分析 */}
          <Col span={12}>
            <Card title="使用时段分析">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={[
                  { hour: '00:00', count: 12 },
                  { hour: '02:00', count: 8 },
                  { hour: '04:00', count: 5 },
                  { hour: '06:00', count: 15 },
                  { hour: '08:00', count: 45 },
                  { hour: '10:00', count: 78 },
                  { hour: '12:00', count: 95 },
                  { hour: '14:00', count: 87 },
                  { hour: '16:00', count: 92 },
                  { hour: '18:00', count: 105 },
                  { hour: '20:00', count: 125 },
                  { hour: '22:00', count: 89 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="count" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 详细数据表格 */}
        <Card title="详细统计数据">
          <Table
            dataSource={[
              {
                key: '1',
                date: '2024-01-07',
                issued: 220,
                received: 198,
                used: 134,
                receivedRate: 90,
                usedRate: 68,
                amount: 15678
              },
              {
                key: '2',
                date: '2024-01-06',
                issued: 190,
                received: 167,
                used: 123,
                receivedRate: 88,
                usedRate: 74,
                amount: 14523
              },
              {
                key: '3',
                date: '2024-01-05',
                issued: 160,
                received: 145,
                used: 98,
                receivedRate: 91,
                usedRate: 68,
                amount: 12456
              }
            ]}
            columns={[
              {
                title: '日期',
                dataIndex: 'date',
                key: 'date',
                render: (date: string) => (
                  <Text>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {date}
                  </Text>
                )
              },
              {
                title: '发行量',
                dataIndex: 'issued',
                key: 'issued',
                render: (value: number) => value.toLocaleString()
              },
              {
                title: '领取量',
                dataIndex: 'received',
                key: 'received',
                render: (value: number) => value.toLocaleString()
              },
              {
                title: '使用量',
                dataIndex: 'used',
                key: 'used',
                render: (value: number) => value.toLocaleString()
              },
              {
                title: '领取率',
                dataIndex: 'receivedRate',
                key: 'receivedRate',
                render: (rate: number) => (
                  <Tag color={rate > 85 ? 'green' : rate > 70 ? 'orange' : 'red'}>
                    {rate}%
                  </Tag>
                )
              },
              {
                title: '使用率',
                dataIndex: 'usedRate',
                key: 'usedRate',
                render: (rate: number) => (
                  <Tag color={rate > 70 ? 'green' : rate > 50 ? 'orange' : 'red'}>
                    {rate}%
                  </Tag>
                )
              },
              {
                title: '核销金额',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount: number) => `¥${amount.toLocaleString()}`
              }
            ]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default CouponStatistics;
