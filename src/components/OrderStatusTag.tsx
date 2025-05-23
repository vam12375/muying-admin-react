import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  DollarOutlined, 
  CarOutlined,
  WarningOutlined,
  SyncOutlined,
  StopOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface OrderStatusTagProps {
  status: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'small' | 'default' | 'large';
}

// 定义状态和对应描述的映射
const statusMap: Record<string, { 
  color: string; 
  text: string; 
  icon: React.ReactNode;
  description: string;
}> = {
  'pending_payment': {
    color: 'warning',
    text: '待支付',
    icon: <DollarOutlined />,
    description: '订单已创建，等待买家付款'
  },
  'pending_shipment': {
    color: 'processing',
    text: '待发货',
    icon: <ClockCircleOutlined />,
    description: '买家已付款，等待商家发货'
  },
  'shipped': {
    color: 'blue',
    text: '已发货',
    icon: <CarOutlined />,
    description: '商家已发货，等待买家确认收货'
  },
  'completed': {
    color: 'success',
    text: '已完成',
    icon: <CheckCircleOutlined />,
    description: '订单已完成'
  },
  'cancelled': {
    color: 'error',
    text: '已取消',
    icon: <StopOutlined />,
    description: '订单已取消'
  },
  'refunding': {
    color: 'orange',
    text: '退款中',
    icon: <SyncOutlined spin />,
    description: '订单正在退款处理中'
  },
  'refunded': {
    color: 'purple',
    text: '已退款',
    icon: <WarningOutlined />,
    description: '订单已退款'
  }
};

// 样式化标签
const StyledTag = styled(motion.div)<{ $size?: string }>`
  display: inline-flex;
  
  .status-tag {
    display: inline-flex;
    align-items: center;
    padding: ${props => props.$size === 'large' ? '5px 10px' : (props.$size === 'small' ? '0 5px' : '2px 7px')};
    border-radius: 4px;
    font-size: ${props => props.$size === 'large' ? '14px' : (props.$size === 'small' ? '11px' : '12px')};
    line-height: 1.5;
  }
  
  .tag-icon {
    margin-right: 4px;
    font-size: ${props => props.$size === 'large' ? '14px' : (props.$size === 'small' ? '11px' : '12px')};
  }
`;

/**
 * 订单状态标签组件
 * 增强版订单状态标签，带有图标、悬浮提示和动画效果
 * @param props 组件属性
 * @returns 组件
 */
const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ 
  status, 
  showIcon = true,
  showTooltip = true,
  size = 'default'
}) => {
  // 获取状态信息，如果未找到则使用默认值
  const statusInfo = statusMap[status] || {
    color: 'default',
    text: status,
    icon: <ClockCircleOutlined />,
    description: '未知状态'
  };
  
  const tag = (
    <StyledTag
      $size={size}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Tag 
        color={statusInfo.color} 
        className="status-tag"
        icon={showIcon ? <span className="tag-icon">{statusInfo.icon}</span> : null}
      >
        {statusInfo.text}
      </Tag>
    </StyledTag>
  );
  
  // 如果显示提示，则包装在Tooltip中
  if (showTooltip) {
    return (
      <Tooltip title={statusInfo.description}>
        {tag}
      </Tooltip>
    );
  }
  
  return tag;
};

export default OrderStatusTag; 