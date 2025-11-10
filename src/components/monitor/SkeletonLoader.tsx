import React, { memo } from 'react';
import { Card, Row, Col, Skeleton, Space } from 'antd';
import { motion } from 'framer-motion';

/**
 * 骨架屏加载组件
 * 模拟监控页面的布局结构
 */
const SkeletonLoader: React.FC = memo(() => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部骨架 */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={cardVariants}
        style={{ marginBottom: 32 }}
      >
        <Card className="glass-card skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Skeleton.Avatar active size="large" />
              <Skeleton.Input active style={{ width: 200 }} />
            </Space>
            <Space>
              <Skeleton.Button active />
              <Skeleton.Button active />
            </Space>
          </div>
        </Card>
      </motion.div>

      {/* 健康状态卡片骨架 */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={cardVariants}
        style={{ marginBottom: 24 }}
      >
        <Card className="glass-card skeleton-card" title={<Skeleton.Input active style={{ width: 150 }} />}>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((item) => (
              <Col xs={24} sm={12} lg={6} key={item}>
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: item * 0.2
                  }}
                >
                  <Card
                    size="small"
                    style={{
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderRadius: 12,
                      border: 'none'
                    }}
                  >
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>

      {/* 性能指标卡片骨架 */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={cardVariants}
        style={{ marginBottom: 24 }}
      >
        <Card className="glass-card skeleton-card" title={<Skeleton.Input active style={{ width: 150 }} />}>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((item) => (
              <Col span={6} key={item}>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: item * 0.3
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Skeleton.Input active style={{ width: '100%' }} />
                    <Skeleton.Avatar active shape="square" style={{ width: '100%', height: 60 }} />
                    <Skeleton.Input active style={{ width: '80%' }} size="small" />
                  </Space>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>

      {/* 双列卡片骨架 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[3, 4].map((index) => (
          <Col xs={24} lg={12} key={index}>
            <motion.div
              initial="hidden"
              animate="visible"
              custom={index}
              variants={cardVariants}
            >
              <Card className="glass-card skeleton-card" title={<Skeleton.Input active style={{ width: 120 }} />}>
                <Row gutter={[16, 16]}>
                  {[1, 2, 3, 4].map((item) => (
                    <Col span={12} key={item}>
                      <Skeleton active paragraph={{ rows: 1 }} />
                    </Col>
                  ))}
                </Row>
                <div style={{ marginTop: 24 }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* 表格骨架 */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={5}
        variants={cardVariants}
      >
        <Card className="glass-card skeleton-card" title={<Skeleton.Input active style={{ width: 150 }} />}>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[1, 2, 3, 4].map((item) => (
              <Col span={6} key={item}>
                <Skeleton active paragraph={{ rows: 0 }} />
              </Col>
            ))}
          </Row>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </motion.div>

      {/* CSS 动画样式 */}
      <style>{`
        .skeleton-card {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
