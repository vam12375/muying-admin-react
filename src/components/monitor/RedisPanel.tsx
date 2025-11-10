import React, { memo } from 'react';
import { Card, Row, Col, Space, Progress, Tag, Tooltip } from 'antd';
import { ThunderboltOutlined, DatabaseOutlined, ApiOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

interface RedisPanelProps {
  metrics: {
    status: string;
    version: string;
    connectedClients: number;
    usedMemory: number;
    usedMemoryHuman: string;
    memFragmentationRatio: number;
    totalCommandsProcessed: number;
    opsPerSec: number;
    keyspaceHits: number;
    keyspaceMisses: number;
    hitRate: number;
    totalKeys: number;
    expiredKeys: number;
    evictedKeys: number;
  };
  viewMode: 'overview' | 'detailed';
}

/**
 * Redis 监控面板
 */
const RedisPanel: React.FC<RedisPanelProps> = memo(({ metrics, viewMode }) => {
  // 数字动画
  const animatedOps = useCountUp({ end: metrics.opsPerSec, duration: 1000 });
  const animatedKeys = useCountUp({ end: metrics.totalKeys, duration: 1500 });
  const animatedClients = useCountUp({ end: metrics.connectedClients, duration: 1000 });

  // 状态颜色
  const statusColor = metrics.status === 'UP' ? '#52c41a' : '#ff4d4f';
  const hitRateColor = metrics.hitRate > 90 ? '#52c41a' : 
                       metrics.hitRate > 70 ? '#faad14' : '#ff4d4f';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Card 
        className="glass-card redis-panel"
        style={{ height: '100%' }}
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
            <span>Redis 监控</span>
            <Tag color={statusColor} style={{ marginLeft: 8 }}>
              {metrics.status}
            </Tag>
            <Tag color="purple">v{metrics.version}</Tag>
          </Space>
        }
      >
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {/* 关键指标 */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="stat-box"
                style={{
                  padding: 16,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: 12,
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(250, 112, 154, 0.3)'
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
                  每秒操作数
                </div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                  {animatedOps}
                  <span style={{ fontSize: 14, opacity: 0.8, marginLeft: 4 }}>ops/s</span>
                </div>
              </motion.div>
            </Col>
            <Col span={12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="stat-box"
                style={{
                  padding: 16,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: 12,
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(79, 172, 254, 0.3)'
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
                  总键数
                </div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>
                  {animatedKeys}
                </div>
              </motion.div>
            </Col>
          </Row>

          {/* 缓存命中率 */}
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>缓存命中率</span>
              <Tooltip title={`命中: ${metrics.keyspaceHits} | 未命中: ${metrics.keyspaceMisses}`}>
                <span style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: hitRateColor,
                  cursor: 'pointer'
                }}>
                  {metrics.hitRate.toFixed(2)}%
                </span>
              </Tooltip>
            </Space>
            <Progress
              percent={metrics.hitRate}
              strokeColor={{
                '0%': hitRateColor,
                '100%': `${hitRateColor}88`
              }}
              strokeWidth={12}
              strokeLinecap="round"
              trailColor="rgba(0, 0, 0, 0.06)"
              status={metrics.hitRate > 90 ? 'success' : metrics.hitRate > 70 ? 'normal' : 'exception'}
            />
          </div>

          {/* 详细统计 */}
          <Row gutter={[12, 12]}>
            <Col span={8}>
              <div className="mini-stat">
                <ApiOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>连接数</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {animatedClients}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="mini-stat">
                <DatabaseOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>内存使用</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {metrics.usedMemoryHuman}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="mini-stat">
                <ClockCircleOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>碎片率</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {metrics.memFragmentationRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* 命令处理统计 */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              padding: 16,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: 12,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              总命令处理数
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
              {metrics.totalCommandsProcessed.toLocaleString()}
            </div>
          </motion.div>

          {/* 键统计详情 */}
          {viewMode === 'detailed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <div 
                    style={{
                      padding: 12,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 10,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      缓存命中
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                      {metrics.keyspaceHits.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div 
                    style={{
                      padding: 12,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 10,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      未命中
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f' }}>
                      {metrics.keyspaceMisses.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div 
                    style={{
                      padding: 12,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 10,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      过期键
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#faad14' }}>
                      {metrics.expiredKeys.toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
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

RedisPanel.displayName = 'RedisPanel';

export default RedisPanel;

