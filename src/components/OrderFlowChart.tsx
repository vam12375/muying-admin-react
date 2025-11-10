import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Tooltip, Badge } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

// 流程节点状态类型
type NodeStatus = 'waiting' | 'completed' | 'processing' | 'failed' | 'cancelled';

// 流程节点接口
interface FlowNode {
  key: string;
  title: string;
  time?: string;
  status: NodeStatus;
  description?: string;
  icon?: React.ReactNode;
}

// 组件属性接口
interface OrderFlowChartProps {
  nodes: FlowNode[];
  currentNodeKey?: string;
  vertical?: boolean;
}

// 流程图样式
const FlowChartContainer = styled.div<{ $vertical?: boolean }>`
  display: flex;
  flex-direction: ${props => props.$vertical ? 'column' : 'row'};
  align-items: ${props => props.$vertical ? 'flex-start' : 'flex-start'};
  justify-content: space-between;
  width: 100%;
  margin: 20px 0;
  position: relative;
  gap: ${props => props.$vertical ? '8px' : '0'};
  padding: ${props => props.$vertical ? '0' : '0 12px'};

  &::before {
    content: '';
    position: absolute;
    background-color: #f0f0f0;
    z-index: 1;
    ${props => props.$vertical
      ? 'width: 2px; top: 0; bottom: 0; left: 12px;'
      : 'height: 2px; left: 12px; right: 12px; top: 12px;'}
  }
`;

// 节点容器样式
const NodeContainer = styled(motion.div)<{ $vertical?: boolean, $active?: boolean, $status: NodeStatus }>`
  display: flex;
  flex-direction: ${props => props.$vertical ? 'row' : 'column'};
  align-items: ${props => props.$vertical ? 'flex-start' : 'center'};
  position: relative;
  z-index: 2;
  padding: ${props => props.$vertical ? '0 0 0 36px' : '0'};
  margin-bottom: ${props => props.$vertical ? '24px' : '0'};
  width: ${props => props.$vertical ? '100%' : 'auto'};
  flex: ${props => props.$vertical ? '0' : '1'};

  ${props => !props.$vertical && `
    &::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 0;
      width: 50%;
      height: 2px;
      background-color: ${
        props.$status === 'completed' || props.$status === 'processing' ? '#52c41a' : '#f0f0f0'
      };
      z-index: 1;
    }

    &::after {
      content: '';
      position: absolute;
      top: 12px;
      right: 0;
      width: 50%;
      height: 2px;
      background-color: ${
        props.$status === 'completed' ? '#52c41a' : '#f0f0f0'
      };
      z-index: 1;
    }

    &:first-child::before {
      display: none;
    }

    &:last-child::after {
      display: none;
    }
  `}

  ${props => props.$vertical && `
    &::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      height: 100%;
      width: 2px;
      background-color: ${
        props.$status === 'completed' || props.$status === 'processing' ? '#52c41a' : '#f0f0f0'
      };
      z-index: 1;
    }

    &:last-child::before {
      display: none;
    }
  `}
`;

// 节点样式
const Node = styled.div<{ $status: NodeStatus, $active?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  z-index: 3;
  position: relative;
  transition: all 0.3s;
  box-shadow: ${props => props.$active ? '0 0 0 4px rgba(82, 196, 26, 0.2)' : 'none'};

  ${props => {
    switch(props.$status) {
      case 'completed':
        return 'background-color: #52c41a; color: white;';
      case 'processing':
        return 'background-color: #1890ff; color: white;';
      case 'failed':
        return 'background-color: #ff4d4f; color: white;';
      case 'cancelled':
        return 'background-color: #ff7a45; color: white;';
      default:
        return 'background-color: #d9d9d9; color: rgba(0, 0, 0, 0.45);';
    }
  }}
`;

// 节点标题样式
const NodeTitle = styled.div<{ $status: NodeStatus, $active?: boolean, $vertical?: boolean }>`
  font-size: 14px;
  color: ${props => props.$active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.65)'};
  font-weight: ${props => props.$active ? '500' : 'normal'};
  margin: ${props => props.$vertical ? '0 0 0 12px' : '0'};
  text-align: ${props => props.$vertical ? 'left' : 'center'};
`;

// 节点时间样式
const NodeTime = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
`;

// 节点文字内容样式
const NodeContent = styled.div<{ $vertical?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$vertical ? 'flex-start' : 'center'};
`;

// 提供节点图标
const getNodeIcon = (status: NodeStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircleFilled />;
    case 'failed':
      return <CloseCircleFilled />;
    case 'cancelled':
      return <ExclamationCircleFilled />;
    default:
      return null;
  }
};

/**
 * 订单流程图组件
 * 以可视化方式展示订单的处理流程和当前状态
 */
const OrderFlowChart: React.FC<OrderFlowChartProps> = ({
  nodes,
  currentNodeKey,
  vertical = false
}) => {
  return (
    <FlowChartContainer $vertical={vertical}>
      {nodes.map((node, index) => {
        const isActive = node.key === currentNodeKey;
        const isLast = index === nodes.length - 1;
        
        return (
          <NodeContainer 
            key={node.key}
            $vertical={vertical}
            $active={isActive}
            $status={node.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Tooltip 
              title={node.description || node.title} 
              placement={vertical ? 'right' : 'top'}
            >
              <Node $status={node.status} $active={isActive}>
                {node.icon || getNodeIcon(node.status) || (index + 1)}
              </Node>
            </Tooltip>
            
            <NodeContent $vertical={vertical}>
              <NodeTitle 
                $status={node.status} 
                $active={isActive}
                $vertical={vertical}
              >
                {node.title}
              </NodeTitle>
              
              {node.time && <NodeTime>{node.time}</NodeTime>}
            </NodeContent>
          </NodeContainer>
        );
      })}
    </FlowChartContainer>
  );
};

export default OrderFlowChart; 