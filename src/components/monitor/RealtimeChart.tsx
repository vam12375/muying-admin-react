import React, { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { motion } from 'framer-motion';

interface DataSeries {
  name: string;
  data: number[];
  color: string;
}

interface RealtimeChartProps {
  title: string;
  data: DataSeries[];
  height?: number;
  maxDataPoints?: number;
}

/**
 * 实时数据图表组件
 * 高性能、流畅的实时数据可视化
 */
const RealtimeChart: React.FC<RealtimeChartProps> = memo(({
  title,
  data,
  height = 200,
  maxDataPoints = 50
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    // 配置选项
    const option: EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        textStyle: {
          fontSize: 14,
          fontWeight: 500,
          color: '#333'
        },
        left: 12,
        top: 8
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        formatter: (params: any) => {
          let content = `<div style="padding: 4px 8px;">`;
          params.forEach((param: any) => {
            content += `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color}; margin-right: 8px;"></span>
                <span>${param.seriesName}: </span>
                <strong style="margin-left: 8px;">${param.value.toFixed(2)}%</strong>
              </div>
            `;
          });
          content += `</div>`;
          return content;
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.2)',
            type: 'dashed'
          }
        }
      },
      grid: {
        left: 48,
        right: 24,
        top: 48,
        bottom: 32,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: maxDataPoints }, (_, i) => i),
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          formatter: '{value}%',
          color: '#999',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.06)',
            type: 'dashed'
          }
        }
      },
      series: data.map((series) => ({
        name: series.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: series.color,
          shadowColor: `${series.color}60`,
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: {
          color: series.color,
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${series.color}60` },
            { offset: 0.5, color: `${series.color}30` },
            { offset: 1, color: `${series.color}10` }
          ])
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: series.color
          }
        },
        data: series.data.slice(-maxDataPoints),
        animationDuration: 300,
        animationEasing: 'linear'
      }))
    };

    chart.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [title, maxDataPoints]);

  // 更新数据
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.setOption({
      series: data.map((series) => ({
        data: series.data.slice(-maxDataPoints)
      }))
    });
  }, [data, maxDataPoints]);

  return (
    <motion.div
      className="realtime-chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #f5f7fa 100%)',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 装饰性渐变背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${data.map(d => d.color).join(', ')})`
        }}
      />

      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: `${height}px`
        }}
      />
    </motion.div>
  );
});

RealtimeChart.displayName = 'RealtimeChart';

export default RealtimeChart;

