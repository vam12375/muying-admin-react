import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Alert } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/theme/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import MotionWrapper from '@/components/animations/MotionWrapper'
import ParticleBackground from '@/components/animations/ParticleBackground'
import FloatingIcons from '@/components/animations/FloatingIcons'
import { adminLogin } from '@/api/auth'
import type { LoginResponseData } from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/auth'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/userSlice'
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFormFocused, setIsFormFocused] = useState(false)
  const dispatch = useDispatch()
  
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
        // 保存token和用户信息到localStorage
        setToken(data.token)
        setUserInfo(data.user)

        // 同时更新Redux store
        dispatch(setCredentials({
          token: data.token,
          user: data.user
        }))

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ParticleBackground
          particleCount={60}
          colors={['#ff85a2', '#ffb8c8', '#3182ff', '#76a9fa', '#e56a87']}
          speed={0.3}
        />
        <FloatingIcons />
      </div>

      {/* 主题切换按钮 */}
      <motion.div
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          type="text"
          onClick={toggleTheme}
          className={cn(
            "w-12 h-12 rounded-full backdrop-blur-md border border-white/20",
            "bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/40",
            "text-gray-700 dark:text-gray-300 transition-all duration-300",
            "shadow-lg hover:shadow-xl hover:scale-105"
          )}
          icon={
            isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )
          }
        />
      </motion.div>

      {/* 主要内容区域 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* 左侧欢迎区域 */}
            <motion.div
              className="text-center lg:text-left space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-4">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5C15.8 11.5 16.5 12.2 16.5 13S15.8 14.5 15 14.5 13.5 13.8 13.5 13 14.2 11.5 15 11.5M9 13.5C9.8 13.5 10.5 14.2 10.5 15S9.8 16.5 9 16.5 7.5 15.8 7.5 15 8.2 13.5 9 13.5M4.5 10.5V9L3 9V7L9 7.5V9H7.5V10.5H9V12H7.5V13.5H9V15H7.5V16.5H9V18H7.5V19.5H9V21H4.5V19.5H6V18H4.5V16.5H6V15H4.5V13.5H6V12H4.5V10.5M15 16.5H13.5V18H15V16.5M15 19.5H13.5V21H15V19.5Z"/>
                  </svg>
                </motion.div>

                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    母婴商城
                  </h1>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-white mb-2">
                    管理系统
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    专业的母婴产品管理平台
                    <br />
                    <span className="text-pink-500">安全 · 高效 · 智能</span>
                  </p>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <motion.div
                    className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-2xl font-bold text-pink-500">1000+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">商品管理</div>
                  </motion.div>
                  <motion.div
                    className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold text-blue-500">500+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">订单处理</div>
                  </motion.div>
                  <motion.div
                    className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold text-purple-500">99.9%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">系统稳定</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* 右侧登录表单 */}
            <motion.div
              className="w-full max-w-md mx-auto"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className={cn(
                "relative p-8 lg:p-10 rounded-3xl backdrop-blur-xl border border-white/20",
                "bg-white/80 dark:bg-gray-800/80 shadow-2xl",
                "transition-all duration-300",
                isFormFocused && "shadow-3xl scale-[1.02]"
              )}>
                {/* 装饰性渐变边框 */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 via-blue-500/20 to-purple-500/20 blur-xl -z-10" />

                <div className="space-y-6">
                  {/* 表单标题 */}
                  <div className="text-center space-y-2">
                    <motion.h3
                      className="text-2xl font-bold text-gray-800 dark:text-white"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      欢迎回来
                    </motion.h3>
                    <motion.p
                      className="text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      请登录您的管理员账户
                    </motion.p>
                  </div>

                  {/* 错误提示 */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert
                          message={errorMsg}
                          type="error"
                          showIcon
                          closable
                          className="rounded-xl"
                          onClose={() => setErrorMsg(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 登录表单 */}
                  <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={handleLogin}
                    size="large"
                    className="space-y-4"
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Form.Item
                        name="admin_name"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-400" />}
                          placeholder="管理员用户名"
                          className={cn(
                            "h-12 rounded-xl border-gray-200 dark:border-gray-600",
                            "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm",
                            "hover:bg-white/80 dark:hover:bg-gray-700/80",
                            "focus:bg-white dark:focus:bg-gray-700",
                            "transition-all duration-300"
                          )}
                        />
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <Form.Item
                        name="admin_pass"
                        rules={[{ required: true, message: '请输入密码!' }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="密码"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          className={cn(
                            "h-12 rounded-xl border-gray-200 dark:border-gray-600",
                            "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm",
                            "hover:bg-white/80 dark:hover:bg-gray-700/80",
                            "focus:bg-white dark:focus:bg-gray-700",
                            "transition-all duration-300"
                          )}
                        />
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <Form.Item>
                        <div className="flex justify-between items-center">
                          <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox className="text-gray-600 dark:text-gray-300">
                              记住我
                            </Checkbox>
                          </Form.Item>
                          <motion.a
                            className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            忘记密码?
                          </motion.a>
                        </div>
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                    >
                      <Form.Item>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className={cn(
                              "w-full h-12 rounded-xl border-0 text-white font-semibold",
                              "bg-gradient-to-r from-pink-500 to-blue-500",
                              "hover:from-pink-600 hover:to-blue-600",
                              "shadow-lg hover:shadow-xl",
                              "transition-all duration-300",
                              loading && "opacity-80"
                            )}
                          >
                            {loading ? '登录中...' : '立即登录'}
                          </Button>
                        </motion.div>
                      </Form.Item>
                    </motion.div>
                  </Form>

                  {/* 底部信息 */}
                  <motion.div
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    © {new Date().getFullYear()} 母婴商城管理系统. 保留所有权利.
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login 