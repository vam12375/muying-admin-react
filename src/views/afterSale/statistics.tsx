import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, DatePicker, Button, Space, Table, 
  Divider, Spin, Select, Empty, message 
} from 'antd';
import { 
  ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, 
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { getRefundStatistics } from '@/api/afterSale';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 类型定义
interface StatisticsData {
  totalRefund: number;
  pendingReview: number;
  processing: number;
  completed: number;
  rejected: number;
  failed: number;
  totalAmount: number;
  refundRatio: number;
  compareLastMonth: {
    totalRefund: number;
    totalAmount: number;
    ratio: number;
  };
  statusDistribution: {
    status: string;
    count: number;
  }[];
  dailyStatistics: {
    date: string;
    count: number;
    amount: number;
  }[];
  reasonStatistics: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

const RefundStatistics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [timeType, setTimeType] = useState<string>('month');
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalRefund: 0,
    pendingReview: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    failed: 0,
    totalAmount: 0,
    refundRatio: 0,
    compareLastMonth: {
      totalRefund: 0,
      totalAmount: 0,
      ratio: 0,
    },
    statusDistribution: [],
    dailyStatistics: [],
    reasonStatistics: []
  });

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 日期范围格式化
      const startTime = dateRange[0].format('YYYY-MM-DD');
      const endTime = dateRange[1].format('YYYY-MM-DD');
      
      const response = await getRefundStatistics(startTime, endTime);
      
      if (response && response.data) {
        setStatistics(response.data);
      } else {
        message.error('获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  // 处理时间类型变化
  const handleTimeTypeChange = (value: string) => {
    setTimeType(value);
    
    // 根据选择的时间类型设置日期范围
    if (value === 'week') {
      setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
    } else if (value === 'month') {
      setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
    } else if (value === 'quarter') {
      setDateRange([dayjs().subtract(90, 'day'), dayjs()]);
    } else if (value === 'year') {
      setDateRange([dayjs().subtract(365, 'day'), dayjs()]);
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    fetchStatistics();
  };

  // 初始加载
  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  // 退款状态分布图表配置
  const statusConfig = {
    data: statistics.statusDistribution,
    xField: 'status',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      status: { alias: '状态' },
      count: { alias: '数量' },
    },
    color: ({ status }: { status: string }) => {
      const colorMap: Record<string, string> = {
        '待审核': '#faad14',
        '已批准': '#1890ff',
        '已拒绝': '#ff4d4f',
        '处理中': '#13c2c2',
        '已完成': '#52c41a',
        '失败': '#f5222d',
      };
      return colorMap[status] || '#5B8FF9';
    },
  };

  // 退款原因分布图表配置
  const reasonConfig = {
    data: statistics.reasonStatistics,
    angleField: 'percentage',
    colorField: 'reason',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}: {percentage}%',
    },
    interactions: [{ type: 'element-active' }],
  };

  // 每日退款数量和金额图表配置
  const dailyConfig = {
    data: statistics.dailyStatistics,
    xField: 'date',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      date: { alias: '日期' },
      count: { alias: '数量' },
    },
  };

  // 退款原因表格列
  const reasonColumns = [
    {
      title: '退款原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
      sorter: (a: any, b: any) => a.percentage - b.percentage,
    },
  ];

  // 每日统计表格列
  const dailyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '退款数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
  ];

  return (
    <div className="refund-statistics-page">
      <Card>
        <div className="filter-bar" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Space>
                <span>时间范围：</span>
                <Select 
                  value={timeType} 
                  onChange={handleTimeTypeChange}
                  style={{ width: '120px' }}
                >
                  <Option value="week">最近一周</Option>
                  <Option value="month">最近一个月</Option>
                  <Option value="quarter">最近三个月</Option>
                  <Option value="year">最近一年</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Space>
            </Col>
            <Col span={12}>
              {timeType === 'custom' && (
                <RangePicker 
                  value={dateRange} 
                  onChange={handleDateRangeChange} 
                  style={{ width: '100%' }}
                />
              )}
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                刷新数据
              </Button>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          <div className="statistics-overview">
            <Row gutter={16}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="退款总数"
                    value={statistics.totalRefund}
                    prefix={<QuestionCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="待审核"
                    value={statistics.pendingReview}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="已完成"
                    value={statistics.completed}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="已拒绝"
                    value={statistics.rejected}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="退款总额"
                    value={statistics.totalAmount}
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                    prefix="¥"
                    suffix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="环比变化"
                    value={statistics.compareLastMonth?.ratio || 0}
                    precision={2}
                    valueStyle={{ 
                      color: (statistics.compareLastMonth?.ratio || 0) > 0 ? '#cf1322' : '#3f8600' 
                    }}
                    prefix={(statistics.compareLastMonth?.ratio || 0) > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="退款状态分布">
                {statistics.statusDistribution && statistics.statusDistribution.length > 0 ? (
                  <Column {...statusConfig} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="退款原因分布">
                {statistics.reasonStatistics && statistics.reasonStatistics.length > 0 ? (
                  <Pie {...reasonConfig} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Card title="每日退款统计">
                {statistics.dailyStatistics && statistics.dailyStatistics.length > 0 ? (
                  <Column {...dailyConfig} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="退款原因分析">
                <Table 
                  dataSource={statistics.reasonStatistics} 
                  columns={reasonColumns} 
                  rowKey="reason"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="每日退款详情">
                <Table 
                  dataSource={statistics.dailyStatistics} 
                  columns={dailyColumns} 
                  rowKey="date"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

export default RefundStatistics; 