import React, { memo, useMemo } from 'react';
import { Progress, Space, Typography, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useCountUp } from '../../hooks/useCountUp';

const { Text } = Typography;

interface EnhancedMetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: 'cpu' | 'memory' | 'disk' | 'java';
  color: string;
  delay?: number;
  thresholdWarning?: number;
  thresholdDanger?: number;
  decimals?: number;
}

/**
 * 增强型性能指标卡片
 * 支持 3D 效果、渐变、动画和阈值警告
 */
const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = memo(({
  title,
  value,
  suffix = '%',
  icon,
  color,
  delay = 0,
  thresholdWarning = 70,
  thresholdDanger = 85,
  decimals = 2
}) => {
  // 数字滚动动画
  const animatedValue = useCountUp({
    end: value,
    duration: 1500,
    decimals,
    suffix: ''
  });

  // 获取状态颜色
  const statusColor = useMemo(() => {
    if (value >= thresholdDanger) return '#ff4d4f';
    if (value >= thresholdWarning) return '#faad14';
    return color;
  }, [value, thresholdWarning, thresholdDanger, color]);

  // 获取状态文本
  const statusText = useMemo(() => {
    if (value >= thresholdDanger) return '危险';
    if (value >= thresholdWarning) return '警告';
    return '正常';
  }, [value, thresholdWarning, thresholdDanger]);

  // 图标映射
  const iconMap = {
    cpu: <CpuChipIcon style={{ width: 28, height: 28 }} />,
    memory: <CircleStackIcon style={{ width: 28, height: 28 }} />,
    disk: <ServerIcon style={{ width: 28, height: 28 }} />,
    java: <CubeIcon style={{ width: 28, height: 28 }} />
  };

  return (
    <Tooltip title={`${title}: ${statusText}`} placement="top">
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
          scale: 1.03,
          rotateY: 3,
          boxShadow: `0 20px 60px ${statusColor}40`,
          transition: { duration: 0.2 }
        }}
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
          cursor: 'pointer'
        }}
      >
        <div
          className="enhanced-metric-card"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '24px 20px',
            border: `2px solid ${statusColor}20`,
            boxShadow: `0 8px 32px ${statusColor}15, inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform'
          }}
        >
          {/* 顶部装饰条 */}
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
              background: `linear-gradient(90deg, ${statusColor}, ${statusColor}80, ${statusColor})`,
              transformOrigin: 'left'
            }}
          />

          {/* 背景光晕 */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: '50%',
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${statusColor}25, transparent)`,
              filter: 'blur(30px)',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />

          <Space direction="vertical" style={{ width: '100%', position: 'relative', zIndex: 1 }} size={12}>
            {/* 标题和图标 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Space align="start" size={12}>
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{ 
                    color: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {iconMap[icon]}
                </motion.div>
                <div>
                  <Text 
                    style={{ 
                      fontSize: 13, 
                      fontWeight: 500,
                      color: '#666',
                      display: 'block',
                      marginBottom: 2
                    }}
                  >
                    {title}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: 11,
                      color: statusColor,
                      fontWeight: 600
                    }}
                  >
                    {statusText}
                  </Text>
                </div>
              </Space>
            </div>

            {/* 数值显示 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                delay: delay + 0.3
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'baseline',
                marginTop: 8
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${statusColor}, ${statusColor}88)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginRight: 4,
                  lineHeight: 1,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", monospace'
                }}
              >
                {animatedValue}
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: statusColor,
                  opacity: 0.85
                }}
              >
                {suffix}
              </span>
            </motion.div>

            {/* 进度条 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{
                duration: 1,
                delay: delay + 0.4
              }}
              style={{ marginTop: 4 }}
            >
              <Progress
                percent={value}
                strokeColor={{
                  '0%': statusColor,
                  '100%': `${statusColor}88`
                }}
                trailColor="rgba(0, 0, 0, 0.04)"
                showInfo={false}
                strokeWidth={8}
                strokeLinecap="round"
              />
            </motion.div>

            {/* 阈值标记 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                警告: {thresholdWarning}%
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                危险: {thresholdDanger}%
              </Text>
            </div>
          </Space>

          {/* 警告脉冲效果 */}
          {value >= thresholdWarning && (
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: statusColor,
                boxShadow: `0 0 10px ${statusColor}`
              }}
            />
          )}
        </div>
      </motion.div>
    </Tooltip>
  );
});

EnhancedMetricCard.displayName = 'EnhancedMetricCard';

export default EnhancedMetricCard;

