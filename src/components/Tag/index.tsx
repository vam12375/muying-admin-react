import React from 'react'
import { Tag as AntTag } from 'antd'
import type { TagProps } from 'antd/es/tag'
import clsx from 'clsx'
import { motion } from 'framer-motion'

interface CustomTagProps extends TagProps {
  variant?: 'filled' | 'outlined' | 'light'
  rounded?: 'default' | 'full' | 'none'
  size?: 'small' | 'medium' | 'large'
  animate?: boolean
}

/**
 * 自定义标签组件
 * 扩展Ant Design的Tag组件，添加更多样式选项
 */
const Tag: React.FC<CustomTagProps> = ({
  children,
  color = 'blue',
  variant = 'filled',
  rounded = 'default',
  size = 'medium',
  animate = false,
  className = '',
  ...props
}) => {
  // 根据尺寸获取对应的样式类
  const getSizeClass = () => {
    switch(size) {
      case 'small':
        return 'text-xs px-2 py-0.5';
      case 'large':
        return 'text-sm px-3.5 py-1.5';
      default:
        return 'text-xs px-2.5 py-1';
    }
  };
  
  // 根据圆角设置获取样式类
  const getRoundedClass = () => {
    switch(rounded) {
      case 'full':
        return 'rounded-full';
      case 'none':
        return 'rounded-none';
      default:
        return 'rounded';
    }
  };
  
  // 根据变体获取样式类
  const getVariantClass = () => {
    switch(variant) {
      case 'outlined':
        return `bg-transparent border border-${color}-500 text-${color}-500 dark:border-${color}-400 dark:text-${color}-400`;
      case 'light':
        return `bg-${color}-50 text-${color}-700 dark:bg-${color}-900 dark:bg-opacity-20 dark:text-${color}-400`;
      default:
        return `bg-${color}-500 text-white dark:bg-${color}-600`;
    }
  };
  
  // 组合所有样式类
  const tagClass = clsx(
    getSizeClass(),
    getRoundedClass(),
    getVariantClass(),
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    className
  );

  // 基础标签
  const baseTag = (
    <AntTag
      {...props}
      className={tagClass}
      color={undefined} // 我们不使用Ant Design的颜色系统，而是使用我们自己的
    >
      {children}
    </AntTag>
  );
  
  // 带动画效果的标签
  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {baseTag}
      </motion.div>
    );
  }
  
  return baseTag;
};

export default Tag; 