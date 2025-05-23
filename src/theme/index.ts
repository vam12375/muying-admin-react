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
export const prefersDarkMode = (): boolean => 
  window.matchMedia('(prefers-color-scheme: dark)').matches

// 定义CSS变量在不同主题下的值
export const themeVariables = {
  light: {
    // 背景色
    'bg-base': '#ffffff',
    'bg-card': '#ffffff',
    'bg-sidebar': '#ffffff',
    'bg-header': '#ffffff',
    'bg-footer': '#f9fafb',
    'bg-hover': '#f3f4f6',
    'bg-active': '#eef5ff',
    
    // 文本色
    'text-primary': '#1f2937',
    'text-secondary': '#6b7280',
    'text-muted': '#9ca3af',
    'text-light': '#e5e7eb',
    
    // 边框色
    'border-base': '#e5e7eb',
    'border-light': '#f3f4f6',
    
    // 阴影
    'shadow-card': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    'shadow-dropdown': '0 10px 30px 0 rgba(0, 0, 0, 0.05)',
    'shadow-button': '0 2px 5px 0 rgba(0, 0, 0, 0.08)',
    'shadow-colored': '0 8px 16px -4px rgba(49, 130, 255, 0.2)',
    
    // 透明覆盖层
    'overlay-light': 'rgba(255, 255, 255, 0.8)',
    'overlay-dark': 'rgba(0, 0, 0, 0.2)',
    
    // 新增强调色
    'accent-pink': '#FF8FAB',
    'accent-blue': '#91C8E4',
    'accent-green': '#A6CF98',
    'accent-yellow': '#FFEBA1',
    
    // 圆角
    'radius-sm': '0.25rem',
    'radius-md': '0.375rem',
    'radius-lg': '0.5rem',
    'radius-xl': '0.75rem',
    'radius-2xl': '1rem',
  },
  dark: {
    // 背景色
    'bg-base': '#111827',
    'bg-card': '#1f2937',
    'bg-sidebar': '#1f2937',
    'bg-header': '#111827',
    'bg-footer': '#1f2937',
    'bg-hover': '#374151',
    'bg-active': 'rgba(49, 130, 255, 0.15)',
    
    // 文本色
    'text-primary': '#f9fafb',
    'text-secondary': '#d1d5db',
    'text-muted': '#9ca3af',
    'text-light': '#4b5563',
    
    // 边框色
    'border-base': '#374151',
    'border-light': '#1f2937',
    
    // 阴影
    'shadow-card': '0 4px 20px 0 rgba(0, 0, 0, 0.3)',
    'shadow-dropdown': '0 10px 30px 0 rgba(0, 0, 0, 0.3)',
    'shadow-button': '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
    'shadow-colored': '0 8px 16px -4px rgba(49, 130, 255, 0.3)',
    
    // 透明覆盖层
    'overlay-light': 'rgba(255, 255, 255, 0.05)',
    'overlay-dark': 'rgba(0, 0, 0, 0.5)',
    
    // 新增强调色
    'accent-pink': '#FF8FAB',
    'accent-blue': '#91C8E4',
    'accent-green': '#A6CF98',
    'accent-yellow': '#FFEBA1',
    
    // 圆角
    'radius-sm': '0.25rem',
    'radius-md': '0.375rem',
    'radius-lg': '0.5rem',
    'radius-xl': '0.75rem',
    'radius-2xl': '1rem',
  },
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

// 浅色主题配置
export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3182ff',
    colorInfo: '#3182ff',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    wireframe: false,
    colorBgBase: '#ffffff',
    colorTextBase: '#1f2937',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    lineWidth: 1,
    lineType: 'solid',
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
    motionEaseInOutCirc: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    opacityImage: 1,
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 10px 30px 0 rgba(0, 0, 0, 0.05)',
  },
  components: {
    Button: {
      colorPrimary: '#3182ff',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.08)',
      colorPrimaryHover: '#2563eb',
    },
    Input: {
      colorBorder: '#e5e7eb',
      colorPrimaryHover: '#2563eb',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Card: {
      colorBorderSecondary: '#f3f4f6',
      colorBgContainer: '#ffffff',
      borderRadiusLG: 12,
      boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
    },
    Table: {
      colorBgContainer: '#ffffff',
      colorFillAlter: '#f9fafb',
      headerBg: '#f9fafb',
      headerColor: '#4b5563',
      borderRadius: 8,
      rowHoverBg: 'rgba(49, 130, 255, 0.05)',
      fontSize: 14,
      lineHeight: 1.5,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#374151',
      itemSelectedColor: '#3182ff',
      itemSelectedBg: '#eef5ff',
      itemHoverColor: '#3182ff',
      itemBorderRadius: 8,
      subMenuItemBorderRadius: 8,
      itemHeight: 44,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 18,
      iconMarginInlineEnd: 12,
    },
    Form: {
      itemMarginBottom: 24,
      labelFontSize: 14,
      labelColor: '#4b5563',
      colorError: '#ef4444',
      colorErrorBorder: '#fca5a5',
      colorErrorHover: '#dc2626',
      colorErrorOutline: 'rgba(239, 68, 68, 0.1)',
    },
    Select: {
      controlItemBgActive: 'rgba(49, 130, 255, 0.1)',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    DatePicker: {
      controlItemBgActive: 'rgba(49, 130, 255, 0.1)',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Dropdown: {
      controlItemBgHover: 'rgba(49, 130, 255, 0.05)',
      controlItemBgActive: 'rgba(49, 130, 255, 0.1)',
      borderRadius: 8,
      boxShadow: '0 10px 30px 0 rgba(0, 0, 0, 0.05)',
    },
    Tabs: {
      inkBarColor: '#3182ff',
      itemSelectedColor: '#3182ff',
      itemHoverColor: '#2563eb',
      itemActiveColor: '#2563eb',
      cardBg: '#ffffff',
      horizontalItemGutter: 24,
      horizontalItemPadding: '8px 16px',
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 12,
      colorBgContainer: '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      padding: 24,
    },
    Drawer: {
      borderRadius: 12,
      colorBgContainer: '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      padding: 24,
    },
  },
}

// 深色主题配置
export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3b82f6',
    colorInfo: '#3b82f6',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    wireframe: false,
    colorBgBase: '#111827',
    colorTextBase: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    lineWidth: 1,
    lineType: 'solid',
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
    motionEaseInOutCirc: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    opacityImage: 0.85,
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.3)',
    boxShadowSecondary: '0 10px 30px 0 rgba(0, 0, 0, 0.3)',
  },
  components: {
    Button: {
      colorPrimary: '#3b82f6',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2)',
      colorPrimaryHover: '#60a5fa',
    },
    Input: {
      colorBorder: '#374151',
      colorPrimaryHover: '#60a5fa',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      colorBgContainer: '#1f2937',
      colorTextPlaceholder: '#6b7280',
    },
    Card: {
      colorBorderSecondary: '#1f2937',
      colorBgContainer: '#1f2937',
      borderRadiusLG: 12,
      boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.3)',
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
    },
    Table: {
      colorBgContainer: '#1f2937',
      colorFillAlter: '#111827',
      headerBg: '#1f2937',
      headerColor: '#d1d5db',
      borderRadius: 8,
      rowHoverBg: 'rgba(59, 130, 246, 0.1)',
      fontSize: 14,
      lineHeight: 1.5,
      colorBorder: '#374151',
    },
    Menu: {
      itemBg: '#111827',
      itemColor: '#d1d5db',
      itemSelectedColor: '#60a5fa',
      itemSelectedBg: 'rgba(59, 130, 246, 0.2)',
      itemHoverColor: '#60a5fa',
      itemBorderRadius: 8,
      subMenuItemBorderRadius: 8,
      colorSubItemBg: '#1f2937',
      itemHeight: 44,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 18,
      iconMarginInlineEnd: 12,
    },
    Form: {
      itemMarginBottom: 24,
      labelFontSize: 14,
      labelColor: '#d1d5db',
      colorError: '#ef4444',
      colorErrorBorder: '#f87171',
      colorErrorHover: '#dc2626',
      colorErrorOutline: 'rgba(239, 68, 68, 0.1)',
    },
    Select: {
      controlItemBgActive: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      colorBgContainer: '#1f2937',
      colorBgElevated: '#1f2937',
      colorTextPlaceholder: '#6b7280',
    },
    DatePicker: {
      controlItemBgActive: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      colorBgContainer: '#1f2937',
      colorBgElevated: '#1f2937',
      colorTextPlaceholder: '#6b7280',
    },
    Dropdown: {
      controlItemBgHover: 'rgba(59, 130, 246, 0.1)',
      controlItemBgActive: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 8,
      boxShadow: '0 10px 30px 0 rgba(0, 0, 0, 0.3)',
      colorBgElevated: '#1f2937',
    },
    Tabs: {
      inkBarColor: '#3b82f6',
      itemSelectedColor: '#60a5fa',
      itemHoverColor: '#60a5fa',
      itemActiveColor: '#60a5fa',
      cardBg: '#1f2937',
      horizontalItemGutter: 24,
      horizontalItemPadding: '8px 16px',
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 12,
      colorBgContainer: '#1f2937',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
      padding: 24,
    },
    Drawer: {
      borderRadius: 12,
      colorBgContainer: '#1f2937',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
      padding: 24,
    },
  },
} 