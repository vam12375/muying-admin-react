import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tooltip } from 'antd'
import { 
  LoginOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  TrophyOutlined,
  FireOutlined,
  UserOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { getAdminStatistics } from '@/api/admin'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface StatisticsData {
  totalLogins: number
  todayLogins: number
  weekLogins: number
  monthLogins: number
  totalOperations: number
  todayOperations: number
  weekOperations: number
  monthOperations: number
  avgOnlineTime: number
  longestSession: number
  lastLoginTime: string
  accountAge: number
  securityScore: number
  activeHours: number[]
  operationTypes: { [key: string]: number }
}

interface AdminStatisticsProps {
  className?: string
}

const AdminStatistics: React.FC<AdminStatisticsProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalLogins: 0,
    todayLogins: 0,
    weekLogins: 0,
    monthLogins: 0,
    totalOperations: 0,
    todayOperations: 0,
    weekOperations: 0,
    monthOperations: 0,
    avgOnlineTime: 0,
    longestSession: 0,
    lastLoginTime: '',
    accountAge: 0,
    securityScore: 0,
    activeHours: [],
    operationTypes: {}
  })

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await getAdminStatistics()
      
      if (response.data?.code === 200) {
        setStatistics(response.data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 设置模拟数据
      setStatistics({
        totalLogins: 1247,
        todayLogins: 3,
        weekLogins: 18,
        monthLogins: 89,
        totalOperations: 3456,
        todayOperations: 12,
        weekOperations: 78,
        monthOperations: 234,
        avgOnlineTime: 6.5,
        longestSession: 12.3,
        lastLoginTime: '2025-01-20 09:30:15',
        accountAge: 365,
        securityScore: 95,
        activeHours: [0, 0, 0, 0, 0, 0, 0, 2, 8, 15, 12, 10, 8, 6, 9, 11, 7, 4, 2, 1, 0, 0, 0, 0],
        operationTypes: {
          '查看': 45,
          '编辑': 25,
          '新增': 20,
          '删除': 10
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // 格式化时长
  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}分钟`
    } else {
      const h = Math.floor(hours)
      const m = Math.round((hours - h) * 60)
      return `${h}小时${m > 0 ? m + '分钟' : ''}`
    }
  }

  // 获取安全等级
  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: '优秀', color: '#52c41a' }
    if (score >= 80) return { level: '良好', color: '#1890ff' }
    if (score >= 70) return { level: '一般', color: '#faad14' }
    return { level: '较差', color: '#ff4d4f' }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  const securityLevel = getSecurityLevel(statistics.securityScore)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Row gutter={[16, 16]}>
        {/* 登录统计 */}
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm h-full">
              <Statistic
                title={
                  <Space>
                    <LoginOutlined className="text-blue-500" />
                    <span>总登录次数</span>
                  </Space>
                }
                value={statistics.totalLogins}
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <Text type="secondary">今日</Text>
                  <Text strong>{statistics.todayLogins}次</Text>
                </div>
                <div className="flex justify-between text-xs">
                  <Text type="secondary">本周</Text>
                  <Text strong>{statistics.weekLogins}次</Text>
                </div>
                <div className="flex justify-between text-xs">
                  <Text type="secondary">本月</Text>
                  <Text strong>{statistics.monthLogins}次</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 操作统计 */}
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm h-full">
              <Statistic
                title={
                  <Space>
                    <HistoryOutlined className="text-green-500" />
                    <span>总操作次数</span>
                  </Space>
                }
                value={statistics.totalOperations}
                suffix="次"
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <Text type="secondary">今日</Text>
                  <Text strong>{statistics.todayOperations}次</Text>
                </div>
                <div className="flex justify-between text-xs">
                  <Text type="secondary">本周</Text>
                  <Text strong>{statistics.weekOperations}次</Text>
                </div>
                <div className="flex justify-between text-xs">
                  <Text type="secondary">本月</Text>
                  <Text strong>{statistics.monthOperations}次</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 在线时长 */}
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm h-full">
              <Statistic
                title={
                  <Space>
                    <ClockCircleOutlined className="text-orange-500" />
                    <span>平均在线时长</span>
                  </Space>
                }
                value={formatDuration(statistics.avgOnlineTime)}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <Text type="secondary">最长会话</Text>
                  <Text strong>{formatDuration(statistics.longestSession)}</Text>
                </div>
                <div className="flex justify-between text-xs">
                  <Text type="secondary">最后登录</Text>
                  <Text strong>{dayjs(statistics.lastLoginTime).format('MM-DD HH:mm')}</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 账号信息 */}
        <Col xs={24} sm={12} lg={6}>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm h-full">
              <Statistic
                title={
                  <Space>
                    <CalendarOutlined className="text-purple-500" />
                    <span>账号年龄</span>
                  </Space>
                }
                value={Math.floor(statistics.accountAge / 30)}
                suffix="个月"
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <Space size={4}>
                    <SafetyOutlined className="text-gray-400" />
                    <Text type="secondary" className="text-xs">安全评分</Text>
                  </Space>
                  <Text strong className="text-xs" style={{ color: securityLevel.color }}>
                    {securityLevel.level}
                  </Text>
                </div>
                <Progress
                  percent={statistics.securityScore}
                  strokeColor={securityLevel.color}
                  size="small"
                  showInfo={false}
                />
                <Text className="text-xs text-gray-500">{statistics.securityScore}分</Text>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 操作类型分布 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              title={
                <Space>
                  <TrophyOutlined />
                  <span>操作类型分布</span>
                </Space>
              }
              className="shadow-sm"
            >
              <div className="space-y-3">
                {Object.entries(statistics.operationTypes).map(([type, count], index) => {
                  const total = Object.values(statistics.operationTypes).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                  const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f']
                  
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <Text className="text-sm">{type}</Text>
                        <Space>
                          <Text strong className="text-sm">{count}次</Text>
                          <Text type="secondary" className="text-xs">({percentage}%)</Text>
                        </Space>
                      </div>
                      <Progress
                        percent={percentage}
                        strokeColor={colors[index % colors.length]}
                        size="small"
                        showInfo={false}
                      />
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* 活跃时段 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              title={
                <Space>
                  <FireOutlined />
                  <span>24小时活跃度</span>
                </Space>
              }
              className="shadow-sm"
            >
              <div className="grid grid-cols-12 gap-1">
                {statistics.activeHours.map((count, hour) => {
                  const maxCount = Math.max(...statistics.activeHours)
                  const intensity = maxCount > 0 ? count / maxCount : 0
                  const opacity = 0.1 + intensity * 0.9
                  
                  return (
                    <Tooltip key={hour} title={`${hour}:00 - ${count}次操作`}>
                      <div
                        className="h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: `rgba(24, 144, 255, ${opacity})`,
                          border: intensity > 0.7 ? '1px solid #1890ff' : 'none'
                        }}
                      >
                        <Text className="text-xs font-medium" style={{ 
                          color: intensity > 0.5 ? '#fff' : '#666' 
                        }}>
                          {hour}
                        </Text>
                      </div>
                    </Tooltip>
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>0时</span>
                <span>12时</span>
                <span>23时</span>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  )
}

export default AdminStatistics
