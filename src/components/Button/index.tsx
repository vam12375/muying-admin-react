import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hoverButtonAnimation } from '@/components/animations/MotionVariants';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  animation?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  block = false,
  onClick,
  className,
  type = 'button',
  animation = true,
  ...props
}) => {
  // 变体样式映射
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 shadow-sm hover:shadow',
    secondary: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow',
    outline: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30',
    link: 'bg-transparent text-primary-500 hover:underline p-0 shadow-none',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white dark:text-gray-200 hover:bg-white/30 shadow-sm hover:shadow'
  };

  // 尺寸样式映射
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12'
  };

  // 圆角样式映射
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // 定义基础按钮props
  const motionProps: HTMLMotionProps<"button"> = {
    disabled: disabled || loading,
    onClick: !disabled && !loading ? onClick : undefined,
    type,
    whileTap: !disabled && animation ? { scale: 0.97 } : undefined,
    whileHover: !disabled && animation ? { scale: 1.02 } : undefined,
    transition: { duration: 0.2 },
    className: cn(
      // 基础样式
      'inline-flex items-center justify-center font-medium transition-all',
      // 条件样式
      variantStyles[variant],
      sizeStyles[size],
      roundedStyles[rounded],
      {
        'w-full': block,
        'opacity-60 cursor-not-allowed': disabled,
        'relative': loading,
      },
      className
    )
  };

  // 加载动画组件
  const LoadingSpinner = () => (
    <svg 
      className={cn(
        "animate-spin", 
        leftIcon ? "-ml-1 mr-2" : "-ml-1 mr-2"
      )}
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );

  return (
    <motion.button {...motionProps}>
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button; 