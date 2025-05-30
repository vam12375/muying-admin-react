import React, { useState, useEffect } from 'react'
import { 
  Card, Form, Input, Button, Tabs, Upload, 
  Avatar, Spin, Typography, notification, 
  Row, Col, Divider, Progress
} from 'antd'
import type { UploadFile, UploadProps, TabsProps } from 'antd'
import {
  UserOutlined, LockOutlined, MailOutlined,
  PhoneOutlined, SaveOutlined, CheckCircleOutlined, InfoCircleOutlined,
  SafetyOutlined, SecurityScanOutlined, EyeOutlined, EyeInvisibleOutlined,
  CloudUploadOutlined, SettingOutlined
} from '@ant-design/icons'
import { getAdminInfo, updateAdminInfo, updatePassword, uploadAvatar } from '@/api/admin'
import { getUser, setUser } from '@/utils/auth'
import { adaptAdminData } from '@/utils/dataAdapters'
import { useDispatch } from 'react-redux'
import { updateUserInfo } from '@/store/slices/userSlice'
import { motion } from 'framer-motion'
import { useTheme } from '@/theme/useTheme'
import type { UploadRequestOption } from 'rc-upload/lib/interface'

const { Title, Text, Paragraph } = Typography;

interface ApiResponse {
  code: number;
  message: string;
  data: Record<string, unknown>;
}

interface AdminInfoData {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  status: number;
  createTime: string;
  lastLogin: string;
  loginCount: number;
  [key: string]: unknown;
}

