import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  fadeAnimation,
  slideUpAnimation,
  slideDownAnimation,
  slideRightAnimation,
  slideLeftAnimation,
  scaleAnimation,
  bounceAnimation,
  glassCardAnimation
} from './MotionVariants';

type AnimationVariant = 
  | 'fade' 
  | 'slideUp' 
  | 'slideDown' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'scale' 
  | 'bounce'
  | 'glass';

interface MotionWrapperProps {
  children: React.ReactNode;
  animation?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  custom?: any;
  style?: React.CSSProperties;
  responsive?: boolean;
  mobileAnimation?: AnimationVariant;
}

/**
 * 动画包装组件
 * 为子元素提供预设的动画效果
 * 支持响应式动画和查看阈值控制
 */
const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  animation = 'fade',
  mobileAnimation,
  delay = 0,
  duration,
  once = true,
  threshold = 0.1,
  className,
  staggerChildren = false,
  staggerDelay = 0.1,
  custom,
  style,
  responsive = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationVariant>(animation);
  
  // 检测设备类型
  useEffect(() => {
    if (!responsive) return;
    
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // 如果提供了移动端动画且当前是移动设备，使用移动端动画
      if (mobileAnimation && mobile) {
        setCurrentAnimation(mobileAnimation);
      } else {
        setCurrentAnimation(animation);
      }
    };
    
    // 初始检查
    checkDevice();
    
    // 监听窗口变化
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [responsive, mobileAnimation, animation]);

  // 根据动画类型选择变体
  const getVariants = () => {
    switch (currentAnimation) {
      case 'fade':
        return fadeAnimation;
      case 'slideUp':
        return slideUpAnimation;
      case 'slideDown':
        return slideDownAnimation;
      case 'slideLeft':
        return slideLeftAnimation;
      case 'slideRight':
        return slideRightAnimation;
      case 'scale':
        return scaleAnimation;
      case 'bounce':
        return bounceAnimation;
      case 'glass':
        return glassCardAnimation;
      default:
        return fadeAnimation;
    }
  };

  // 设置动画配置
  const variants = getVariants();
  
  // 自定义过渡设置
  const customTransition = duration ? { 
    transition: { 
      duration,
      delay
    } 
  } : { 
    transition: { 
      delay 
    } 
  };

  // 子元素动画编排设置
  const staggerConfig = staggerChildren ? {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  } : {};

  // 组合动画属性
  const motionProps: HTMLMotionProps<"div"> = {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: variants,
    custom: custom,
    viewport: once ? { 
      once: true, 
      margin: "0px 0px -100px 0px",
      amount: threshold
    } : undefined,
    whileInView: once ? "animate" : undefined,
    className: cn(className),
    style: style,
    ...customTransition,
    ...staggerConfig
  };

  return (
    <motion.div {...motionProps}>
      {children}
    </motion.div>
  );
};

export default MotionWrapper; 