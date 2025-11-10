import React, { memo } from 'react';
import { Card, Row, Col, Space, Table, Tag, Tooltip, Progress } from 'antd';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

interface ApiStatisticsPanelProps {
  statistics: {
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    successRate: number;
    avgResponseTime: number;
    requestsByEndpoint: { [key: string]: number };
    requestsByMethod: { [key: string]: number };
    requestsByStatus: { [key: number]: number };
    slowestApis: Array<{
      endpoint: string;
      method: string;
      avgResponseTime: number;
      maxResponseTime: number;
      requestCount: number;
    }>;
    mostFrequentApis: Array<{
      endpoint: string;
      method: string;
      requestCount: number;
      avgResponseTime: number;
    }>;
  };
  viewMode: 'overview' | 'detailed';
}

/**
 * API 统计面板
 */
const ApiStatisticsPanel: React.FC<ApiStatisticsPanelProps> = memo(({ statistics, viewMode }) => {
  // 数字动画
  const animatedTotal = useCountUp({ end: statistics.totalRequests, duration: 1500 });
  const animatedSuccess = useCountUp({ end: statistics.successRequests, duration: 1500 });
  const animatedFailed = useCountUp({ end: statistics.failedRequests, duration: 1500 });

  // 最慢 API 表格
  const slowApiColumns = [
    { 
      title: '端点', 
      dataIndex: 'endpoint', 
      key: 'endpoint',
      width: '40%',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
        </Tooltip>
      )
    },
    { 
      title: '方法', 
      dataIndex: 'method', 
      key: 'method',
      width: '15%',
      render: (method: string) => {
        const colors: { [key: string]: string } = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple'
        };
        return <Tag color={colors[method] || 'default'}>{method}</Tag>;
      }
    },
    { 
      title: '平均响应', 
      dataIndex: 'avgResponseTime', 
      key: 'avgResponseTime',
      width: '20%',
      align: 'right' as const,
      render: (time: number) => (
        <span style={{ 
          color: time > 1000 ? '#ff4d4f' : time > 500 ? '#faad14' : '#52c41a',
          fontWeight: 600
        }}>
          {time.toFixed(0)}ms
        </span>
      )
    },
    { 
      title: '最大响应', 
      dataIndex: 'maxResponseTime', 
      key: 'maxResponseTime',
      width: '15%',
      align: 'right' as const,
      render: (time: number) => <span style={{ fontSize: 12, color: '#999' }}>{time.toFixed(0)}ms</span>
    },
    { 
      title: '请求数', 
      dataIndex: 'requestCount', 
      key: 'requestCount',
      width: '10%',
      align: 'right' as const,
      render: (count: number) => count.toLocaleString()
    }
  ];

  // 最频繁 API 表格
  const frequentApiColumns = [
    { 
      title: '端点', 
      dataIndex: 'endpoint', 
      key: 'endpoint',
      width: '50%',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
        </Tooltip>
      )
    },
    { 
      title: '方法', 
      dataIndex: 'method', 
      key: 'method',
      width: '15%',
      render: (method: string) => {
        const colors: { [key: string]: string } = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple'
        };
        return <Tag color={colors[method] || 'default'}>{method}</Tag>;
      }
    },
    { 
      title: '请求数', 
      dataIndex: 'requestCount', 
      key: 'requestCount',
      width: '20%',
      align: 'right' as const,
      render: (count: number) => (
        <span style={{ fontWeight: 600, fontSize: 14 }}>{count.toLocaleString()}</span>
      )
    },
    { 
      title: '平均响应', 
      dataIndex: 'avgResponseTime', 
      key: 'avgResponseTime',
      width: '15%',
      align: 'right' as const,
      render: (time: number) => (
        <span style={{ fontSize: 12, color: '#999' }}>{time.toFixed(2)}ms</span>
      )
    }
  ];

  // 成功率颜色
  const successRateColor = statistics.successRate > 95 ? '#52c41a' :
                           statistics.successRate > 85 ? '#faad14' : '#ff4d4f';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card 
        className="glass-card api-panel"
        title={
          <Space>
            <ApiOutlined style={{ color: '#722ed1' }} />
            <span>API 调用统计</span>
          </Space>
        }
      >
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* 关键指标 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-box"
                style={{
                  padding: 20,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 16,
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  textAlign: 'center'
                }}
              >
                <ApiOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.9 }} />
                <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>总请求数</div>
                <div style={{ fontSize: 32, fontWeight: 'bold' }}>{animatedTotal}</div>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-box"
                style={{
                  padding: 20,
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: 16,
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(67, 233, 123, 0.3)',
                  textAlign: 'center'
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.9 }} />
                <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>成功请求</div>
                <div style={{ fontSize: 32, fontWeight: 'bold' }}>{animatedSuccess}</div>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="stat-box"
                style={{
                  padding: 20,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: 16,
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(250, 112, 154, 0.3)',
                  textAlign: 'center'
                }}
              >
                <CloseCircleOutlined style={{ fontSize: 32, marginBottom: 12, opacity: 0.9 }} />
                <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>失败请求</div>
                <div style={{ fontSize: 32, fontWeight: 'bold' }}>{animatedFailed}</div>
              </motion.div>
            </Col>
          </Row>

          {/* 成功率和平均响应时间 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>成功率</span>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: successRateColor }}>
                    {statistics.successRate.toFixed(2)}%
                  </span>
                </Space>
                <Progress
                  percent={statistics.successRate}
                  strokeColor={{
                    '0%': successRateColor,
                    '100%': `${successRateColor}88`
                  }}
                  strokeWidth={14}
                  strokeLinecap="round"
                  trailColor="rgba(0, 0, 0, 0.06)"
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: 20,
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  borderRadius: 12,
                  textAlign: 'center'
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  平均响应时间
                </div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>
                  {statistics.avgResponseTime.toFixed(2)}
                  <span style={{ fontSize: 14, marginLeft: 4 }}>ms</span>
                </div>
              </motion.div>
            </Col>
          </Row>

          {/* 详细表格 */}
          {viewMode === 'detailed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* 最慢的 API */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    🐌 最慢的 API (Top 10)
                  </div>
                  <Table
                    columns={slowApiColumns}
                    dataSource={statistics.slowestApis}
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content', y: 250 }}
                    rowKey={(record) => `${record.endpoint}-${record.method}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}
                  />
                </div>

                {/* 最频繁的 API */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    🔥 最频繁的 API (Top 10)
                  </div>
                  <Table
                    columns={frequentApiColumns}
                    dataSource={statistics.mostFrequentApis}
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content', y: 250 }}
                    rowKey={(record) => `${record.endpoint}-${record.method}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}
                  />
                </div>
              </Space>
            </motion.div>
          )}
        </Space>
      </Card>
    </motion.div>
  );
});

ApiStatisticsPanel.displayName = 'ApiStatisticsPanel';

export default ApiStatisticsPanel;

