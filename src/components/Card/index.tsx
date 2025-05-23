import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hoverCardAnimation } from '@/components/animations/MotionVariants';

export interface CardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  gradient?: boolean;
  gradientColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  hoverable?: boolean;
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  extra,
  children,
  className,
  glass = false,
  gradient = false,
  gradientColor = 'primary',
  hoverable = false,
  bordered = true,
  shadow = 'sm',
  padding = 'md',
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    if (hoverable) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (hoverable) {
      setIsHovered(false);
    }
  };
  
  // 渐变背景样式映射
  const gradientStyles = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white',
    info: 'bg-gradient-to-r from-info-500 to-info-600 text-white',
  };
  
  // 阴影样式映射
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  // 内边距样式映射
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  // 定义motion组件props
  const motionProps: HTMLMotionProps<"div"> = {
    initial: "rest",
    animate: isHovered ? "hover" : "rest",
    whileTap: hoverable ? "tap" : undefined,
    variants: hoverable ? hoverCardAnimation : undefined,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: onClick,
    className: cn(
      // 基础样式
      'rounded-xl overflow-hidden',
      // 背景样式条件
      {
        'bg-white dark:bg-gray-800': !glass && !gradient,
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md': glass && !gradient,
        [gradientStyles[gradientColor]]: gradient,
      },
      // 边框样式条件
      {
        'border border-gray-100 dark:border-gray-700': bordered && !gradient,
        'border border-white/50 dark:border-gray-700/50': bordered && glass,
        'border-0': !bordered || gradient,
      },
      // 阴影样式
      shadowStyles[shadow],
      // 额外类名
      className
    )
  };
  
  return (
    <motion.div {...motionProps}>
      {/* 卡片标题区域 */}
      {title && (
        <div className={cn(
          'flex justify-between items-center',
          {
            'px-4 py-3 border-b border-gray-100 dark:border-gray-700': !gradient,
            'px-4 py-3 border-b border-white/10': gradient,
            'px-4 py-3 border-b border-white/20 dark:border-gray-700/50': glass
          }
        )}>
          <div className={cn(
            'text-lg font-medium',
            {
              'text-gray-900 dark:text-gray-100': !gradient,
              'text-white': gradient
            }
          )}>
            {title}
          </div>
          {extra && (
            <div className="flex items-center">
              {extra}
            </div>
          )}
        </div>
      )}
      
      {/* 卡片内容区域 */}
      <div className={paddingStyles[title ? 'sm' : padding]}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card; 