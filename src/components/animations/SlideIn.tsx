import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

type SlideDirection = 'left' | 'right' | 'up' | 'down'

interface SlideInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: SlideDirection
  distance?: number
  once?: boolean
  staggerChildren?: number
}

/**
 * 滑入动画组件
 * 用于元素从不同方向滑入的动画效果
 */
const SlideIn: React.FC<SlideInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  direction = 'left',
  distance = 50,
  once = true,
  staggerChildren
}) => {
  // 根据方向获取初始偏移量
  const getInitialOffset = () => {
    switch (direction) {
      case 'left': return { x: -distance, y: 0 }
      case 'right': return { x: distance, y: 0 }
      case 'up': return { x: 0, y: -distance }
      case 'down': return { x: 0, y: distance }
      default: return { x: -distance, y: 0 }
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren || 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, ...getInitialOffset() },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay
      }
    }
  }

  return staggerChildren ? (
    <motion.div
      className={clsx(className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, ...getInitialOffset() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 12
      }}
    >
      {children}
    </motion.div>
  )
}

export const SlideInItem: React.FC<{
  children: ReactNode, 
  className?: string,
  direction?: SlideDirection,
  distance?: number
}> = ({
  children,
  className = '',
  direction = 'left',
  distance = 50
}) => {
  const getOffset = () => {
    switch (direction) {
      case 'left': return { x: -distance }
      case 'right': return { x: distance }
      case 'up': return { y: -distance }
      case 'down': return { y: distance }
      default: return { x: -distance }
    }
  }

  return (
    <motion.div
      className={clsx(className)}
      variants={{
        hidden: { opacity: 0, ...getOffset() },
        show: { 
          opacity: 1, 
          x: 0, 
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export default SlideIn 