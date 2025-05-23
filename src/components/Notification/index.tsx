import React, { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  CloseCircleOutlined,
  CloseOutlined
} from '@ant-design/icons'

export type NotificationType = 'success' | 'warning' | 'info' | 'error'

interface NotificationProps {
  id: string | number
  title: string
  message: string
  type?: NotificationType
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  onClose?: () => void
  showIcon?: boolean
  showProgress?: boolean
  action?: ReactNode
}

/**
 * 自定义通知提示组件
 * 支持多种类型和动画效果
 */
const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 4500,
  position = 'top-right',
  onClose,
  showIcon = true,
  showProgress = true,
  action
}) => {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(true)
  
  // 计算位置样式
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }
  
  // 根据类型获取颜色和图标
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleOutlined />,
          bgColor: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-500 dark:border-green-600',
          progressColor: 'bg-green-500 dark:bg-green-600'
        }
      case 'warning':
        return {
          icon: <ExclamationCircleOutlined />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          borderColor: 'border-yellow-500 dark:border-yellow-600',
          progressColor: 'bg-yellow-500 dark:bg-yellow-600'
        }
      case 'error':
        return {
          icon: <CloseCircleOutlined />,
          bgColor: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-500 dark:border-red-600',
          progressColor: 'bg-red-500 dark:bg-red-600'
        }
      case 'info':
      default:
        return {
          icon: <InfoCircleOutlined />,
          bgColor: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-500 dark:border-blue-600',
          progressColor: 'bg-blue-500 dark:bg-blue-600'
        }
    }
  }
  
  const typeStyles = getTypeStyles()
  
  // 自动关闭计时器
  useEffect(() => {
    if (duration === 0) return
    
    let timer: ReturnType<typeof setTimeout>
    let interval: ReturnType<typeof setInterval>
    
    // 进度条计时
    if (showProgress && duration > 0) {
      const intervalTime = 10
      const decrementPerInterval = (intervalTime / duration) * 100
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval)
            return 0
          }
          return prev - decrementPerInterval
        })
      }, intervalTime)
    }
    
    // 关闭通知计时
    timer = setTimeout(() => {
      handleClose()
    }, duration)
    
    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [duration, showProgress])
  
  // 处理关闭
  const handleClose = () => {
    setIsVisible(false)
    // 等待退出动画完成后调用外部关闭方法
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`notification-${id}`}
          initial={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
          className={clsx(
            'notification-container fixed z-50 w-80 overflow-hidden rounded-lg shadow-lg border-l-4',
            getPositionClass(),
            typeStyles.bgColor,
            typeStyles.borderColor
          )}
        >
          <div className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div className="flex">
                {showIcon && (
                  <div className={clsx('mr-3 text-lg pt-0.5', typeStyles.textColor)}>
                    {typeStyles.icon}
                  </div>
                )}
                
                <div className="flex-1 pr-2">
                  <h4 className={clsx('font-medium text-sm', typeStyles.textColor)}>
                    {title}
                  </h4>
                  <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {message}
                  </div>
                  
                  {action && (
                    <div className="mt-2">
                      {action}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <CloseOutlined style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
          
          {showProgress && (
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-800">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                className={clsx('h-full', typeStyles.progressColor)}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Notification 

// 导出NotificationManager模块的内容
export * from './NotificationManager' 