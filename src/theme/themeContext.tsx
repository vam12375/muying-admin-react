import React, { createContext, useState, useEffect, useMemo } from 'react'
import { ThemeMode, themeVariables, prefersDarkMode } from './index'

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {}
})

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * 将颜色转换为RGB值
 * @param hex 十六进制颜色值
 * @returns RGB值数组
 */
const hexToRgb = (hex: string): string => {
  // 移除#号
  hex = hex.replace('#', '')
  
  // 处理缩写形式
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  
  // 转换为RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return `${r}, ${g}, ${b}`
}

/**
 * 应用CSS变量到文档根元素
 * @param variables CSS变量对象
 */
const applyCssVariables = (variables: Record<string, string>) => {
  const root = document.documentElement
  
  // 应用基础变量
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
    
    // 如果是颜色值，同时设置RGB变量
    if (value.startsWith('#')) {
      root.style.setProperty(`--${key}-rgb`, hexToRgb(value))
    }
  })
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从本地存储或系统偏好中获取初始主题
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    return savedTheme || (prefersDarkMode() ? 'dark' : 'light')
  }

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  // 切换主题
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // 当主题变化时，更新本地存储和文档类
  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    // 应用CSS变量
    applyCssVariables(themeVariables[theme])
    
    // 更新文档类
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 仅当用户未手动设置主题时，才跟随系统变化
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange)
    }
    
    // 清理监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const contextValue = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme
  }), [theme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
} 