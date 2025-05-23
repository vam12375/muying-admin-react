import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message, Modal, App } from 'antd'
import { getToken, isLoggedIn } from './auth'

// 获取全局消息实例
let globalMessage: any = null;
let globalModal: any = null;

// 设置全局消息API
export const setGlobalMessage = (messageApi: any) => {
  globalMessage = messageApi;
};

// 设置全局Modal API
export const setGlobalModal = (modalApi: any) => {
  globalModal = modalApi;
};

// 不需要token的白名单路径
const whiteList = [
  '/login',
  '/admin/login',
  '/public'
]

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 使用/api前缀
  timeout: 15000, // 请求超时时间
  headers: {
    'Cache-Control': 'no-cache', // 禁用缓存
    'Pragma': 'no-cache'
  }
})

// 检查请求是否需要认证
const isAuthRequired = (url: string | undefined): boolean => {
  if (!url) return true
  return !whiteList.some(path => url.includes(path))
}

// 确保API请求路径正确
const ensureApiPath = (url: string | undefined): string | undefined => {
  if (!url) return url
  
  // 如果URL不是以/开头，添加/
  if (!url.startsWith('/')) {
    return `/${url}`
  }
  
  return url
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 确保API路径正确
    if (config.url) {
      config.url = ensureApiPath(config.url)
    }
    
    // 检查请求是否需要认证
    const needAuth = isAuthRequired(config.url)
    
    // 如果需要认证，检查token是否存在
    if (needAuth) {
      const token = getToken()
      if (!token) {
        console.warn('请求需要认证但未找到token，请先登录', config.url)
        // 如果是在浏览器环境中，可以重定向到登录页
        if (typeof window !== 'undefined') {
          // 保存当前URL，以便登录后返回
          const currentPath = window.location.pathname
          if (currentPath !== '/login') {
            console.log('重定向到登录页，当前路径:', currentPath)
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            // 中断请求
            return Promise.reject(new Error('未登录，请先登录')).then(() => config) as any
          }
        }
      } else {
        console.log('请求携带token:', config.url)
      }
      
      // 如果存在token，请求头携带token
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
        console.log('已添加Authorization头:', `Bearer ${token.substring(0, 10)}...`)
      }
    }
    
    // 为每个请求添加时间戳，防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      }
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果响应的content-type是application/octet-stream，表示是文件下载，直接返回
    if (response.headers['content-type'] && response.headers['content-type'].includes('application/octet-stream')) {
      return response
    }
    
    // 处理返回结果
    if (res.code === 200 || res.code === 0 || res.success === true) {
      // 为了兼容业务代码中检查 res.success 的逻辑，添加 success 字段
      if (res.code === 200 && res.success === undefined) {
        res.success = true
      }
      return res
    } else {
      // 特殊处理系统繁忙的情况，可能是后端类加载错误
      if (res.message === '系统繁忙，请稍后再试' || 
          (res.data && typeof res.data === 'string' && 
           (res.data.includes('NoClassDefFoundError') || 
            res.data.includes('ClassNotFoundException') || 
            res.data.includes('ResultCode')))) {
        console.error(`[API错误] ${response.config.url}: 可能是后端类加载问题`, res)
        return Promise.reject(new Error('后端服务出现类加载错误，请联系管理员检查后端配置'))
      }
      
      // 处理一般错误
      console.error(`[API错误] ${response.config.url}:`, res)
      showError(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }
  },
  (error) => {
    console.error('[API请求失败]', error.config?.url, error)
    const { status, data } = error.response || {}
    
    // 处理401错误（未授权）
    if (status === 401) {
      // 清除token
      localStorage.removeItem('muying_admin_token')
      localStorage.removeItem('muying_admin_user')
      
      if (globalModal) {
        globalModal.warning({
          title: '登录失效',
          content: '您的登录已失效，请重新登录',
          okText: '重新登录',
          onOk: () => {
            // 保存当前URL，以便登录后返回
            const currentPath = window.location.pathname
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
          }
        });
      } else {
        Modal.warning({
          title: '登录失效',
          content: '您的登录已失效，请重新登录',
          okText: '重新登录',
          onOk: () => {
            // 保存当前URL，以便登录后返回
            const currentPath = window.location.pathname
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
          }
        })
      }
      return Promise.reject(error)
    }
    
    // 处理403错误（禁止访问）
    if (status === 403) {
      // 检查是否已登录
      if (!isLoggedIn()) {
        console.log('收到403错误但未登录，重定向到登录页')
        // 清除可能存在的无效token
        localStorage.removeItem('muying_admin_token')
        localStorage.removeItem('muying_admin_user')
        
        if (globalModal) {
          globalModal.warning({
            title: '需要登录',
            content: '您需要登录后才能访问此功能',
            okText: '去登录',
            onOk: () => {
              // 保存当前URL，以便登录后返回
              const currentPath = window.location.pathname
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          });
        } else {
          Modal.warning({
            title: '需要登录',
            content: '您需要登录后才能访问此功能',
            okText: '去登录',
            onOk: () => {
              // 保存当前URL，以便登录后返回
              const currentPath = window.location.pathname
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          })
        }
      } else {
        // 已登录但权限不足
        console.log('已登录但收到403错误，可能是权限不足或token无效')
        
        // 尝试从响应中获取更详细的错误信息
        const errorMessage = data?.message || '无权限访问此功能'
        
        if (globalModal) {
          globalModal.warning({
            title: '访问受限',
            content: `${errorMessage}，您可能需要重新登录或联系管理员获取权限`,
            okText: '重新登录',
            onOk: () => {
              // 清除token并重定向到登录页
              localStorage.removeItem('muying_admin_token')
              localStorage.removeItem('muying_admin_user')
              const currentPath = window.location.pathname
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          });
        } else {
          Modal.warning({
            title: '访问受限',
            content: `${errorMessage}，您可能需要重新登录或联系管理员获取权限`,
            okText: '重新登录',
            onOk: () => {
              // 清除token并重定向到登录页
              localStorage.removeItem('muying_admin_token')
              localStorage.removeItem('muying_admin_user')
              const currentPath = window.location.pathname
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          })
        }
      }
      return Promise.reject(error)
    }
    
    // 处理404错误（资源不存在）
    if (status === 404) {
      showError('请求的资源不存在')
      return Promise.reject(error)
    }
    
    // 处理其他错误
    const errorMsg = (data && data.message) || error.message || '请求错误'
    showError(errorMsg)
    return Promise.reject(error)
  }
)

// 显示错误消息
const showError = (msg: string): void => {
  if (globalMessage) {
    globalMessage.error(msg);
  } else {
    message.error(msg)
  }
}

export default service 