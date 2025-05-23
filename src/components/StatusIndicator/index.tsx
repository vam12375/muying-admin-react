import React from 'react'
import clsx from 'clsx'

type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'success' | 'error' | 'warning' | 'info' | 'processing'

interface StatusIndicatorProps {
  type: StatusType
  text?: string
  size?: 'small' | 'default' | 'large'
  ping?: boolean
  className?: string
}

/**
 * 状态指示器组件
 * 用于显示各种状态，如在线、离线、成功、错误等
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  text,
  size = 'default',
  ping = false,
  className = ''
}) => {
  // 根据状态类型获取颜色样式
  const getColorClass = () => {
    switch (type) {
      case 'online':
      case 'success':
        return 'bg-green-500 dark:bg-green-400'
      case 'offline':
      case 'error':
        return 'bg-red-500 dark:bg-red-400'
      case 'away':
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-400'
      case 'busy':
      case 'processing':
        return 'bg-blue-500 dark:bg-blue-400'
      case 'info':
      default:
        return 'bg-gray-500 dark:bg-gray-400'
    }
  }

  // 根据尺寸获取样式
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-1.5 h-1.5'
      case 'large':
        return 'w-3 h-3'
      default:
        return 'w-2 h-2'
    }
  }

  // 文本颜色
  const getTextColorClass = () => {
    switch (type) {
      case 'online':
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'offline':
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'away':
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'busy':
      case 'processing':
        return 'text-blue-600 dark:text-blue-400'
      case 'info':
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  // 文本字体大小
  const getTextSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs'
      case 'large':
        return 'text-sm'
      default:
        return 'text-xs'
    }
  }

  return (
    <div className={clsx(
      'flex items-center',
      className
    )}>
      <span className="relative flex">
        <span className={clsx(
          'rounded-full',
          getSizeClass(),
          getColorClass()
        )} />
        
        {ping && (
          <span className={clsx(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            getColorClass()
          )} />
        )}
      </span>
      
      {text && (
        <span className={clsx(
          'ml-1.5 font-medium',
          getTextColorClass(),
          getTextSizeClass()
        )}>
          {text}
        </span>
      )}
    </div>
  )
}

export default StatusIndicator 