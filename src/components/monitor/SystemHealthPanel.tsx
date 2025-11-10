import React, { memo } from 'react';
import { Card, Row, Col, Space, Tag, Badge } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  HeartOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';

interface SystemHealthPanelProps {
  health: {
    status: string;
    timestamp: number;
    components: {
      [key: string]: {
        status: string;
        message: string;
        details?: any;
      };
    };
  };
}

/**
 * 系统健康状态面板
 * 展示各组件的健康状态
 */
const SystemHealthPanel: React.FC<SystemHealthPanelProps> = memo(({ health }) => {
  // 状态配置
  const statusConfig: { [key: string]: { color: string; icon: React.ReactNode; bg: string } } = {
    UP: { 
      color: '#52c41a', 
      icon: <CheckCircleOutlined />, 
      bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' 
    },
    DOWN: { 
      color: '#ff4d4f', 
      icon: <CloseCircleOutlined />, 
      bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' 
    },
    WARNING: { 
      color: '#faad14', 
      icon: <WarningOutlined />, 
      bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' 
    }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.WARNING;
  };

  const overallStatus = getStatusConfig(health.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="glass-card health-panel" 
        title={
          <Space>
            <HeartOutlined style={{ color: overallStatus.color }} />
            <span>系统健康状态</span>
            <Badge 
              status={health.status === 'UP' ? 'success' : 'error'} 
              text={health.status}
            />
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {Object.entries(health.components).map(([key, component], index) => {
            const config = getStatusConfig(component.status);
            
            return (
              <Col xs={24} sm={12} lg={6} key={key}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 12px 40px ${config.color}30`
                  }}
                >
                  <div
                    className="health-component"
                    style={{
                      background: config.bg,
                      borderRadius: 16,
                      padding: 20,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 4px 20px ${config.color}20`,
                      border: `2px solid ${config.color}30`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* 左侧装饰条 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: config.color
                      }}
                    />

                    {/* 背景图案 */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: config.color,
                        filter: 'blur(20px)'
                      }}
                    />

                    <Space direction="vertical" style={{ width: '100%', position: 'relative', zIndex: 1 }} size={12}>
                      {/* 标题和状态 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: 15, 
                          fontWeight: 600, 
                          color: '#2d3748',
                          textTransform: 'capitalize'
                        }}>
                          {key}
                        </span>
                        <Tag 
                          color={config.color} 
                          icon={config.icon}
                          style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontWeight: 600,
                            border: 'none',
                            boxShadow: `0 2px 8px ${config.color}30`
                          }}
                        >
                          {component.status}
                        </Tag>
                      </div>

                      {/* 消息 */}
                      <div style={{ 
                        fontSize: 13, 
                        color: '#4a5568',
                        lineHeight: 1.5,
                        minHeight: 40
                      }}>
                        {component.message}
                      </div>

                      {/* 详细信息 */}
                      {component.details && Object.keys(component.details).length > 0 && (
                        <div
                          style={{
                            padding: 12,
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 12,
                            fontSize: 12,
                            marginTop: 8
                          }}
                        >
                          {Object.entries(component.details).map(([k, v]) => (
                            <div 
                              key={k} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                padding: '4px 0',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                              }}
                            >
                              <span style={{ color: '#718096', fontWeight: 500 }}>{k}:</span>
                              <span style={{ color: '#2d3748', fontWeight: 600 }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Space>

                    {/* 状态指示器 */}
                    <motion.div
                      animate={{
                        scale: component.status === 'UP' ? [1, 1.3, 1] : 1,
                        opacity: component.status === 'UP' ? [1, 0.5, 1] : 1
                      }}
                      transition={{
                        duration: 2,
                        repeat: component.status === 'UP' ? Infinity : 0
                      }}
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: config.color,
                        boxShadow: `0 0 12px ${config.color}`
                      }}
                    />
                  </div>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </Card>
    </motion.div>
  );
});

SystemHealthPanel.displayName = 'SystemHealthPanel';

export default SystemHealthPanel;

