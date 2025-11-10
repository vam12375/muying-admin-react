import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 优化依赖配置，确保正确处理CommonJS模块
  optimizeDeps: {
    include: ['@ant-design/charts']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // 生产环境优化：移除console日志
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      // 特定处理admin/orders路径，需要放在前面以确保优先匹配
      '^/admin/orders(/.*)?$': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`
      },
      // 处理没有/api前缀的admin路径
      '^/admin(/.*)?$': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`
      },
      // 处理已有/api前缀的请求
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/products': {
        target: 'http://localhost:5173',
        changeOrigin: true
      },
      '/brands': {
        target: 'http://localhost:5173',
        changeOrigin: true
      }
    }
  }
})
