import React, { useEffect, useRef } from 'react';
import { Card, Statistic, Tag, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// 注册必要的ECharts组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义统计卡片的属性
interface OrderStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  trend?: number[];
  loading?: boolean;
  icon?: React.ReactNode;
  color?: string;
  trendColor?: string;
  onClick?: () => void;
}

// 使用styled-components创建样式化组件
const StyledCard = styled(motion.div)<{ $cardColor?: string }>`
  .ant-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    background: ${(props) => props.$cardColor || 'white'};
    
    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .card-title {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    font-weight: 500;
  }
  
  .trend-container {
    margin-top: 8px;
    display: flex;
    align-items: center;
  }
  
  .trend-chart {
    height: 35px;
    width: 100%;
    margin-top: 8px;
  }
  
  .trend-percentage {
    margin-left: 8px;
    white-space: nowrap;
  }
`;

/**
 * 订单统计卡片组件，展示带有趋势图表的统计数据
 */
const OrderStatCard: React.FC<OrderStatCardProps> = ({
  title,
  value,
  previousValue,
  trend = [],
  loading = false,
  icon,
  color = '#ffffff',
  trendColor = '#3182ff',
  onClick
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  let chartInstance: echarts.ECharts | null = null;
  
  // 计算环比变化
  const calculateChange = () => {
    if (previousValue && previousValue > 0) {
      return ((value - previousValue) / previousValue) * 100;
    }
    return 0;
  };
  
  const percentChange = calculateChange();
  const isIncrease = percentChange > 0;
  
  // 初始化图表
  useEffect(() => {
    if (chartRef.current && trend.length > 0) {
      // 如果已经有图表实例，则销毁它
      if (chartInstance) {
        chartInstance.dispose();
      }
      
      // 创建新的图表实例
      chartInstance = echarts.init(chartRef.current);
      
      // 图表配置
      const option = {
        animation: true,
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          data: Array.from({ length: trend.length }, (_, i) => i)
        },
        yAxis: {
          type: 'value',
          show: false,
          min: (value: number) => Math.floor(Math.min(...trend) * 0.9),
          max: (value: number) => Math.ceil(Math.max(...trend) * 1.1)
        },
        series: [
          {
            data: trend,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: trendColor,
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: echarts.color.modifyAlpha(trendColor, 0.6)
                },
                {
                  offset: 1,
                  color: echarts.color.modifyAlpha(trendColor, 0.1)
                }
              ])
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const dataIndex = params[0].dataIndex;
            const value = params[0].value;
            return `数据点 ${dataIndex + 1}: ${value}`;
          },
          axisPointer: {
            type: 'none'
          }
        }
      };
      
      // 设置图表配置并渲染
      chartInstance.setOption(option);
    }
    
    // 清理函数
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
    };
  }, [trend, trendColor]);
  
  return (
    <StyledCard
      $cardColor={color}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        loading={loading}
        className="stat-card"
        bodyStyle={{ padding: '16px' }}
        hoverable={!!onClick}
      >
        <div className="card-content">
          <div className="card-header">
            <div className="card-title">
              {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
              {title}
            </div>
            <Tooltip title="查看详细统计">
              <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
            </Tooltip>
          </div>
          
          <Statistic
            value={value}
            valueStyle={{ fontWeight: 600, fontSize: '24px' }}
          />
          
          {previousValue !== undefined && (
            <div className="trend-container">
              <Tag
                color={isIncrease ? '#52c41a' : '#f5222d'}
                style={{ marginRight: 0 }}
              >
                {isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(percentChange).toFixed(1)}%
              </Tag>
              <span className="trend-percentage" style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                较上期
              </span>
            </div>
          )}
          
          {trend.length > 0 && (
            <div className="trend-chart" ref={chartRef} />
          )}
        </div>
      </Card>
    </StyledCard>
  );
};

export default OrderStatCard; 