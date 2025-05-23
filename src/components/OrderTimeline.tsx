import React from 'react';
import { Timeline, Card, Typography, Tag, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ShoppingOutlined,
  DollarOutlined, 
  CarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

// 定义时间线条目接口
interface TimelineItem {
  id: string;
  title: string;
  time: string;
  description?: string;
  operator?: string;
  icon?: React.ReactNode;
  type?: 'success' | 'warning' | 'error' | 'processing' | 'default';
  color?: string;
  extra?: React.ReactNode;
}

// 组件属性接口
interface OrderTimelineProps {
  items: TimelineItem[];
  title?: string;
  loading?: boolean;
}

// 样式化组件
const TimelineCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    min-height: 48px;
  }
  
  .ant-card-head-title {
    font-size: 16px;
    padding: 12px 0;
  }
  
  .timeline-container {
    padding: 16px 0;
  }
  
  .timeline-item-content {
    display: flex;
    flex-direction: column;
    padding-bottom: 8px;
  }
  
  .timeline-title {
    font-weight: 500;
    font-size: 14px;
  }
  
  .timeline-time {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .timeline-description {
    margin-top: 4px;
    color: rgba(0, 0, 0, 0.65);
  }
  
  .timeline-operator {
    margin-top: 4px;
    font-size: 12px;
  }
  
  .timeline-extra {
    margin-top: 8px;
  }
`;

// 获取默认图标
const getDefaultIcon = (type?: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined />;
    case 'warning':
      return <ExclamationCircleOutlined />;
    case 'error':
      return <ExclamationCircleOutlined />;
    case 'processing':
      return <ClockCircleOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

// 根据操作类型获取图标
const getIconByTitle = (title: string) => {
  if (title.includes('下单') || title.includes('创建')) {
    return <ShoppingOutlined />;
  }
  if (title.includes('支付') || title.includes('付款')) {
    return <DollarOutlined />;
  }
  if (title.includes('发货') || title.includes('物流')) {
    return <CarOutlined />;
  }
  if (title.includes('完成') || title.includes('完结') || title.includes('确认')) {
    return <CheckCircleOutlined />;
  }
  return null;
};

/**
 * 订单时间线组件
 * 展示订单的历史记录和状态变更
 */
const OrderTimeline: React.FC<OrderTimelineProps> = ({
  items,
  title = '订单动态',
  loading = false
}) => {
  // 将items转换为Timeline需要的格式
  const timelineItems = items.map((item, index) => ({
    key: item.id,
    dot: item.icon || getIconByTitle(item.title) || getDefaultIcon(item.type),
    color: item.color || (item.type === 'default' ? 'blue' : item.type),
    children: (
      <motion.div 
        className="timeline-item-content"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Text className="timeline-title">{item.title}</Text>
        <Text className="timeline-time">{item.time}</Text>
        
        {item.description && (
          <Text className="timeline-description">
            {item.description}
          </Text>
        )}
        
        {item.operator && (
          <Text className="timeline-operator">
            操作人: {item.operator}
          </Text>
        )}
        
        {item.extra && (
          <div className="timeline-extra">
            {item.extra}
          </div>
        )}
      </motion.div>
    )
  }));

  return (
    <TimelineCard
      title={title}
      loading={loading}
    >
      <div className="timeline-container">
        <Timeline
          mode="left"
          items={timelineItems}
        />
      </div>
    </TimelineCard>
  );
};

export default OrderTimeline; 