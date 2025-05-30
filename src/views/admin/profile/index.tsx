import React, { useState, useEffect } from 'react'
import { Card, Avatar, Typography, Tag, Button, Descriptions, Timeline, Spin, Row, Col, Divider, Progress } from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  LockOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getAdminInfo, getAdminLogs } from '@/api/admin'
import { getUser } from '@/utils/auth'
import { adaptAdminData, adaptAdminLogs } from '@/utils/dataAdapters'
import { motion } from 'framer-motion'

const { Title, Text } = Typography;

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

interface LogData {
  id: string;
  operation: string;
  module: string;
  ip: string;
  createTime: string;
  detail: string;
  [key: string]: unknown;
}

// 动画变体配置
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

// 卡片组件接口定义
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// 卡片组件带动画效果
const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay, 
      type: "spring", 
      stiffness: 100 
    }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={className}
  >
    {children}
  </motion.div>
);

// 状态标签接口
interface StatusTagProps {
  status: number;
}

// 状态标签组件
const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const statusConfig: Record<number, { color: string; text: string }> = {
    1: { color: 'success', text: '正常' },
    0: { color: 'error', text: '已禁用' }
  };
  
  const config = statusConfig[status] || { color: 'default', text: '未知' };
  
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Tag color={config.color}>
        {config.text}
      </Tag>
    </motion.div>
  );
};

const AdminProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfoData>({} as AdminInfoData);
  const [logs, setLogs] = useState<LogData[]>([]);

  useEffect(() => {
    fetchAdminInfo();
    fetchAdminLogs();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      // 尝试从API获取数据
      const response = await getAdminInfo();
      
      // 添加详细调试日志
      console.log('==== 管理员信息API响应 ====');
      console.log('完整响应对象:', response);
      console.log('响应状态:', response.status);
      console.log('响应数据:', response.data);
      
      // 使用适配器处理数据
      const adaptedInfo = adaptAdminData(response.data);
      console.log('适配后的管理员数据:', adaptedInfo);
      
      setAdminInfo(adaptedInfo as AdminInfoData);
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      // 如果API失败，回退到本地存储的用户信息
      const localUser = getUser();
      if (localUser) {
        // 也对本地存储的数据进行适配
        const adaptedLocalUser = adaptAdminData(localUser);
        console.log('适配后的本地用户数据:', adaptedLocalUser);
        setAdminInfo(adaptedLocalUser as AdminInfoData);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      console.log('==== 获取管理员日志 ====');
      const response = await getAdminLogs({ page: 1, size: 10 });
      console.log('日志API响应:', response);
      
      // 使用适配器处理日志数据
      const adaptedLogs = adaptAdminLogs(response.data);
      console.log('适配后的日志数据:', adaptedLogs);
      
      setLogs(adaptedLogs as LogData[]);
    } catch (error) {
      console.error('获取管理员日志失败:', error);
      setLogs([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 格式化创建时间为更友好的格式
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '未知';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  };
  
  // 计算账号年龄
  const calculateAccountAge = (dateStr: string | undefined): string => {
    if (!dateStr) return '未知';
    try {
      const createdDate = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays}天`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)}个月`;
      } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return `${years}年${months > 0 ? months + '个月' : ''}`;
      }
    } catch (_) {
      return '未知';
    }
  };

  return (
    <motion.div 
      className="admin-profile-page pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 页面标题 */}
      <motion.div className="mb-8" variants={itemVariants}>
        <Title level={2} className="text-gray-800 dark:text-white m-0 flex items-center gap-2">
          <UserOutlined /> 个人中心
        </Title>
        <Text type="secondary" className="text-base">查看和管理您的个人信息及系统使用情况</Text>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* 左侧栏 - 管理员基本信息 */}
        <Col xs={24} lg={8}>
          <AnimatedCard delay={0.1} className="h-full">
            <Card 
              bordered={false}
              className="shadow-md dark:shadow-gray-800/10 overflow-hidden h-full"
            >
              {/* 顶部彩色背景 */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-purple-500 z-0"></div>
              
              {/* 用户信息 */}
              <div className="relative z-10 flex flex-col items-center mt-12 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Avatar 
                    size={110} 
                    src={adminInfo?.avatar} 
                    icon={<UserOutlined />} 
                    className="border-4 border-white dark:border-gray-800 shadow-lg mb-4"
                  />
                </motion.div>
                
                <Title level={3} className="mt-2 mb-0">
                  {adminInfo?.nickname || adminInfo?.username || '管理员'}
                </Title>
                
                <div className="flex items-center gap-2 mt-1">
                  <Tag color="blue" className="flex items-center gap-1">
                    <TeamOutlined /> {adminInfo?.role || '系统管理员'}
                  </Tag>
                  <StatusTag status={adminInfo?.status} />
                </div>
                
                <div className="mt-4 w-full">
                  <Link to="/settings">
                    <Button 
                      type="primary" 
                      block 
                      icon={<EditOutlined />}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md hover:shadow-lg transition-all"
                    >
                      修改个人资料
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              {/* 用户详细信息 */}
              <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
                <Descriptions layout="vertical" column={1} colon={false} className="text-sm">
                  <Descriptions.Item 
                    label={<Text strong className="flex items-center gap-2"><UserOutlined /> 用户名</Text>}
                    className="pb-3"
                  >
                    <div className="flex justify-between items-center">
                      <Text>{adminInfo?.username || '未设置'}</Text>
                      <Tag color="default" className="text-xs">登录账号</Tag>
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={<Text strong className="flex items-center gap-2"><MailOutlined /> 电子邮箱</Text>}
                    className="pb-3"
                  >
                    {adminInfo?.email ? (
                      <div className="flex items-center gap-2">
                        <Text>{adminInfo.email}</Text>
                        <Tag color="green" className="text-xs">已验证</Tag>
                      </div>
                    ) : '未设置'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={<Text strong className="flex items-center gap-2"><PhoneOutlined /> 手机号码</Text>}
                    className="pb-3"
                  >
                    {adminInfo?.phone || '未设置'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={<Text strong className="flex items-center gap-2"><CalendarOutlined /> 注册时间</Text>}
                    className="pb-3"
                  >
                    <div className="flex flex-col">
                      <Text>{formatDate(adminInfo?.createTime)}</Text>
                      <Text type="secondary" className="mt-1 text-xs">
                        账号年龄：{calculateAccountAge(adminInfo?.createTime)}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item 
                    label={<Text strong className="flex items-center gap-2"><EnvironmentOutlined /> 最后登录</Text>}
                  >
                    {adminInfo?.lastLogin ? formatDate(adminInfo.lastLogin) : '未知'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Card>
          </AnimatedCard>
        </Col>

        {/* 右侧内容区域 */}
        <Col xs={24} lg={16}>
          <Row gutter={[24, 24]}>
            {/* 顶部卡片统计 */}
            <Col xs={24}>
              <AnimatedCard delay={0.2}>
                <Card bordered={false} className="shadow-md dark:shadow-gray-800/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-100 dark:border-blue-900/30"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Text className="text-blue-600 dark:text-blue-400 font-medium">登录次数</Text>
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                          <DashboardOutlined className="text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>
                      <Title level={2} className="m-0 text-gray-900 dark:text-white">
                        {adminInfo?.loginCount || 0}
                      </Title>
                      <Text type="secondary" className="text-sm">
                        上次登录: {adminInfo?.lastLogin ? formatDate(adminInfo.lastLogin) : '未知'}
                      </Text>
                    </motion.div>

                    <motion.div 
                      className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-100 dark:border-green-900/30"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Text className="text-green-600 dark:text-green-400 font-medium">操作记录</Text>
                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-full">
                          <DatabaseOutlined className="text-green-500 dark:text-green-400" />
                        </div>
                      </div>
                      <Title level={2} className="m-0 text-gray-900 dark:text-white">
                        {logs.length || 0}
                      </Title>
                      <Text type="secondary" className="text-sm">
                        检测到的操作记录总数
                      </Text>
                    </motion.div>

                    <motion.div 
                      className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-100 dark:border-amber-900/30"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Text className="text-amber-600 dark:text-amber-400 font-medium">账号状态</Text>
                        <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
                          <SafetyOutlined className="text-amber-500 dark:text-amber-400" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Title level={2} className="m-0 text-gray-900 dark:text-white">
                          {adminInfo?.status === 1 ? '正常' : '已禁用'}
                        </Title>
                        <StatusTag status={adminInfo?.status} />
                      </div>
                      <div className="mt-1">
                        <Progress
                          percent={adminInfo?.status === 1 ? 100 : 0}
                          size="small"
                          strokeColor={adminInfo?.status === 1 ? "#22c55e" : "#ef4444"}
                          showInfo={false}
                        />
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </AnimatedCard>
            </Col>

            {/* 系统使用情况 */}
            <Col xs={24} md={12}>
              <AnimatedCard delay={0.3} className="h-full">
                <Card 
                  title={<div className="flex items-center gap-2"><DashboardOutlined /> 系统使用情况</div>}
                  bordered={false} 
                  className="shadow-md dark:shadow-gray-800/10 h-full"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text>系统活跃度</Text>
                        <Text strong>{logs.length ? '活跃' : '低活跃'}</Text>
                      </div>
                      <Progress 
                        percent={logs.length ? Math.min(logs.length * 10, 100) : 20} 
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text>账号完整度</Text>
                        <Text strong>{adminInfo?.email && adminInfo?.phone ? '完整' : '需完善'}</Text>
                      </div>
                      <Progress 
                        percent={
                          (adminInfo?.email ? 40 : 0) + 
                          (adminInfo?.phone ? 30 : 0) + 
                          (adminInfo?.avatar ? 30 : 0)
                        }
                        strokeColor={{
                          '0%': '#ffa940',
                          '100%': '#73d13d',
                        }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text>账号安全性</Text>
                        <Text strong>
                          {adminInfo?.email && adminInfo?.phone ? '高' : 
                           (adminInfo?.email || adminInfo?.phone ? '中' : '低')}
                        </Text>
                      </div>
                      <Progress 
                        percent={
                          (adminInfo?.email ? 40 : 0) + 
                          (adminInfo?.phone ? 40 : 0) + 
                          (20) // 基础分
                        }
                        strokeColor={{
                          '0%': '#ff4d4f',
                          '100%': '#52c41a',
                        }}
                        status={
                          (adminInfo?.email && adminInfo?.phone) ? 'success' : 
                          (adminInfo?.email || adminInfo?.phone ? 'normal' : 'exception')
                        }
                      />
                    </div>
                  </div>
                  
                  {/* 安全提示 */}
                  <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full mt-0.5">
                        <LockOutlined className="text-blue-500 dark:text-blue-300" />
                      </div>
                      <div>
                        <Text strong className="text-blue-700 dark:text-blue-300">安全提示</Text>
                        <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                          定期更改密码并验证您的电子邮箱和手机号可以提高账号安全性。
                          <Button 
                            size="small" 
                            type="link" 
                            className="p-0 ml-1 text-blue-600 dark:text-blue-400"
                            onClick={() => {}}
                          >
                            了解更多
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>
            </Col>

            {/* 最近操作记录 */}
            <Col xs={24} md={12}>
              <AnimatedCard delay={0.4} className="h-full">
                <Card 
                  title={<div className="flex items-center gap-2"><ClockCircleOutlined /> 最近操作记录</div>}
                  bordered={false} 
                  className="shadow-md dark:shadow-gray-800/10 h-full"
                  extra={<Link to="/logs"><Button type="link" size="small">查看更多</Button></Link>}
                >
                  {logs.length > 0 ? (
                    <Timeline className="overflow-auto max-h-80 pr-2">
                      {logs.map((log, index) => (
                        <Timeline.Item 
                          key={index} 
                          color={
                            log.operation?.includes('登录') ? 'blue' :
                            log.operation?.includes('新增') ? 'green' :
                            log.operation?.includes('删除') ? 'red' :
                            'gray'
                          }
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: index * 0.1, 
                              type: "spring", 
                              stiffness: 100 
                            }}
                          >
                            <p className="mb-1">
                              <Text strong>{log.operation || '系统操作'}</Text>
                              <Tag color="cyan" className="ml-2">{log.module || '系统'}</Tag>
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              IP: {log.ip || '未知'} | 时间: {formatDate(log.createTime)}
                            </p>
                            {log.detail && (
                              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                                {log.detail}
                              </p>
                            )}
                          </motion.div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                      <ClockCircleOutlined className="text-4xl mb-3 opacity-40" />
                      <p>暂无操作记录</p>
                      <Text type="secondary" className="text-sm">系统未检测到任何操作日志</Text>
                    </div>
                  )}
                </Card>
              </AnimatedCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </motion.div>
  );
};

export default AdminProfile; 