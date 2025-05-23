import type { ThemeConfig } from 'antd'

// 定义主题类型
export type ThemeMode = 'light' | 'dark'

// 定义基础色彩
export const baseColors = {
  primary: '#3182ff',
  secondary: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  // 新增强调色
  accentPink: '#FF8FAB',
  accentBlue: '#91C8E4',
  accentGreen: '#A6CF98',
  accentYellow: '#FFEBA1',
}

// 检测系统是否偏好深色模式
export const prefersDarkMode = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 亮色主题变量
export const lightTheme = {
  // 基础色
  'bg-app': '#f5f7fa',
  'bg-base': '#ffffff',
  'bg-card': '#ffffff',
  'bg-card-hover': '#f9fafc',
  'bg-code': '#f5f7fa',
  'bg-modal': '#ffffff',
  'bg-popover': '#ffffff',
  'bg-input': '#ffffff',
  
  // 文本色
  'text-primary': '#1e293b',
  'text-secondary': '#475569',
  'text-tertiary': '#64748b',
  'text-disabled': '#94a3b8',
  'text-inverse': '#ffffff',
  
  // 边框色
  'border-base': '#e2e8f0',
  'border-focus': '#3182ff',
  'border-hover': '#cbd5e1',

  // 品牌色
  'primary-50': '#ebf5ff',
  'primary-100': '#e1effe',
  'primary-200': '#c3ddfd',
  'primary-300': '#a4cafe',
  'primary-400': '#76a9fa',
  'primary-500': '#3182ff',
  'primary-600': '#2563eb',
  'primary-700': '#1d4ed8',
  'primary-800': '#1e40af',
  'primary-900': '#1e3a8a',
  'primary-950': '#172554',
  
  // 成功色
  'success-50': '#f0fdf4',
  'success-100': '#dcfce7',
  'success-500': '#22c55e',
  'success-600': '#16a34a',
  'success-700': '#15803d',
  
  // 警告色
  'warning-50': '#fffbeb',
  'warning-100': '#fef3c7',
  'warning-500': '#f59e0b',
  'warning-600': '#d97706',
  'warning-700': '#b45309',
  
  // 错误色
  'danger-50': '#fef2f2',
  'danger-100': '#fee2e2',
  'danger-500': '#ef4444',
  'danger-600': '#dc2626',
  'danger-700': '#b91c1c',
  
  // 信息色
  'info-50': '#f0f9ff',
  'info-100': '#e0f2fe',
  'info-500': '#0ea5e9',
  'info-600': '#0284c7',
  'info-700': '#0369a1',

  // 母婴品牌特色色
  'accent-pink': '#FF8FAB',
  'accent-blue': '#91C8E4',
  'accent-green': '#A6CF98',
  'accent-yellow': '#FFEBA1',
  
  // 阴影
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
  'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'shadow-md': '0 6px 10px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'shadow-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.05)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  'shadow-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  'shadow-colored': '0 8px 16px -4px rgba(49, 130, 255, 0.2)',
  
  // 磨砂玻璃效果
  'glass-bg': 'rgba(255, 255, 255, 0.8)',
  'glass-border': 'rgba(255, 255, 255, 0.5)',
  'glass-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  'glass-backdrop': 'blur(10px)',
}

