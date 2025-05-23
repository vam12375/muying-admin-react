import { type ReactNode } from 'react'
import { Card as AntCard } from 'antd'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useTheme } from '@/theme/useTheme'

interface CardProps {
  children: ReactNode
  title?: ReactNode
  extra?: ReactNode
  loading?: boolean
  hoverable?: boolean
  bordered?: boolean
  className?: string
  bodyClassName?: string
  onClick?: () => void
  animate?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * 自定义卡片组件
 * 扩展Ant Design卡片，添加动画和主题支持
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  extra,
  loading = false,
  hoverable = false,
  bordered = true,
  className = '',
  bodyClassName = '',
  onClick,
  animate = false,
  shadow = 'sm'
}) => {
  const { isDark } = useTheme()

  // 阴影样式
  const getShadowClass = () => {
    switch (shadow) {
      case 'none': return ''
      case 'sm': return isDark ? 'shadow-sm shadow-gray-900' : 'shadow-sm shadow-gray-200'
      case 'md': return isDark ? 'shadow-md shadow-gray-900' : 'shadow-md shadow-gray-200'
      case 'lg': return isDark ? 'shadow-lg shadow-gray-900' : 'shadow-lg shadow-gray-200'
      default: return isDark ? 'shadow-sm shadow-gray-900' : 'shadow-sm shadow-gray-200'
    }
  }

  // 基础卡片样式
  const cardClass = clsx(
    className,
    getShadowClass(),
    'transition-all duration-300',
    {
      'cursor-pointer': onClick || hoverable,
      'card-hover': hoverable,
      'border-gray-100 dark:border-gray-800': bordered,
      'bg-white dark:bg-gray-800': true
    }
  )

  // 卡片主体样式
  const bodyClass = clsx(
    bodyClassName,
    'transition-colors duration-300'
  )

  // 最终类名合并
  const finalClassName = clsx(cardClass, bodyClass)

  // 基础卡片
  const baseCard = (
    <AntCard
      title={title}
      extra={extra}
      loading={loading}
      hoverable={hoverable}
      variant={bordered ? 'outlined' : 'borderless'}
      className={finalClassName}
      onClick={onClick}
      styles={{ 
        body: { padding: '1rem' },
        header: { 
          borderBottom: isDark ? '1px solid #374151' : '1px solid #f3f4f6',
          backgroundColor: isDark ? '#1f2937' : '#fff',
          color: isDark ? '#f9fafb' : '#1f2937'
        }
      }}
    >
      {children}
    </AntCard>
  )

  // 带动画的卡片
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.5,
          type: 'spring',
          stiffness: 100,
          damping: 10
        }}
      >
        {baseCard}
      </motion.div>
    )
  }

  return baseCard
}

export default Card 