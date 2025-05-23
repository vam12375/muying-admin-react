import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Notification, { NotificationType } from '.'

// 通知项接口
interface NotificationItem {
  id: string | number
  title: string
  message: string
  type: NotificationType
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showIcon?: boolean
  showProgress?: boolean
  action?: ReactNode
}

// 通知管理器上下文接口
interface NotificationContextType {
  notify: (options: Omit<NotificationItem, 'id'>) => string | number
  success: (title: string, message: string, options?: Partial<Omit<NotificationItem, 'id' | 'title' | 'message' | 'type'>>) => string | number
  error: (title: string, message: string, options?: Partial<Omit<NotificationItem, 'id' | 'title' | 'message' | 'type'>>) => string | number
  warning: (title: string, message: string, options?: Partial<Omit<NotificationItem, 'id' | 'title' | 'message' | 'type'>>) => string | number
  info: (title: string, message: string, options?: Partial<Omit<NotificationItem, 'id' | 'title' | 'message' | 'type'>>) => string | number
  remove: (id: string | number) => void
  clearAll: () => void
}

// 创建通知上下文
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// 通知管理器Props
interface NotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
  defaultPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  defaultDuration?: number
}

/**
 * 通知管理器提供者
 * 管理多个通知的显示、隐藏和定位
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultPosition = 'top-right',
  defaultDuration = 4500,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  
  // 创建传送门容器元素
  useEffect(() => {
    // 检查是否已存在通知容器
    let container = document.getElementById('notification-portal')
    
    if (!container) {
      container = document.createElement('div')
      container.id = 'notification-portal'
      document.body.appendChild(container)
    }
    
    setPortalContainer(container)
    
    // 清理函数
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }, [])
  
  // 添加通知
  const notify = (options: Omit<NotificationItem, 'id'>) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5)
    
    setNotifications(prev => {
      // 如果超出最大数量，移除最旧的通知
      const newNotifications = [...prev]
      if (newNotifications.length >= maxNotifications) {
        newNotifications.shift()
      }
      
      return [
        ...newNotifications,
        { 
          id, 
          ...options,
          position: options.position || defaultPosition,
          duration: options.duration !== undefined ? options.duration : defaultDuration
        }
      ]
    })
    
    return id
  }
  
  // 移除通知
  const remove = (id: string | number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }
  
  // 清除所有通知
  const clearAll = () => {
    setNotifications([])
  }
  
  // 预定义类型通知方法
  const success = (title: string, message: string, options = {}) => 
    notify({ title, message, type: 'success', ...options })
    
  const error = (title: string, message: string, options = {}) => 
    notify({ title, message, type: 'error', ...options })
    
  const warning = (title: string, message: string, options = {}) => 
    notify({ title, message, type: 'warning', ...options })
    
  const info = (title: string, message: string, options = {}) => 
    notify({ title, message, type: 'info', ...options })
  
  // 按位置分组通知
  const groupByPosition = () => {
    const groups: Record<string, NotificationItem[]> = {
      'top-right': [],
      'top-left': [],
      'bottom-right': [],
      'bottom-left': []
    }
    
    notifications.forEach(notification => {
      const position = notification.position || defaultPosition
      if (!groups[position]) groups[position] = []
      groups[position].push(notification)
    })
    
    return groups
  }
  
  const notificationGroups = groupByPosition()
  
  return (
    <NotificationContext.Provider value={{ 
      notify, success, error, warning, info, remove, clearAll 
    }}>
      {children}
      
      {portalContainer && createPortal(
        <>
          {Object.entries(notificationGroups).map(([position, notificationsForPosition]) => (
            <div key={position} className={`fixed z-50 ${position.replace('-', '-4 ')} space-y-2`}>
              {notificationsForPosition.map(notification => (
                <Notification
                  key={notification.id}
                  {...notification}
                  onClose={() => remove(notification.id)}
                />
              ))}
            </div>
          ))}
        </>,
        portalContainer
      )}
    </NotificationContext.Provider>
  )
}

/**
 * 自定义Hook: useNotification
 * 用于在组件中方便地使用通知系统
 */
export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}

export default NotificationProvider

// 导出NotificationContext以供其他模块使用
export { NotificationContext } 