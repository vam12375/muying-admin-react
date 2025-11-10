import React, { memo, useMemo } from 'react';
import { Card, Row, Col, Space, Progress, Table, Tag } from 'antd';
import { DatabaseOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

interface DatabasePanelProps {
  metrics: {
    status: string;
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    connectionUsage: number;
    totalQueries: number;
    slowQueries: number;
    avgQueryTime: number;
    databaseSize: number;
    tableSizes: { [key: string]: number };
  };
  viewMode: 'overview' | 'detailed';
}

/**
 * 数据库监控面板
 */
const DatabasePanel: React.FC<DatabasePanelProps> = memo(({ metrics, viewMode }) => {
  // 格式化字节
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 数字动画
  const animatedConnections = useCountUp({ end: metrics.activeConnections, duration: 1000 });
  const animatedQueries = useCountUp({ end: metrics.totalQueries, duration: 1500 });
  const animatedSlowQueries = useCountUp({ end: metrics.slowQueries, duration: 1500 });

  // 状态颜色
  const statusColor = metrics.status === 'UP' ? '#52c41a' : '#ff4d4f';
  const connectionUsageColor = metrics.connectionUsage > 80 ? '#ff4d4f' : 
                                metrics.connectionUsage > 60 ? '#faad14' : '#52c41a';

  // 表格数据
  const tableData = useMemo(() => {
    return Object.entries(metrics.tableSizes || {})
      .map(([name, size]) => ({ key: name, name, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  }, [metrics.tableSizes]);

  const tableColumns = [
    { 
      title: '表名', 
      dataIndex: 'name', 
      key: 'name',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{text}</span>
      )
    },
    { 
      title: '大小', 
      dataIndex: 'size', 
      key: 'size',
      align: 'right' as const,
      render: (size: number) => (
        <Tag color="blue">{formatBytes(size)}</Tag>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Card 
        className="glass-card database-panel"
        style={{ height: '100%' }}
        title={
          <Space>
            <DatabaseOutlined style={{ color: '#1890ff' }} />
            <span>数据库监控</span>
            <Tag color={statusColor} style={{ marginLeft: 8 }}>
              {metrics.status}
            </Tag>
          </Space>
        }
      >
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {/* 连接统计 */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="stat-box"
                style={{
                  padding: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 12,
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>活跃连接</div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                  {animatedConnections}
                  <span style={{ fontSize: 14, opacity: 0.8, marginLeft: 4 }}>
                    / {metrics.maxConnections}
                  </span>
                </div>
              </motion.div>
            </Col>
            <Col span={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="stat-box"
                style={{
                  padding: 16,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: 12,
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)'
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>空闲连接</div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                  {metrics.idleConnections}
                </div>
              </motion.div>
            </Col>
          </Row>

          {/* 连接使用率 */}
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>连接使用率</span>
              <span style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: connectionUsageColor 
              }}>
                {metrics.connectionUsage.toFixed(2)}%
              </span>
            </Space>
            <Progress
              percent={metrics.connectionUsage}
              strokeColor={{
                '0%': connectionUsageColor,
                '100%': `${connectionUsageColor}88`
              }}
              strokeWidth={12}
              strokeLinecap="round"
              trailColor="rgba(0, 0, 0, 0.06)"
            />
          </div>

          {/* 查询统计 */}
          <Row gutter={[12, 12]}>
            <Col span={8}>
              <div className="mini-stat">
                <ThunderboltOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>总查询</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {animatedQueries}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="mini-stat">
                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>慢查询</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {animatedSlowQueries}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="mini-stat">
                <DatabaseOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>平均耗时</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {metrics.avgQueryTime.toFixed(1)}
                    <span style={{ fontSize: 11, marginLeft: 2 }}>ms</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* 数据库大小 */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              padding: 16,
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: 12,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>数据库总大小</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
              {formatBytes(metrics.databaseSize)}
            </div>
          </motion.div>

          {/* 表大小统计 */}
          {viewMode === 'detailed' && tableData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                表大小 Top 10
              </div>
              <Table
                columns={tableColumns}
                dataSource={tableData}
                pagination={false}
                size="small"
                scroll={{ y: 200 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: 8
                }}
              />
            </motion.div>
          )}
        </Space>

        <style>{`
          .mini-stat {
            padding: 12px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          .mini-stat:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </Card>
    </motion.div>
  );
});

DatabasePanel.displayName = 'DatabasePanel';

export default DatabasePanel;

