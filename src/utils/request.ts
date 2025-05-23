import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message, Modal } from 'antd'
import { getToken } from './auth'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 接口统一前缀
  timeout: 15000, // 请求超时时间
  headers: {
    'Cache-Control': 'no-cache', // 禁用缓存
    'Pragma': 'no-cache'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 如果存在token，请求头携带token
    const token = getToken()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
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
    console.log(`[API响应] ${response.config.url}:`, res)
    
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
      // 处理错误
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
      
      Modal.warning({
        title: '登录失效',
        content: '您的登录已失效，请重新登录',
        okText: '重新登录',
        onOk: () => {
          window.location.href = '/login'
        }
      })
      return Promise.reject(error)
    }
    
    // 处理403错误（禁止访问）
    if (status === 403) {
      message.error('无权限访问')
      return Promise.reject(error)
    }
    
    // 处理404错误（资源不存在）
    if (status === 404) {
      message.error('请求的资源不存在')
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
  message.error(msg)
}

export default service 