import { Tooltip } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/theme/useTheme'
import clsx from 'clsx'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'

// 主题切换组件
const ThemeSwitch = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Tooltip title={isDark ? '切换到亮色主题' : '切换到暗色主题'} placement="bottom">
      <motion.div
        className={clsx(
          'theme-switch p-2 rounded-lg cursor-pointer',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'text-gray-500 dark:text-gray-400',
          'transition-colors'
        )}
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex' }}
          >
            {isDark ? 
              <MoonOutlined style={{ fontSize: 20 }} /> : 
              <SunOutlined style={{ fontSize: 20 }} />
            }
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Tooltip>
  )
}

export default ThemeSwitch 