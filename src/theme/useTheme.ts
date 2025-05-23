import { useContext } from 'react'
import { ThemeContext } from './themeContext'
import { ThemeMode } from './index'

/**
 * 主题钩子
 * 提供主题相关的状态和方法
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用')
  }
  
  return {
    theme: context.theme,
    isDark: context.isDark,
    toggleTheme: context.toggleTheme,
    setTheme: context.setTheme,
    
    /**
     * 根据当前主题返回不同的值
     * @param lightValue 亮色主题值
     * @param darkValue 暗色主题值
     * @returns 根据当前主题返回对应的值
     */
    themeValue: <T>(lightValue: T, darkValue: T): T => {
      return context.isDark ? darkValue : lightValue
    }
  }
}

// CSS变量辅助函数，使用方式: cssVar('bg-card')
export const cssVar = (name: string) => `var(--${name})`

// 创建可响应主题的组件样式工具，可以根据主题设置不同的样式值
export const getThemeValue = <T,>(lightValue: T, darkValue: T, isDark: boolean): T => {
  return isDark ? darkValue : lightValue
}

// 样式合成助手
export const composeStyles = (...styles: (string | Record<string, boolean>)[]) => {
  return styles
    .map(style => {
      if (typeof style === 'string') return style
      return Object.entries(style)
        .filter(([_, include]) => Boolean(include))
        .map(([className]) => className)
        .join(' ')
    })
    .filter(Boolean)
    .join(' ')
} 