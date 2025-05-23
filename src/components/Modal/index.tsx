import React from 'react'
import type { ReactNode } from 'react'
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { useTheme } from '@/theme/useTheme'

interface ModalProps extends AntModalProps {
  children: ReactNode
  animation?: 'fade' | 'scale' | 'slideUp' | 'slideDown'
  centered?: boolean
  width?: number | string
  bodyClassName?: string
  footerClassName?: string
  headerClassName?: string
  showCloseButton?: boolean
}

/**
 * 自定义模态框组件
 * 扩展Ant Design的Modal组件，添加动画和主题支持
 */
const Modal: React.FC<ModalProps> = ({
  children,
  animation = 'scale',
  centered = true,
  width = 520,
  className = '',
  bodyClassName = '',
  footerClassName = '',
  headerClassName = '',
  showCloseButton = true,
  ...props
}) => {
  const { isDark } = useTheme()
  
  // 根据动画类型获取相应的动画配置
  const getAnimationProps = () => {
    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
      default:
        return {}
    }
  }
  
  // 模态框根类名
  const modalClass = clsx(
    className,
    'custom-modal',
    isDark ? 'modal-dark' : 'modal-light'
  )

  // 模态框头部类名
  const headerClass = clsx(
    headerClassName,
    'px-6 py-4 border-b',
    isDark ? 'border-gray-700' : 'border-gray-200'
  )

  // 模态框内容类名
  const bodyClass = clsx(
    bodyClassName,
    'p-6'
  )

  // 模态框底部类名
  const footerClass = clsx(
    footerClassName,
    'px-6 py-4 border-t flex justify-end space-x-2',
    isDark ? 'border-gray-700' : 'border-gray-200'
  )

  return (
    <AnimatePresence>
      {props.open && (
        <AntModal
          centered={centered}
          width={width}
          className={modalClass}
          closeIcon={showCloseButton}
          maskClosable={true}
          {...props}
          modalRender={modal => (
            <motion.div {...getAnimationProps()}>
              {modal}
            </motion.div>
          )}
          styles={{
            header: { padding: 0 },
            body: { padding: 0 },
            footer: { padding: 0 },
            mask: { backdropFilter: 'blur(4px)' },
            content: {
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            }
          }}
          classNames={{
            header: headerClass,
            body: bodyClass,
            footer: footerClass
          }}
        >
          {children}
        </AntModal>
      )}
    </AnimatePresence>
  )
}

export default Modal 