import React, { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface WaveChartProps {
  data: number[];
  title: string;
  color: string;
  maxDataPoints?: number;
  height?: number;
}

/**
 * 实时波形图组件
 * 使用 ECharts 实现流畅的数据流动效果
 */
const WaveChart: React.FC<WaveChartProps> = memo(({
  data,
  title,
  color,
  maxDataPoints = 50,
  height = 120
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstanceRef.current = echarts.init(chartRef.current);

    // 配置选项
    const option: EChartsOption = {
      grid: {
        left: 50,
        right: 20,
        top: 30,
        bottom: 30
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        show: false,
        data: Array.from({ length: maxDataPoints }, (_, i) => i)
      },
      yAxis: {
        type: 'value',
        scale: true,
        min: 0,
        max: 100,
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.06)',
            type: 'dashed'
          }
        },
        axisLabel: {
          formatter: '{value}%',
          color: '#666'
        }
      },
      series: [
        {
          name: title,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: color
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}88` },
              { offset: 1, color: `${color}11` }
            ])
          },
          data: data.slice(-maxDataPoints),
          animationDuration: 300,
          animationEasing: 'linear'
        }
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const value = params[0]?.value || 0;
          return `${title}: ${value.toFixed(2)}%`;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: color,
        borderWidth: 1,
        textStyle: {
          color: '#fff'
        }
      }
    };

    chartInstanceRef.current.setOption(option);

    // 响应式
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.setOption({
      series: [
        {
          data: data.slice(-maxDataPoints)
        }
      ]
    });
  }, [data, maxDataPoints]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: `${height}px`,
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 8
      }}
    />
  );
});

WaveChart.displayName = 'WaveChart';

export default WaveChart;