// 暗色主题变量
export const darkTheme = {
  // 基础色
  'bg-app': '#0f172a',
  'bg-base': '#1e293b',
  'bg-card': '#1e293b',
  'bg-card-hover': '#2d3748',
  'bg-code': '#15223b',
  'bg-modal': '#1e293b',
  'bg-popover': '#1e293b',
  'bg-input': '#1e293b',
  
  // 文本色
  'text-primary': '#f1f5f9',
  'text-secondary': '#cbd5e1',
  'text-tertiary': '#94a3b8',
  'text-disabled': '#64748b',
  'text-inverse': '#1e293b',
  
  // 边框色
  'border-base': '#334155',
  'border-focus': '#3182ff',
  'border-hover': '#475569',

  // 品牌色 (与亮色主题相同)
  'primary-50': '#ebf5ff',
  'primary-100': '#e1effe',
  'primary-200': '#c3ddfd',
  'primary-300': '#a4cafe',
  'primary-400': '#76a9fa',
  'primary-500': '#3182ff',
  'primary-600': '#2563eb',
  'primary-700': '#1d4ed8',
  'primary-800': '#1e40af',
  'primary-900': '#1e3a8a',
  'primary-950': '#172554',
  
  // 成功色
  'success-50': '#f0fdf4',
  'success-100': '#dcfce7',
  'success-500': '#22c55e',
  'success-600': '#16a34a',
  'success-700': '#15803d',
  
  // 警告色
  'warning-50': '#fffbeb',
  'warning-100': '#fef3c7',
  'warning-500': '#f59e0b',
  'warning-600': '#d97706',
  'warning-700': '#b45309',
  
  // 错误色
  'danger-50': '#fef2f2',
  'danger-100': '#fee2e2',
  'danger-500': '#ef4444',
  'danger-600': '#dc2626',
  'danger-700': '#b91c1c',
  
  // 信息色
  'info-50': '#f0f9ff',
  'info-100': '#e0f2fe',
  'info-500': '#0ea5e9',
  'info-600': '#0284c7',
  'info-700': '#0369a1',

  // 母婴品牌特色色 (保持相同)
  'accent-pink': '#FF8FAB',
  'accent-blue': '#91C8E4',
  'accent-green': '#A6CF98',
  'accent-yellow': '#FFEBA1',
  
  // 阴影
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.25)',
  'shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  'shadow-md': '0 6px 10px -2px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  'shadow-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.3), 0 8px 16px -4px rgba(0, 0, 0, 0.15)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  'shadow-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.25)',
  'shadow-colored': '0 8px 16px -4px rgba(49, 130, 255, 0.25)',
  
  // 磨砂玻璃效果
  'glass-bg': 'rgba(30, 41, 59, 0.8)',
  'glass-border': 'rgba(51, 65, 85, 0.5)',
  'glass-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
  'glass-backdrop': 'blur(10px)',
}

// 主题变量对象，用于在切换主题时应用
export const themeVariables: Record<ThemeMode, Record<string, string>> = {
  light: lightTheme,
  dark: darkTheme
}

// 定义调色板
export const colorPalette = {
  primary: '#3182ff',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  
  // 母婴品牌特色色
  accentPink: '#FF8FAB',
  accentBlue: '#91C8E4',
  accentGreen: '#A6CF98',
  accentYellow: '#FFEBA1',
  
  // 灰度
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  }
}

// 设计规范
export const designTokens = {
  // 圆角
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // 间距
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  
  // 字体大小
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  
  // 线宽
  borderWidth: {
    default: '1px',
    0: '0',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  
  // 过渡
  transition: {
    fast: '0.15s ease',
    default: '0.3s ease',
    slow: '0.5s ease',
    bounce: '0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // 动画
  animation: {
    fadeIn: 'fadeIn 0.5s ease-out',
    slideUp: 'slideUp 0.6s ease-out',
    slideDown: 'slideDown 0.6s ease-out',
    scaleIn: 'scaleIn 0.3s ease-out',
    bounceIn: 'bounceIn 0.6s ease-out',
    float: 'float 6s ease-in-out infinite',
    pulseSoft: 'pulseSoft 4s ease-in-out infinite',
  }
}

// Z轴层级管理
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
}

// 媒体查询断点
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// 应用主题变量和类
export const applyThemeVariables = (mode: ThemeMode) => {
  // 应用CSS变量
  const root = document.documentElement
  const variables = themeVariables[mode]
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
  
  // 设置或移除暗色主题类
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// 监听系统主题变化
export const watchSystemTheme = (callback: (isDark: boolean) => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches)
  }
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  }
  
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }
} 