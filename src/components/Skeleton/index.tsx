import React from 'react'
import { cn } from '@/lib/utils'

type SkeletonVariant = 'text' | 'circle' | 'avatar' | 'rectangular' | 'card' | 'list' | 'table' | 'statistic' | 'chart'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  className?: string
  animation?: 'pulse' | 'shimmer' | 'none'
  count?: number
  inline?: boolean
  rounded?: boolean
  roundedFull?: boolean
}

/**
 * 骨架屏组件
 * 用于内容加载过程中显示的占位UI
 * 支持多种形状、动画和尺寸
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  animation = 'pulse',
  count = 1,
  inline = false,
  rounded = true,
  roundedFull = false,
}) => {
  // 根据变体类型确定默认高度
  const getDefaultHeight = (): string | number => {
    switch (variant) {
      case 'text':
        return '1rem'
      case 'circle':
      case 'avatar':
        return '3rem'
      case 'rectangular':
        return '8rem'
      case 'card':
        return '12rem'
      case 'list':
        return '4rem'
      case 'table':
        return '12rem'
      case 'statistic':
        return '6rem'
      case 'chart':
        return '16rem'
      default:
        return '1rem'
    }
  }

  // 根据变体类型确定默认宽度
  const getDefaultWidth = (): string | number => {
    switch (variant) {
      case 'text':
        return '100%'
      case 'circle':
      case 'avatar':
        return '3rem'
      case 'rectangular':
        return '100%'
      case 'card':
        return '100%'
      case 'list':
        return '100%'
      case 'table':
        return '100%'
      case 'statistic':
        return '100%'
      case 'chart':
        return '100%'
      default:
        return '100%'
    }
  }

  // 动画类名
  const animationClassName = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  }

  // 骨架屏基础样式
  const baseClassName = cn(
    'bg-gray-200 dark:bg-gray-700',
    rounded && !roundedFull && 'rounded',
    roundedFull && 'rounded-full',
    animationClassName[animation],
    inline && 'inline-block',
    className
  )

  // 渲染特定变体的骨架屏
  const renderVariant = () => {
    switch (variant) {
      case 'text':
        return renderMultiple(() => (
          <div
            className={baseClassName}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
              marginBottom: count > 1 ? '0.5rem' : undefined,
            }}
          />
        ))

      case 'circle':
      case 'avatar':
        return (
          <div
            className={cn(baseClassName, 'rounded-full')}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          />
        )

      case 'card':
        return (
          <div
            className={cn(baseClassName, 'overflow-hidden')}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          >
            <div className="h-1/3 w-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="p-4">
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 w-4/5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        )

      case 'list':
        return renderMultiple(() => (
          <div
            className={cn(baseClassName, 'flex items-center p-3 mb-2')}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
            <div className="flex-1">
              <div className="h-3 w-3/5 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-2 w-4/5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))

      case 'table':
        return (
          <div
            className={baseClassName}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          >
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-600 rounded-t"></div>
            <div className="px-3 py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center py-2">
                  <div className="h-3 w-1/5 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                  <div className="h-3 w-1/5 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                  <div className="h-3 w-1/5 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                  <div className="h-3 w-1/5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'statistic':
        return (
          <div
            className={baseClassName}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          >
            <div className="p-4">
              <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-2 w-2/5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        )
        
      case 'chart':
        return (
          <div
            className={baseClassName}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
            }}
          >
            <div className="flex flex-col h-full">
              <div className="h-8 w-1/4 bg-gray-300 dark:bg-gray-600 rounded m-4 mb-0"></div>
              <div className="flex-1 flex items-end justify-around p-4">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1/12 bg-gray-300 dark:bg-gray-600 rounded-t"
                    style={{ height: `${15 + Math.random() * 70}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return renderMultiple(() => (
          <div
            className={baseClassName}
            style={{
              width: width || getDefaultWidth(),
              height: height || getDefaultHeight(),
              marginBottom: count > 1 ? '0.5rem' : undefined,
            }}
          />
        ))
    }
  }

  // 渲染多个相同的占位元素
  const renderMultiple = (renderFn: () => JSX.Element) => {
    if (count === 1) return renderFn()

    return (
      <>
        {[...Array(count)].map((_, i) => (
          <React.Fragment key={i}>{renderFn()}</React.Fragment>
        ))}
      </>
    )
  }

  return renderVariant()
}

export default Skeleton 