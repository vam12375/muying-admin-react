import React, { ReactNode } from 'react'
import { Badge as AntBadge } from 'antd'
import type { BadgeProps as AntBadgeProps } from 'antd'
import clsx from 'clsx'
import { motion } from 'framer-motion'

interface CustomBadgeProps extends Omit<AntBadgeProps, 'status' | 'color'> {
  children?: ReactNode
  variant?: 'filled' | 'outlined' | 'dot'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  pulse?: boolean
  size?: 'small' | 'default' | 'large'
  className?: string
  animate?: boolean
}

/**
 * 自定义徽标组件
 * 扩展Ant Design的Badge组件，添加更多样式选项和动画效果
 */
const Badge: React.FC<CustomBadgeProps> = ({
  children,
  variant = 'filled',
  color = 'primary',
  pulse = false,
  size = 'default',
  animate = false,
  className = '',
  ...props
}) => {
  // 根据颜色获取对应的样式类
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-blue-500 dark:bg-blue-600',
          border: 'border-blue-500 dark:border-blue-600',
          text: 'text-blue-500 dark:text-blue-400'
        }
      case 'success':
        return {
          bg: 'bg-green-500 dark:bg-green-600',
          border: 'border-green-500 dark:border-green-600',
          text: 'text-green-500 dark:text-green-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500 dark:bg-yellow-600',
          border: 'border-yellow-500 dark:border-yellow-600',
          text: 'text-yellow-500 dark:text-yellow-400'
        }
      case 'danger':
        return {
          bg: 'bg-red-500 dark:bg-red-600',
          border: 'border-red-500 dark:border-red-600',
          text: 'text-red-500 dark:text-red-400'
        }
      default:
        return {
          bg: 'bg-gray-500 dark:bg-gray-600',
          border: 'border-gray-500 dark:border-gray-600',
          text: 'text-gray-500 dark:text-gray-400'
        }
    }
  }

  // 根据尺寸获取样式类
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'min-w-[16px] h-4 text-[10px] px-[4px]'
      case 'large':
        return 'min-w-[24px] h-6 text-xs px-[6px]'
      default:
        return 'min-w-[20px] h-5 text-xs px-[5px]'
    }
  }

  // 获取变体样式
  const getVariantClass = () => {
    const colorClass = getColorClass()
    
    switch (variant) {
      case 'outlined':
        return `bg-transparent border ${colorClass.border} ${colorClass.text}`
      case 'dot':
        return `w-2.5 h-2.5 p-0 rounded-full ${colorClass.bg}`
      default:
        return `${colorClass.bg} text-white border-transparent`
    }
  }

  // 自定义徽标样式
  const customBadgeClass = clsx(
    'flex items-center justify-center rounded-full',
    getVariantClass(),
    getSizeClass(),
    pulse && 'animate-pulse',
    className
  )

  // 传递自定义类名
  const badgeProps = {
    ...props,
    color: undefined, // 不使用Ant Design的颜色
    className: clsx(props.className, 'custom-badge')
  }

  // 如果是dot变体，使用Ant Design的status属性
  if (variant === 'dot') {
    return (
      <AntBadge
        {...badgeProps}
        count={
          <span className={customBadgeClass} />
        }
      >
        {children}
      </AntBadge>
    )
  }

  // 基础徽标
  const baseBadge = (
    <AntBadge
      {...badgeProps}
      count={props.count}
      overflowCount={props.overflowCount || 99}
      showZero={props.showZero}
      classNames={{
        count: customBadgeClass
      }}
    >
      {children}
    </AntBadge>
  )

  // 带动画效果的徽标
  if (animate && props.count) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        {baseBadge}
      </motion.div>
    )
  }

  return baseBadge
}

export default Badge 