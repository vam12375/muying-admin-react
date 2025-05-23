import React, { useState } from 'react'
import { Row, Col, Space, Divider, Typography, Segmented, Switch, Input, Tabs } from 'antd'
import { 
  RocketOutlined, 
  AppstoreOutlined,
  BulbOutlined, 
  ThunderboltOutlined,
  HeartOutlined,
  StarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import PageTransition from '@/components/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import { FadeInItem } from '@/components/animations/FadeIn'
import SlideIn from '@/components/animations/SlideIn'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Tag from '@/components/Tag'
import Badge from '@/components/Badge'
import Avatar from '@/components/Avatar'
import StatusIndicator from '@/components/StatusIndicator'
import { NotificationContext } from '@/components/Notification'
import StatsCard from '@/components/StatsCard'
import { useTheme } from '@/theme/useTheme'
import clsx from 'clsx'

const { Title, Paragraph, Text } = Typography

const ComponentsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<string | number>('buttons')
  const [buttonVariant, setButtonVariant] = useState<string | number>('default')
  const { showNotification } = React.useContext(NotificationContext)
  
  const handleShowNotification = (type: string) => {
    showNotification({
      type: type as 'success' | 'info' | 'warning' | 'error',
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} 通知`,
      message: `这是一条${type}通知示例，用于展示通知组件的样式和动画效果。`,
      duration: 4000
    })
  }
  
  const sectionNavs = [
    { value: 'buttons', label: <span><RocketOutlined /> 按钮</span> },
    { value: 'cards', label: <span><AppstoreOutlined /> 卡片</span> },
    { value: 'tags', label: <span><BulbOutlined /> 标签</span> },
    { value: 'badges', label: <span><StarOutlined /> 徽章</span> },
    { value: 'avatars', label: <span><UserOutlined /> 头像</span> },
    { value: 'status', label: <span><CheckOutlined /> 状态指示器</span> },
    { value: 'notifications', label: <span><BellOutlined /> 通知</span> },
    { value: 'statistics', label: <span><ThunderboltOutlined /> 统计卡片</span> },
    { value: 'animations', label: <span><ClockCircleOutlined /> 动画</span> },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'buttons':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="按钮类型" shadow="sm">
                  <Segmented 
                    options={['default', 'primary', 'success', 'warning', 'danger']}
                    value={buttonVariant}
                    onChange={setButtonVariant}
                    className="mb-6"
                  />
                  <div className="flex flex-wrap gap-4">
                    <Button type={buttonVariant as any}>默认按钮</Button>
                    <Button type={buttonVariant as any} icon={<PlusOutlined />}>图标按钮</Button>
                    <Button type={buttonVariant as any} animated>动画按钮</Button>
                    <Button type={buttonVariant as any} rounded="full">圆角按钮</Button>
                    <Button type={buttonVariant as any} loading>加载按钮</Button>
                    <Button type={buttonVariant as any} disabled>禁用按钮</Button>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="按钮尺寸" shadow="sm">
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button type="primary" size="large">大号按钮</Button>
                    <Button type="primary">默认按钮</Button>
                    <Button type="primary" size="small">小号按钮</Button>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="按钮效果" shadow="sm">
                  <div className="flex flex-wrap gap-4">
                    <Button type="primary" animated effect="pulse">脉冲效果</Button>
                    <Button type="success" animated effect="bounce">弹跳效果</Button>
                    <Button type="warning" animated effect="shake">抖动效果</Button>
                    <Button type="danger" animated effect="rotate">旋转效果</Button>
                    <Button type="primary" outlined animated>边框动画</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'cards':
        return (
          <div className="section-content">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="基础卡片" shadow="sm">
                  <Paragraph>这是一个基础卡片示例，展示基本内容和标题。</Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  title="带阴影卡片" 
                  shadow="md"
                  extra={<Button type="link" size="small">更多</Button>}
                >
                  <Paragraph>这张卡片有中等阴影效果，并带有额外的操作按钮。</Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  title={
                    <div className="flex items-center">
                      <StarOutlined className="mr-2 text-yellow-500" />
                      <span>带图标的卡片</span>
                    </div>
                  }
                  shadow="hover"
                >
                  <Paragraph>
                    这张卡片只在鼠标悬浮时显示阴影，标题中包含图标。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  cover={
                    <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <Text className="text-white text-xl font-bold">封面图片</Text>
                    </div>
                  }
                  shadow="lg"
                >
                  <Title level={5}>带封面的卡片</Title>
                  <Paragraph>这张卡片顶部有封面图片区域，底部是内容区域。</Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'tags':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="基础标签" shadow="sm">
                  <div className="flex flex-wrap gap-2">
                    <Tag>默认标签</Tag>
                    <Tag color="blue">蓝色标签</Tag>
                    <Tag color="green">绿色标签</Tag>
                    <Tag color="yellow">黄色标签</Tag>
                    <Tag color="red">红色标签</Tag>
                    <Tag color="purple">紫色标签</Tag>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="标签变体" shadow="sm">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag color="blue" variant="solid">实心标签</Tag>
                    <Tag color="green" variant="solid">实心标签</Tag>
                    <Tag color="yellow" variant="solid">实心标签</Tag>
                    <Tag color="red" variant="solid">实心标签</Tag>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag color="blue" variant="light">浅色标签</Tag>
                    <Tag color="green" variant="light">浅色标签</Tag>
                    <Tag color="yellow" variant="light">浅色标签</Tag>
                    <Tag color="red" variant="light">浅色标签</Tag>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue" variant="outline">轮廓标签</Tag>
                    <Tag color="green" variant="outline">轮廓标签</Tag>
                    <Tag color="yellow" variant="outline">轮廓标签</Tag>
                    <Tag color="red" variant="outline">轮廓标签</Tag>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="标签形状" shadow="sm">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag color="blue" rounded="none">方形标签</Tag>
                    <Tag color="green" rounded="sm">小圆角标签</Tag>
                    <Tag color="yellow">默认圆角</Tag>
                    <Tag color="red" rounded="lg">大圆角标签</Tag>
                    <Tag color="purple" rounded="full">胶囊标签</Tag>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue" variant="light" rounded="full">
                      <UserOutlined className="mr-1" /> 用户标签
                    </Tag>
                    <Tag color="green" variant="light" rounded="full">
                      <CheckOutlined className="mr-1" /> 已完成
                    </Tag>
                    <Tag color="yellow" variant="light" rounded="full">
                      <ClockCircleOutlined className="mr-1" /> 等待中
                    </Tag>
                    <Tag color="red" variant="light" rounded="full" closable>
                      可删除标签
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'badges':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="基础徽章" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center">
                    <Badge count={5}>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={0} showZero>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={99}>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={100} overflowCount={99}>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={<CheckOutlined style={{ color: '#fff' }} />}>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="徽章颜色" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center">
                    <Badge count={5} color="blue">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} color="green">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} color="yellow">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} color="red">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} color="purple">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>

                    <Badge dot color="blue">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge dot color="green">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge dot color="yellow">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge dot color="red">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="徽章变体" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center">
                    <Badge count={5} variant="standard">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} variant="outline">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} variant="light" color="blue">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} variant="light" color="green">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} variant="light" color="yellow">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                    
                    <Badge count={5} variant="light" color="red">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Badge>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'avatars':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="基础头像" shadow="sm">
                  <div className="flex flex-wrap gap-4 items-center">
                    <Avatar size="large">大</Avatar>
                    <Avatar>中</Avatar>
                    <Avatar size="small">小</Avatar>
                    <Avatar icon={<UserOutlined />} />
                    <Avatar>U</Avatar>
                    <Avatar>USER</Avatar>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="头像颜色" shadow="sm">
                  <div className="flex flex-wrap gap-4 items-center">
                    <Avatar color="blue">蓝</Avatar>
                    <Avatar color="green">绿</Avatar>
                    <Avatar color="yellow">黄</Avatar>
                    <Avatar color="red">红</Avatar>
                    <Avatar color="purple">紫</Avatar>
                    <Avatar color="pink">粉</Avatar>
                    <Avatar color="orange">橙</Avatar>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="头像形状和变体" shadow="sm">
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                    <Avatar shape="circle">圆</Avatar>
                    <Avatar shape="square">方</Avatar>
                    <Avatar shape="square" className="rounded-md">圆角</Avatar>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                    <Avatar variant="filled" color="blue">填</Avatar>
                    <Avatar variant="light" color="green">浅</Avatar>
                    <Avatar variant="outline" color="red">边</Avatar>
                  </div>
                  
                  <Divider orientation="left">头像组</Divider>
                  <Avatar.Group spacing={-8}>
                    <Avatar color="blue">A</Avatar>
                    <Avatar color="green">B</Avatar>
                    <Avatar color="yellow">C</Avatar>
                    <Avatar color="red">D</Avatar>
                    <Avatar className="bg-gray-400 text-white">+3</Avatar>
                  </Avatar.Group>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'status':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="状态指示器" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center">
                    <StatusIndicator type="success" text="成功" />
                    <StatusIndicator type="processing" text="处理中" />
                    <StatusIndicator type="warning" text="警告" />
                    <StatusIndicator type="error" text="错误" />
                    <StatusIndicator type="default" text="默认" />
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="带动画的状态指示器" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center">
                    <StatusIndicator type="success" text="成功" ping />
                    <StatusIndicator type="processing" text="处理中" ping />
                    <StatusIndicator type="warning" text="警告" ping />
                    <StatusIndicator type="error" text="错误" ping />
                    <StatusIndicator type="default" text="默认" ping />
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="状态指示器变体" shadow="sm">
                  <div className="flex flex-wrap gap-6 items-center mb-4">
                    <StatusIndicator type="success" variant="dot" />
                    <StatusIndicator type="processing" variant="dot" />
                    <StatusIndicator type="warning" variant="dot" />
                    <StatusIndicator type="error" variant="dot" />
                    <StatusIndicator type="default" variant="dot" />
                  </div>
                  
                  <div className="flex flex-wrap gap-6 items-center">
                    <StatusIndicator type="success" variant="badge" text="在线" />
                    <StatusIndicator type="warning" variant="badge" text="离开" />
                    <StatusIndicator type="error" variant="badge" text="离线" />
                    <StatusIndicator type="default" variant="badge" text="未知" />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="section-content">
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <Card title="通知类型" shadow="sm">
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      type="primary" 
                      onClick={() => handleShowNotification('success')}
                    >
                      成功通知
                    </Button>
                    <Button 
                      type="default" 
                      onClick={() => handleShowNotification('info')}
                    >
                      信息通知
                    </Button>
                    <Button 
                      type="warning" 
                      onClick={() => handleShowNotification('warning')}
                    >
                      警告通知
                    </Button>
                    <Button 
                      type="danger" 
                      onClick={() => handleShowNotification('error')}
                    >
                      错误通知
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
          
      case 'statistics':
        return (
          <div className="section-content">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatsCard
                  title="总销售额"
                  value={125600}
                  prefix="¥"
                  icon={<RocketOutlined />}
                  color="primary"
                  trend={{ value: 12.5, isUpward: true, text: '同比上周' }}
                />
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <StatsCard
                  title="新增用户"
                  value={856}
                  icon={<UserOutlined />}
                  color="success"
                  trend={{ value: 3.2, isUpward: true, text: '同比上周' }}
                />
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <StatsCard
                  title="订单数"
                  value={248}
                  icon={<AppstoreOutlined />}
                  color="warning"
                  trend={{ value: 1.8, isUpward: false, text: '同比上周' }}
                />
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <StatsCard
                  title="转化率"
                  value={28.5}
                  suffix="%"
                  icon={<ThunderboltOutlined />}
                  color="danger"
                  trend={{ value: 4.6, isUpward: true, text: '同比上周' }}
                />
              </Col>
            </Row>
          </div>
        );
        
      case 'animations':
        return (
          <div className="section-content">
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Card title="FadeIn 渐显动画" shadow="sm">
                  <FadeIn staggerChildren={0.1}>
                    <FadeInItem>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-3">
                        这是渐显动画的第一个元素
                      </div>
                    </FadeInItem>
                    <FadeInItem>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg mb-3">
                        这是渐显动画的第二个元素
                      </div>
                    </FadeInItem>
                    <FadeInItem>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg mb-3">
                        这是渐显动画的第三个元素
                      </div>
                    </FadeInItem>
                  </FadeIn>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="SlideIn 滑入动画" shadow="sm">
                  <div className="flex flex-wrap gap-3">
                    <SlideIn direction="left">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
                        从左侧滑入
                      </div>
                    </SlideIn>
                    
                    <SlideIn direction="right">
                      <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-lg">
                        从右侧滑入
                      </div>
                    </SlideIn>
                    
                    <SlideIn direction="top">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                        从顶部滑入
                      </div>
                    </SlideIn>
                    
                    <SlideIn direction="bottom">
                      <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-lg">
                        从底部滑入
                      </div>
                    </SlideIn>
                  </div>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="自定义动画" shadow="sm">
                  <div className="flex flex-wrap gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold"
                    >
                      弹性
                    </motion.div>
                    
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold"
                    >
                      悬浮
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
                    >
                      点击
                    </motion.div>
                    
                    <motion.div
                      initial={{ borderRadius: "16px" }}
                      whileHover={{ borderRadius: "50%" }}
                      transition={{ duration: 0.3 }}
                      className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold"
                    >
                      变形
                    </motion.div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="component-showcase pb-10">
        <FadeIn>
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="!mb-1">组件展示</Title>
              <Paragraph className="text-gray-500 dark:text-gray-400">
                展示所有可用的UI组件和动画效果
              </Paragraph>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {isDark ? '深色' : '浅色'}模式
              </span>
              <Switch 
                checked={isDark} 
                onChange={toggleTheme} 
                checkedChildren="🌙" 
                unCheckedChildren="☀️"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            <div className="component-nav hidden lg:block">
              <Card shadow="sm" className="component-nav-card sticky top-6">
                <div className="py-2">
                  {sectionNavs.map((nav) => (
                    <div 
                      key={nav.value as string} 
                      className={clsx(
                        'px-4 py-2 rounded-lg cursor-pointer transition-colors mb-1 flex items-center',
                        activeSection === nav.value 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                      onClick={() => setActiveSection(nav.value)}
                    >
                      {nav.label}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="component-content">
              <div className="lg:hidden mb-4">
                <Segmented
                  options={sectionNavs}
                  value={activeSection}
                  onChange={setActiveSection}
                  block
                />
              </div>
              
              <div className="component-section">
                <motion.div
                  key={activeSection as string}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSection()}
                </motion.div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

export default ComponentsPage 