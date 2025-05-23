import React from 'react'
import { Avatar as AntAvatar } from 'antd'
import type { AvatarProps as AntAvatarProps } from 'antd'
import clsx from 'clsx'
import StatusIndicator from '../StatusIndicator'
import { motion } from 'framer-motion'

type StatusType = 'online' | 'offline' | 'away' | 'busy' | null

interface CustomAvatarProps extends Omit<AntAvatarProps, 'status'> {
  status?: StatusType
  statusPosition?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  statusSize?: 'small' | 'default' | 'large'
  statusPing?: boolean
  animation?: boolean
  variant?: 'circular' | 'rounded' | 'square'
  bordered?: boolean
  hoverable?: boolean
  onClick?: () => void
}

/**
 * 自定义头像组件
 * 扩展Ant Design的Avatar组件，添加状态指示器和更多样式选项
 */
const Avatar: React.FC<CustomAvatarProps> = ({
  status,
  statusPosition = 'bottom-right',
  statusSize = 'default',
  statusPing = false,
  animation = false,
  variant = 'circular',
  bordered = false,
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  // 获取形状样式
  const getShapeClass = () => {
    switch (variant) {
      case 'rounded':
        return 'rounded-lg'
      case 'square':
        return 'rounded-none'
      default:
        return 'rounded-full'
    }
  }

  // 获取状态指示器位置样式
  const getStatusPositionClass = () => {
    switch (statusPosition) {
      case 'top-right':
        return 'top-0 right-0'
      case 'bottom-left':
        return 'bottom-0 left-0'
      case 'top-left':
        return 'top-0 left-0'
      default:
        return 'bottom-0 right-0'
    }
  }

  // 组合样式类
  const avatarClass = clsx(
    'relative inline-block',
    getShapeClass(),
    bordered && 'ring-2 ring-white dark:ring-gray-800',
    hoverable && 'cursor-pointer transform transition-all duration-200 hover:shadow-lg',
    className
  )

  const antAvatarShape = variant === 'circular' ? 'circle' : 'square'

  // 基础头像
  const baseAvatar = (
    <div 
      className={avatarClass}
      onClick={onClick}
    >
      <AntAvatar
        {...props}
        shape={antAvatarShape}
      />
      
      {status && (
        <div className={clsx(
          'absolute',
          getStatusPositionClass()
        )}>
          <StatusIndicator 
            type={status} 
            size={statusSize}
            ping={statusPing}
          />
        </div>
      )}
    </div>
  )

  // 带动画效果的头像
  if (animation) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        whileHover={hoverable ? { scale: 1.05 } : undefined}
        className="inline-block"
      >
        {baseAvatar}
      </motion.div>
    )
  }

  return baseAvatar
}

export default Avatar 