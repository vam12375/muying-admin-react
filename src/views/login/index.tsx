import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/theme/useTheme'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'
import { adminLogin } from '@/api/auth'
import type { LoginResponseData } from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/auth'
import './login.css'

interface LoginParams {
  admin_name: string;
  admin_pass: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [form] = Form.useForm()
  const [errorMsg, setErrorMsg] = useState<string | null>(null) // 添加错误信息状态
  
  // 处理表单提交
  const handleLogin = async (values: LoginParams) => {
    try {
      setLoading(true)
      setErrorMsg(null) // 清除之前的错误信息
      
      // 调用真实登录API
      const response = await adminLogin({
        admin_name: values.admin_name,
        admin_pass: values.admin_pass
      })
      
      const { data } = response
      
      // 处理登录成功
      if (data) {
        // 保存token和用户信息
        setToken(data.token)
        setUserInfo(data.user)
        
        // 记住登录状态
        if (values.remember) {
          localStorage.setItem('remember_admin', values.admin_name)
        } else {
          localStorage.removeItem('remember_admin')
        }
        
        // 重定向到之前尝试访问的页面，或默认到仪表盘
        const redirect = new URLSearchParams(location.search).get('redirect')
        navigate(redirect || '/dashboard')
      } else {
        setErrorMsg('登录失败，请检查用户名和密码')
      }
    } catch (error: any) {
      // 处理登录错误
      const errorMessage = error.response?.data?.message || error.message || '登录失败，请稍后再试'
      setErrorMsg(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // 初始化表单
  useEffect(() => {
    // 如果有记住的用户名则自动填充
    const rememberedUser = localStorage.getItem('remember_admin')
    if (rememberedUser) {
      form.setFieldsValue({
        admin_name: rememberedUser,
        remember: true
      })
    }
  }, [form])

  return (
    <div className={cn(
      "login-container min-h-screen w-full flex items-center justify-center",
      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800",
      "p-4 transition-all duration-300"
    )}>
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl">
        {/* 左侧图片区域 */}
        <div className="relative hidden md:block md:w-1/2 bg-primary-600">
          <MotionWrapper animation="fade" delay={0.2}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/login-bg.jpg')" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-primary-700/80 flex flex-col justify-between p-12">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">母婴商城管理系统</h2>
                  <p className="opacity-80">专业的母婴产品管理平台</p>
                </div>
                <div className="text-white/70 text-sm">
                  © {new Date().getFullYear()} 母婴商城. 版权所有.
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>

        {/* 右侧登录表单 */}
        <div className={cn(
          "w-full md:w-1/2 p-8 md:p-12",
          "bg-white dark:bg-gray-800 transition-colors duration-300"
        )}>
          <div className="flex justify-end mb-6">
            <Button 
              type="text" 
              onClick={toggleTheme}
              icon={
                isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )
              }
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            />
          </div>

          <MotionWrapper animation="slideUp" delay={0.3}>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">欢迎登录</h1>
              <p className="text-gray-500 dark:text-gray-400">请输入您的账号和密码</p>
            </div>

            {/* 错误提示 */}
            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                closable
                className="mb-6"
                onClose={() => setErrorMsg(null)}
              />
            )}

            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              size="large"
              className="login-form"
            >
              <Form.Item
                name="admin_name"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="管理员用户名" 
                  className="rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </Form.Item>

              <Form.Item
                name="admin_pass"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                  className="rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-gray-600 dark:text-gray-300">记住我</Checkbox>
                  </Form.Item>
                  <a className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                    忘记密码?
                  </a>
                </div>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full h-12 rounded-lg bg-primary-500 hover:bg-primary-600"
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </MotionWrapper>
        </div>
      </div>
    </div>
  )
}

export default Login 