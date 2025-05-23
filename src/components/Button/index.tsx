import { ReactNode } from 'react'
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ButtonProps extends AntButtonProps {
  animated?: boolean
  glow?: boolean
  rounded?: 'default' | 'full'
  variant?: 'solid' | 'outline' | 'ghost' | 'link'
  shade?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'text'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children?: ReactNode
}

/**
 * 自定义按钮组件
 * 扩展Ant Design按钮，添加动画效果和更多设计变体
 */
const Button: React.FC<ButtonProps> = ({
  children,
  animated = false,
  glow = false,
  rounded = 'default',
  variant = 'solid',
  shade = 'primary',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // 获取按钮类型
  const getButtonType = () => {
    if (variant === 'solid') {
      switch (shade) {
        case 'primary': return 'primary'
        case 'secondary': return 'default'
        case 'success': return 'default'
        case 'warning': return 'default'
        case 'danger': return 'primary' // danger属性另外设置
        case 'text': return 'text'
        default: return 'default'
      }
    } else if (variant === 'link') {
      return 'link'
    }
    return 'default'
  }

  // 获取按钮是否为危险状态
  const getDanger = () => {
    return shade === 'danger'
  }
  
  // 获取自定义样式
  const getCustomStyles = () => {
    const base = []
    
    // 圆角样式
    if (rounded === 'full') {
      base.push('rounded-full')
    }
    
    // 变体样式
    if (variant === 'outline') {
      base.push('border border-current hover:bg-opacity-10 bg-transparent')
    } else if (variant === 'ghost') {
      base.push('border-0 bg-transparent hover:bg-opacity-10')
    }
    
    // 颜色样式 (非primary和danger，因为这些由antd处理)
    if (variant !== 'solid' || (shade !== 'primary' && shade !== 'danger' && shade !== 'default')) {
      switch (shade) {
        case 'secondary':
          base.push('text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300')
          if (variant === 'outline' || variant === 'ghost') {
            base.push('hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20')
          }
          break
        case 'success':
          base.push('text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300')
          if (variant === 'outline' || variant === 'ghost') {
            base.push('hover:bg-green-50 dark:hover:bg-green-900 dark:hover:bg-opacity-20')
          }
          break
        case 'warning':
          base.push('text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300')
          if (variant === 'outline' || variant === 'ghost') {
            base.push('hover:bg-yellow-50 dark:hover:bg-yellow-900 dark:hover:bg-opacity-20')
          }
          break
      }
    }
    
    // 发光效果
    if (glow && variant === 'solid') {
      switch (shade) {
        case 'primary':
          base.push('shadow-md shadow-blue-200 dark:shadow-blue-900 dark:shadow-opacity-20')
          break
        case 'success':
          base.push('shadow-md shadow-green-200 dark:shadow-green-900 dark:shadow-opacity-20')
          break
        case 'warning':
          base.push('shadow-md shadow-yellow-200 dark:shadow-yellow-900 dark:shadow-opacity-20')
          break
        case 'danger':
          base.push('shadow-md shadow-red-200 dark:shadow-red-900 dark:shadow-opacity-20')
          break
      }
    }
    
    // 动画效果
    if (animated) {
      base.push('btn-animated')
    }
    
    return base.join(' ')
  }
  
  // 按钮内容
  const buttonContent = (
    <>
      {icon && iconPosition === 'left' && <span className="mr-1">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-1">{icon}</span>}
    </>
  )
  
  // 组合最终className
  const combinedClassName = clsx(className, getCustomStyles())

  // 基础按钮
  const baseButton = (
    <AntButton
      type={getButtonType()}
      danger={getDanger()}
      className={combinedClassName}
      {...props}
    >
      {buttonContent}
    </AntButton>
  )
  
  // 带点击动画的按钮
  if (animated) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ translateY: -2 }}
      >
        {baseButton}
      </motion.div>
    )
  }
  
  return baseButton
}

export default Button 