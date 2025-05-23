import React from 'react';
import { Progress, Tooltip } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Card from '../Card';

export interface StatChangeData {
  type: 'increase' | 'decrease' | 'noChange';
  value: string;
  text?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  precision?: number;
  formatter?: (value: number | string) => string;
  prefix?: React.ReactNode;
  suffix?: string | React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  change?: StatChangeData;
  showProgress?: boolean;
  progressPercent?: number;
  progressColor?: string;
  tooltip?: string;
  loading?: boolean;
  variant?: 'default' | 'simple' | 'gradient' | 'minimal' | 'accent';
  accentColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
  extra?: React.ReactNode;
  onClick?: () => void;
}

/**
 * 统计数据卡片组件
 * 用于显示重要的统计数据，支持多种风格和布局
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  precision = 0,
  formatter,
  prefix,
  suffix,
  icon,
  color,
  change,
  showProgress = false,
  progressPercent,
  progressColor,
  tooltip,
  loading = false,
  variant = 'default',
  accentColor = 'primary',
  className,
  extra,
  onClick,
}) => {
  // 格式化数值显示
  const formattedValue = formatter ? formatter(value) : 
    (typeof value === 'number' && precision > 0) ? 
      value.toFixed(precision) : 
      value;
  
  // 获取变化箭头图标
  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change.type === 'increase') {
      return <ArrowUpOutlined className="mr-1 text-success-500" />;
    } else if (change.type === 'decrease') {
      return <ArrowDownOutlined className="mr-1 text-danger-500" />;
    }
    
    return null;
  };
  
  // 获取变化文本颜色
  const getChangeTextColor = () => {
    if (!change) return '';
    
    if (change.type === 'increase') {
      return 'text-success-500';
    } else if (change.type === 'decrease') {
      return 'text-danger-500';
    }
    
    return 'text-gray-500 dark:text-gray-400';
  };
  
  // 根据变体类型返回合适的渲染内容
  const renderByVariant = () => {
    // 渐变背景色和文本色映射
    const gradientMap: Record<string, { bg: string, text: string }> = {
      primary: { 
        bg: 'bg-gradient-to-r from-primary-500 to-primary-600',
        text: 'text-white'
      },
      success: { 
        bg: 'bg-gradient-to-r from-success-500 to-success-600', 
        text: 'text-white' 
      },
      warning: { 
        bg: 'bg-gradient-to-r from-warning-500 to-warning-600',
        text: 'text-white' 
      },
      danger: { 
        bg: 'bg-gradient-to-r from-danger-500 to-danger-600',
        text: 'text-white' 
      },
      info: { 
        bg: 'bg-gradient-to-r from-info-500 to-info-600',
        text: 'text-white' 
      },
      purple: { 
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        text: 'text-white' 
      },
    };
    
    // 强调色卡片的背景色和文本色
    const accentMap: Record<string, { light: string, dark: string, border: string, text: string }> = {
      primary: {
        light: 'bg-primary-50',
        dark: 'dark:bg-primary-900/20',
        border: 'border-primary-200 dark:border-primary-800/30',
        text: 'text-primary-700 dark:text-primary-300'
      },
      success: {
        light: 'bg-success-50',
        dark: 'dark:bg-success-900/20',
        border: 'border-success-200 dark:border-success-800/30',
        text: 'text-success-700 dark:text-success-300'
      },
      warning: {
        light: 'bg-warning-50',
        dark: 'dark:bg-warning-900/20',
        border: 'border-warning-200 dark:border-warning-800/30',
        text: 'text-warning-700 dark:text-warning-300'
      },
      danger: {
        light: 'bg-danger-50',
        dark: 'dark:bg-danger-900/20',
        border: 'border-danger-200 dark:border-danger-800/30',
        text: 'text-danger-700 dark:text-danger-300'
      },
      info: {
        light: 'bg-info-50',
        dark: 'dark:bg-info-900/20',
        border: 'border-info-200 dark:border-info-800/30',
        text: 'text-info-700 dark:text-info-300'
      },
      purple: {
        light: 'bg-purple-50',
        dark: 'dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800/30',
        text: 'text-purple-700 dark:text-purple-300'
      }
    };
    
    // 默认样式
    if (variant === 'default') {
      return (
        <Card 
          hoverable 
          glass 
          className={cn("h-full overflow-hidden", className)}
          onClick={onClick}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
                {tooltip && (
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                )}
              </div>
              <div className="mt-2 text-2xl font-bold" style={{ color: color ? color : undefined }}>
                {prefix && <span className="mr-1">{prefix}</span>}
                {loading ? <div className="animate-pulse h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div> : formattedValue}
                {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
              </div>
              
              {change && (
                <div className="mt-2 text-xs flex items-center">
                  {getChangeIcon()}
                  <span className={getChangeTextColor()}>
                    {change.value}
                  </span>
                  {change.text && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      {change.text}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {icon && (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white",
                `bg-${accentColor || 'primary'}-500`
              )}>
                {icon}
              </div>
            )}
          </div>
          
          {showProgress && progressPercent !== undefined && (
            <div className="mt-4 -mx-6 -mb-6 pb-1">
              <div className="h-1 bg-gradient-to-r from-white/5 via-white/10 to-transparent dark:from-gray-700/30 dark:via-gray-700/20 dark:to-transparent"></div>
              <div className="flex justify-between px-6 pt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">进度</div>
                <div className="text-xs font-medium">
                  {progressPercent}%
                </div>
              </div>
              <div className="px-6 pt-1">
                <Progress 
                  percent={progressPercent} 
                  showInfo={false}
                  strokeColor={progressColor || color}
                  size="small"
                />
              </div>
            </div>
          )}
          
          {extra && <div className="mt-4">{extra}</div>}
        </Card>
      );
    }
    
    // 简单样式
    if (variant === 'simple') {
      return (
        <Card 
          className={cn("h-full", className)}
          onClick={onClick}
          shadow="sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: color ? color : undefined }}>
                {prefix && <span className="mr-1">{prefix}</span>}
                {loading ? <div className="animate-pulse h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div> : formattedValue}
                {suffix && <span className="ml-1 text-sm">{suffix}</span>}
              </div>
            </div>
            {icon && <div className="text-gray-400 dark:text-gray-500 text-xl">{icon}</div>}
          </div>
          {change && (
            <div className="mt-2 text-xs flex items-center">
              {getChangeIcon()}
              <span className={getChangeTextColor()}>
                {change.value}
              </span>
              {change.text && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  {change.text}
                </span>
              )}
            </div>
          )}
          {showProgress && progressPercent !== undefined && (
            <div className="mt-3">
              <Progress 
                percent={progressPercent} 
                showInfo={false}
                strokeColor={progressColor || color}
                size="small"
              />
            </div>
          )}
          {extra && <div className="mt-4">{extra}</div>}
        </Card>
      );
    }
    
    // 渐变样式
    if (variant === 'gradient') {
      const { bg, text } = gradientMap[accentColor] || gradientMap.primary;
      
      return (
        <motion.div 
          className={cn(
            "rounded-xl overflow-hidden h-full", 
            bg,
            text,
            "shadow-lg",
            className
          )}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          onClick={onClick}
        >
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium opacity-80">{title}</div>
              {icon && <div className="text-2xl opacity-90">{icon}</div>}
            </div>
            <div className="mt-4 text-3xl font-bold">
              {prefix && <span className="mr-1">{prefix}</span>}
              {loading ? <div className="animate-pulse h-9 w-28 bg-white/20 rounded"></div> : formattedValue}
              {suffix && <span className="ml-1 text-lg font-medium opacity-80">{suffix}</span>}
            </div>
            {change && (
              <div className="mt-3 text-sm flex items-center opacity-90">
                {change.type === 'increase' ? <ArrowUpOutlined className="mr-1" /> : <ArrowDownOutlined className="mr-1" />}
                <span>{change.value}</span>
                {change.text && <span className="ml-1 opacity-75">{change.text}</span>}
              </div>
            )}
            {showProgress && progressPercent !== undefined && (
              <div className="mt-5">
                <div className="flex justify-between text-xs opacity-80 mb-1">
                  <span>进度</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    // 极简样式
    if (variant === 'minimal') {
      return (
        <div className={cn("px-4 py-3 h-full", className)} onClick={onClick}>
          <div className="flex items-center gap-3">
            {icon && <div className="text-xl text-gray-400 dark:text-gray-500">{icon}</div>}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
              <div className="mt-1 text-lg font-medium" style={{ color: color ? color : undefined }}>
                {loading ? 
                  <div className="animate-pulse h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded"></div> : 
                  <>
                    {prefix && <span className="mr-1">{prefix}</span>}
                    {formattedValue}
                    {suffix && <span className="ml-1 text-sm font-normal">{suffix}</span>}
                  </>
                }
              </div>
            </div>
          </div>
          {change && (
            <div className="mt-1 text-xs flex items-center pl-7">
              {getChangeIcon()}
              <span className={getChangeTextColor()}>{change.value}</span>
              {change.text && <span className="text-gray-500 dark:text-gray-400 ml-1">{change.text}</span>}
            </div>
          )}
        </div>
      );
    }
    
    // 强调色样式
    if (variant === 'accent') {
      const { light, dark, border, text } = accentMap[accentColor] || accentMap.primary;
      
      return (
        <div 
          className={cn(
            "rounded-lg border p-4 h-full",
            light,
            dark,
            border,
            className
          )}
          onClick={onClick}
        >
          <div className="flex justify-between items-start">
            <div className={cn("text-sm font-medium", text)}>{title}</div>
            {icon && <div className={cn(text)}>{icon}</div>}
          </div>
          <div className={cn("mt-3 text-2xl font-bold", text)}>
            {prefix && <span className="mr-1">{prefix}</span>}
            {loading ? <div className="animate-pulse h-8 w-20 bg-gray-300/50 dark:bg-gray-700/50 rounded"></div> : formattedValue}
            {suffix && <span className="ml-1 text-sm font-medium opacity-80">{suffix}</span>}
          </div>
          {change && (
            <div className="mt-2 text-xs flex items-center">
              {getChangeIcon()}
              <span className={getChangeTextColor()}>{change.value}</span>
              {change.text && <span className="text-gray-500 dark:text-gray-400 ml-1">{change.text}</span>}
            </div>
          )}
          {extra && <div className="mt-3">{extra}</div>}
        </div>
      );
    }
    
    // 默认返回简单样式
    return null;
  };
  
  return renderByVariant();
};

export default StatCard; 