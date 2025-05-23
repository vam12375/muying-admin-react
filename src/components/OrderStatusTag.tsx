import React from 'react';
import { Tag } from 'antd';

interface OrderStatusTagProps {
  status: string;
}

/**
 * 订单状态标签组件
 * @param props 组件属性
 * @returns 组件
 */
const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status }) => {
  // 根据订单状态返回对应的标签
  const getStatusTag = () => {
    switch (status) {
      case 'pending_payment':
        return <Tag color="warning">待支付</Tag>;
      case 'pending_shipment':
        return <Tag color="processing">待发货</Tag>;
      case 'shipped':
        return <Tag color="blue">已发货</Tag>;
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      case 'cancelled':
        return <Tag color="error">已取消</Tag>;
      case 'refunding':
        return <Tag color="orange">退款中</Tag>;
      case 'refunded':
        return <Tag color="purple">已退款</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return getStatusTag();
};

export default OrderStatusTag; 