// 定义一些动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// 密码强度计算函数
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // 长度大于8
  if (password.length >= 8) strength += 20;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength += 20;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength += 20;
  
  // 包含数字
  if (/\d/.test(password)) strength += 20;
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  
  return strength;
};

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfoData>({} as AdminInfoData);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('1');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  // 监听密码变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordStrength(calculatePasswordStrength(e.target.value));
  };

  // 计算个人资料完整度
  const calculateProfileCompletion = (info: AdminInfoData) => {
    let completed = 0;
    const totalFields = 4;
    
    if (info.avatar) completed += 1;
    if (info.nickname) completed += 1;
    if (info.email) completed += 1;
    if (info.phone) completed += 1;
    
    return Math.floor((completed / totalFields) * 100);
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      
      // 从API获取数据
      const response = await getAdminInfo();
      
      // 添加调试日志
      console.log('==== 个人设置-管理员信息API响应 ====');
      console.log('完整响应对象:', response);
      console.log('响应状态:', response.status);
      console.log('响应数据:', response.data);
      
      // 使用适配器处理数据
      const adaptedInfo = adaptAdminData(response.data);
      console.log('适配后的管理员数据:', adaptedInfo);
      
      setAdminInfo(adaptedInfo as AdminInfoData);
      
      // 计算个人资料完整度
      setProfileCompletion(calculateProfileCompletion(adaptedInfo as AdminInfoData));
      
      // 设置默认表单值
      form.setFieldsValue({
        username: adaptedInfo.username,
        nickname: adaptedInfo.nickname,
        email: adaptedInfo.email,
        phone: adaptedInfo.phone,
      });
      
      // 如果有头像，添加到文件列表
      if (adaptedInfo.avatar) {
        setFileList([
          {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: adaptedInfo.avatar,
          },
        ]);
      }
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      // 如果API失败，回退到本地存储的用户信息
      const localUser = getUser();
      if (localUser) {
        // 对本地存储的用户信息也应用适配器
        const adaptedLocalUser = adaptAdminData(localUser);
        console.log('适配后的本地用户数据:', adaptedLocalUser);
        
        setAdminInfo(adaptedLocalUser as AdminInfoData);
        
        // 计算个人资料完整度
        setProfileCompletion(calculateProfileCompletion(adaptedLocalUser as AdminInfoData));
        
        form.setFieldsValue({
          username: adaptedLocalUser.username,
          nickname: adaptedLocalUser.nickname,
          email: adaptedLocalUser.email,
          phone: adaptedLocalUser.phone,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const response = await updateAdminInfo(values) as unknown as ApiResponse;
      
      if (response.code === 200) {
        // 使用更醒目的通知替代简单消息
        notification.success({
          message: '更新成功',
          description: '个人信息已成功更新',
          placement: 'topRight',
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        
        // 更新本地存储的用户信息
        const updatedUser = { ...adminInfo, ...values };
        setUser(updatedUser);
        setAdminInfo(updatedUser as AdminInfoData);
        
        // 更新完整度
        setProfileCompletion(calculateProfileCompletion(updatedUser as AdminInfoData));
        
        // 更新Redux状态，确保全局同步
        dispatch(updateUserInfo(values));
      } else {
        notification.error({
          message: '更新失败',
          description: response.message || '更新个人信息失败，请稍后重试',
          placement: 'topRight',
          duration: 4
        });
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      notification.error({
        message: '更新失败',
        description: '更新个人信息失败，请稍后重试',
        placement: 'topRight',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values: Record<string, string>) => {
    try {
      setLoading(true);
      const { oldPassword, newPassword } = values;
      
      const response = await updatePassword({ oldPassword, newPassword }) as unknown as ApiResponse;
      
      if (response.code === 200) {
        notification.success({
          message: '密码更新成功',
          description: '您的账号密码已成功修改',
          placement: 'topRight',
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        passwordForm.resetFields();
        setPasswordStrength(0);
      } else {
        notification.error({
          message: '密码更新失败',
          description: response.message || '密码更新失败，请稍后重试',
          placement: 'topRight',
          duration: 4
        });
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      notification.error({
        message: '密码更新失败',
        description: '服务器错误，请稍后重试',
        placement: 'topRight',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: '文件类型错误',
        description: '您只能上传图片文件!',
        placement: 'topRight',
      });
      return Upload.LIST_IGNORE;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.error({
        message: '文件过大',
        description: '图片必须小于2MB!',
        placement: 'topRight',
      });
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const handleUpload = async (options: UploadRequestOption<Record<string, unknown>>) => {
    const { file, onSuccess, onError } = options;
    
    try {
      setUploadLoading(true);
      const formData = new FormData();
      
      // 类型修复，确保file是File实例
      if (file instanceof File) {
        formData.append('file', file);
      } else if (file && typeof file === 'object' && 'name' in file) {
        // 处理UploadRequestFile类型
        const uploadFile = file as unknown as Blob;
        formData.append('file', uploadFile, (file as Record<string, unknown>).name as string);
      }
      
      const response = await uploadAvatar(formData) as unknown as ApiResponse;
      
      if (response.code === 200) {
        notification.success({
          message: '头像上传成功',
          description: '您的头像已成功更新',
          placement: 'topRight',
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        
        // 获取头像URL并添加时间戳防止缓存
        const avatarUrl = response.data.url as string;
        const timestampedUrl = avatarUrl + (avatarUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
        
        // 更新用户信息中的头像
        const updatedUser = { ...adminInfo, avatar: timestampedUrl };
        setUser(updatedUser);
        setAdminInfo(updatedUser as AdminInfoData);
        
        // 更新完整度
        setProfileCompletion(calculateProfileCompletion(updatedUser as AdminInfoData));
        
        // 更新Redux状态，确保全局头像同步
        dispatch(updateUserInfo({ avatar: timestampedUrl }));
        
        if (onSuccess) {
          onSuccess(response as unknown as Record<string, unknown>);
        }
      } else {
        notification.error({
          message: '头像上传失败',
          description: response.message || '头像上传失败，请稍后重试',
          placement: 'topRight',
          duration: 4
        });
        if (onError) {
          onError(new Error('头像上传失败'));
        }
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      notification.error({
        message: '头像上传失败',
        description: '服务器错误，请稍后重试',
        placement: 'topRight',
        duration: 4
      });
      if (onError) {
        onError(new Error('头像上传失败'));
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    showUploadList: false,
    fileList,
    beforeUpload,
    customRequest: handleUpload,
    maxCount: 1,
  };

  // 获取密码强度状态
  const getPasswordStrengthStatus = (strength: number) => {
    if (strength < 40) return 'exception';
    if (strength < 80) return 'normal';
    return 'success';
  };

  // 获取密码强度文本
  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength < 40) return '弱';
    if (strength < 80) return '中';
    return '强';
  };

  // 获取密码强度颜色
  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return '#ff4d4f';
    if (strength < 80) return '#faad14';
    return '#52c41a';
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />个人资料
        </span>
      ),
      children: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-4"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <motion.div variants={itemVariants}>
                <Card 
                  bordered={false} 
                  className="overflow-hidden h-full"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 relative mb-6">
                      <div 
                        className="w-full h-full absolute top-0 left-0"
                        style={{ zIndex: 1 }}
                      >
                        <Progress 
                          type="circle" 
                          percent={profileCompletion} 
                          width={160} 
                          strokeWidth={4}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                          format={() => null}
                        />
                      </div>
                      <div 
                        className="w-full h-full absolute top-0 left-0 flex items-center justify-center"
                        style={{ zIndex: 2 }}
                      >
                        <Upload {...uploadProps}>
                          <motion.div 
                            className="relative cursor-pointer group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Avatar 
                              size={140} 
                              icon={<UserOutlined />}
                              src={fileList.length > 0 ? fileList[0].url : adminInfo?.avatar}
                              className={`border-4 ${isDark ? 'border-gray-800' : 'border-white'} shadow-lg`}
                            />
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                              {uploadLoading ? (
                                <Spin size="small" />
                              ) : (
                                <>
                                  <CloudUploadOutlined style={{ fontSize: '24px', color: '#fff' }} />
                                  <Text className="text-white mt-2">上传头像</Text>
                                </>
                              )}
                            </div>
                          </motion.div>
                        </Upload>
                      </div>
                    </div>
                    
                    <Title level={4} className="mt-2 mb-1">
                      {adminInfo?.nickname || adminInfo?.username}
                    </Title>
                    <Text type="secondary" className="mb-4">
                      {adminInfo?.role || '系统管理员'}
                    </Text>
                    
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <Text className="text-sm">个人资料完整度</Text>
                        <Text strong className="text-sm">{profileCompletion}%</Text>
                      </div>
                      <Progress 
                        percent={profileCompletion} 
                        size="small" 
                        showInfo={false}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </div>
                    
                    <Divider />
                    
                    <div className="w-full text-center">
                      <Paragraph className="text-sm opacity-75">
                        完善的个人信息有助于我们为您提供更好的服务和体验
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
            
            <Col xs={24} md={16}>
              <motion.div variants={itemVariants}>
                <Card 
                  bordered={false} 
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px'
                  }}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    requiredMark={false}
                    size="large"
                  >
                    <Title level={5} className="mb-4">基本信息</Title>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="username"
                          label="用户名"
                          rules={[{ required: true, message: '请输入用户名' }]}
                        >
                          <Input 
                            prefix={<UserOutlined />} 
                            placeholder="用户名" 
                            disabled 
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="nickname"
                          label="昵称"
                          rules={[{ required: true, message: '请输入昵称' }]}
                        >
                          <Input 
                            prefix={<UserOutlined />} 
                            placeholder="请输入昵称" 
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Title level={5} className="mt-4 mb-4">联系信息</Title>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="电子邮箱"
                          rules={[
                            { type: 'email', message: '请输入正确的邮箱格式' },
                            { required: false, message: '请输入电子邮箱' }
                          ]}
                          tooltip="添加邮箱可用于接收重要通知和找回密码"
                        >
                          <Input 
                            prefix={<MailOutlined />} 
                            placeholder="请输入电子邮箱" 
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="手机号码"
                          rules={[
                            { pattern: /^[1][3-9][0-9]{9}$/, message: '请输入正确的手机号码' },
                            { required: false, message: '请输入手机号码' }
                          ]}
                          tooltip="添加手机号可用于接收账号安全通知"
                        >
                          <Input 
                            prefix={<PhoneOutlined />} 
                            placeholder="请输入手机号码" 
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item className="mt-6">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={loading} 
                          icon={<SaveOutlined />}
                          block
                          size="large"
                          className="h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
                        >
                          保存个人信息
                        </Button>
                      </motion.div>
                    </Form.Item>
                  </Form>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />修改密码
        </span>
      ),
      children: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-4"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <motion.div variants={itemVariants}>
                <Card 
                  bordered={false} 
                  className="h-full"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px'
                  }}
                >
                  <div className="p-2">
                    <div className="flex items-center justify-center text-center mb-8">
                      <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/30">
                        <SecurityScanOutlined className="text-4xl text-blue-500" />
                      </div>
                    </div>
                    
                    <Title level={4} className="text-center mb-4">账号安全</Title>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                        <Title level={5} className="flex items-center gap-2 text-blue-500">
                          <InfoCircleOutlined /> 密码安全提示
                        </Title>
                        <ul className="pl-6 mt-2 space-y-1">
                          <li>使用至少8个字符</li>
                          <li>包含大小写字母、数字和符号</li>
                          <li>避免使用个人信息</li>
                          <li>定期更换密码</li>
                          <li>不要在多个网站使用相同的密码</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                        <Title level={5} className="flex items-center gap-2 text-green-500">
                          <SafetyOutlined /> 安全建议
                        </Title>
                        <Paragraph className="mt-2">
                          定期更换密码并设置强密码是保护账号安全的最佳做法。建议每3个月更换一次密码。
                        </Paragraph>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
            
            <Col xs={24} md={16}>
              <motion.div variants={itemVariants}>
                <Card 
                  bordered={false} 
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    borderRadius: '12px'
                  }}
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleUpdatePassword}
                    requiredMark={false}
                    size="large"
                  >
                    <Title level={5} className="mb-4">修改密码</Title>
                    
                    <Form.Item
                      name="oldPassword"
                      label="当前密码"
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="请输入当前密码" 
                        className="rounded-lg"
                        iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      />
                    </Form.Item>

                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg mb-4">
                      <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                          { required: true, message: '请输入新密码' },
                          { min: 8, message: '密码长度不能少于8个字符' }
                        ]}
                        className="mb-2"
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="请输入新密码" 
                          className="rounded-lg"
                          onChange={handlePasswordChange}
                          iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                      
                      {passwordStrength > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <Text className="text-sm">密码强度</Text>
                            <Text 
                              strong 
                              className="text-sm" 
                              style={{ color: getPasswordStrengthColor(passwordStrength) }}
                            >
                              {getPasswordStrengthText(passwordStrength)}
                            </Text>
                          </div>
                          <Progress 
                            percent={passwordStrength} 
                            size="small" 
                            showInfo={false}
                            status={getPasswordStrengthStatus(passwordStrength)}
                          />
                        </div>
                      )}

                      <Form.Item
                        name="confirmPassword"
                        label="确认新密码"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: '请确认新密码' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                          }),
                        ]}
                        className="mb-0"
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="请确认新密码" 
                          className="rounded-lg"
                          iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item className="mt-6">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={loading} 
                          icon={<LockOutlined />}
                          danger
                          block
                          size="large"
                          className="h-12 rounded-lg"
                        >
                          确认修改密码
                        </Button>
                      </motion.div>
                    </Form.Item>
                  </Form>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      ),
    },
  ];

  if (loading && !adminInfo.username) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-settings-page pb-8"
    >
      <div className="mb-6">
        <Title level={2} className="text-gray-800 dark:text-white m-0 flex items-center gap-2">
          <SettingOutlined /> 个人设置
        </Title>
        <Text type="secondary">管理您的个人信息和账号安全</Text>
      </div>

      <Card 
        className="shadow-sm" 
        bordered={false}
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          className="settings-tabs"
          animated={{ inkBar: true, tabPane: true }}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Card>
    </motion.div>
  );
};

export default AdminSettings; 