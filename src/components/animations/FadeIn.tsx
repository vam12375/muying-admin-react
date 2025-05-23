import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
  y?: number
  x?: number
  staggerChildren?: number
}

/**
 * 淡入动画组件
 * 用于元素的渐入效果
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  once = true,
  y = 0,
  x = 0,
  staggerChildren
}) => {
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
    hidden: { opacity: 0, y, x },
    show: { 
      opacity: 1, 
      y: 0, 
      x: 0,
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
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay
      }}
    >
      {children}
    </motion.div>
  )
}

export const FadeInItem: React.FC<{children: ReactNode, className?: string}> = ({
  children,
  className = ''
}) => (
  <motion.div
    className={clsx(className)}
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
  >
    {children}
  </motion.div>
)

export default FadeIn 