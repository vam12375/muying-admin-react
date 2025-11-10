import React, { memo } from 'react';
import { Progress, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

const { Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  thresholdWarning?: number;
  thresholdDanger?: number;
  decimals?: number;
  showProgress?: boolean;
}

/**
 * 增强的性能指标卡片组件
 * 支持 3D 效果、数字滚动动画、进度条可视化
 */
const MetricCard: React.FC<MetricCardProps> = memo(({
  title,
  value,
  suffix = '%',
  icon,
  color,
  delay = 0,
  thresholdWarning = 70,
  thresholdDanger = 85,
  decimals = 2,
  showProgress = true
}) => {
  // 使用数字滚动动画
  const animatedValue = useCountUp({
    end: value,
    duration: 1500,
    decimals,
    suffix: ''
  });

  // 根据阈值确定状态颜色
  const getStatusColor = () => {
    if (value >= thresholdDanger) return '#ff4d4f';
    if (value >= thresholdWarning) return '#faad14';
    return color;
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        boxShadow: `0 20px 60px ${statusColor}40`,
        transition: { duration: 0.3 }
      }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        className="metric-card-enhanced"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 8px 32px ${statusColor}20`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {/* 顶部渐变条 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`,
            transformOrigin: 'left'
          }}
        />

        {/* 背景光晕效果 */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: '50%',
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${statusColor}30, transparent)`,
            filter: 'blur(20px)',
            transform: 'translateY(-50%)'
          }}
        />

        <Space direction="vertical" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          {/* 标题和图标 */}
          <Space align="center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{ color: statusColor, fontSize: 24 }}
            >
              {icon}
            </motion.div>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              {title}
            </Text>
          </Space>

          {/* 数值显示 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              delay: delay + 0.3
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${statusColor}, ${statusColor}88)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginRight: 4
                }}
              >
                {animatedValue}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: statusColor,
                  opacity: 0.8
                }}
              >
                {suffix}
              </span>
            </div>
          </motion.div>

          {/* 进度条 */}
          {showProgress && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{
                duration: 1,
                delay: delay + 0.4
              }}
            >
              <Progress
                percent={value}
                strokeColor={{
                  '0%': statusColor,
                  '100%': statusColor + '88'
                }}
                trailColor="rgba(0, 0, 0, 0.06)"
                showInfo={false}
                strokeWidth={10}
                style={{ marginTop: 8 }}
              />
            </motion.div>
          )}
        </Space>

        {/* 脉冲效果(当数值超过警戒线时) */}
        {value >= thresholdWarning && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: statusColor
            }}
          />
        )}
      </div>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
