import React from 'react'
import { Card } from 'antd'
import { motion } from 'framer-motion'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from '@ant-design/icons'
import clsx from 'clsx'
import { useTheme } from '@/theme/useTheme'

interface TrendProps {
  value: number
  isUpward: boolean
  text?: string
}

interface StatsCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  trend?: TrendProps
  duration?: number
  className?: string
  onClick?: () => void
}

/**
 * 统计卡片组件
 * 用于仪表盘显示关键数据指标
 */
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon,
  color = 'default',
  trend,
  duration = 0.8,
  className = '',
  onClick
}) => {
  const { isDark } = useTheme()

  // 根据颜色获取样式类
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return {
          icon: isDark ? 'bg-blue-600 bg-opacity-20 text-blue-400' : 'bg-blue-50 text-blue-600',
          value: 'text-blue-600 dark:text-blue-400',
          trend: {
            up: 'text-blue-600 dark:text-blue-400',
            down: 'text-blue-600 dark:text-blue-400'
          }
        }
      case 'success':
        return {
          icon: isDark ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-green-50 text-green-600',
          value: 'text-green-600 dark:text-green-400',
          trend: {
            up: 'text-green-600 dark:text-green-400',
            down: 'text-green-600 dark:text-green-400'
          }
        }
      case 'warning':
        return {
          icon: isDark ? 'bg-yellow-600 bg-opacity-20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
          value: 'text-yellow-600 dark:text-yellow-400',
          trend: {
            up: 'text-yellow-600 dark:text-yellow-400',
            down: 'text-yellow-600 dark:text-yellow-400'
          }
        }
      case 'danger':
        return {
          icon: isDark ? 'bg-red-600 bg-opacity-20 text-red-400' : 'bg-red-50 text-red-600',
          value: 'text-red-600 dark:text-red-400',
          trend: {
            up: 'text-red-600 dark:text-red-400',
            down: 'text-red-600 dark:text-red-400'
          }
        }
      default:
        return {
          icon: isDark ? 'bg-gray-600 bg-opacity-20 text-gray-400' : 'bg-gray-50 text-gray-600',
          value: 'text-gray-700 dark:text-gray-300',
          trend: {
            up: 'text-gray-600 dark:text-gray-400',
            down: 'text-gray-600 dark:text-gray-400'
          }
        }
    }
  }

  const colorClass = getColorClass()

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <Card
      className={clsx(
        'h-full overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white',
        className
      )}
      styles={{ 
        body: { padding: '24px' }
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            {title}
          </div>
          
          <motion.div 
            className={clsx('text-2xl font-bold', colorClass.value)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration }}
            >
              {prefix && <span className="mr-0.5">{prefix}</span>}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { duration: 0.5, delay: 0.2 }
                }}
              >
                {formatNumber(value)}
              </motion.span>
              {suffix && <span className="ml-0.5">{suffix}</span>}
            </motion.span>
          </motion.div>
          
          {trend && (
            <motion.div 
              className="flex items-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className={clsx(
                'flex items-center text-xs font-medium',
                trend.isUpward ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {trend.isUpward ? 
                  <ArrowUpOutlined style={{ fontSize: '12px' }} /> : 
                  <ArrowDownOutlined style={{ fontSize: '12px' }} />
                }
                <span className="ml-0.5">{trend.value}%</span>
              </span>
              {trend.text && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  {trend.text}
                </span>
              )}
            </motion.div>
          )}
        </div>
        
        {icon && (
          <motion.div 
            className={clsx(
              'p-3 rounded-full',
              colorClass.icon
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2
            }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </Card>
  )
}

export default StatsCard 