import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface PageTransitionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

/**
 * 页面过渡动画组件
 * 用于包装页面内容，提供平滑入场动画
 */
const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up'
}) => {
  // 根据方向设置不同的动画初始值
  const getInitial = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 30 }
      case 'down': return { opacity: 0, y: -30 }
      case 'left': return { opacity: 0, x: 30 }
      case 'right': return { opacity: 0, x: -30 }
      default: return { opacity: 0 }
    }
  }
  
  return (
    <motion.div
      className={clsx('w-full', className)}
      initial={getInitial()}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition 