import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, DatePicker, Button, Tooltip, message } from 'antd'
import { 
  LoginOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  ReloadOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { getLoginRecords } from '@/api/admin'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface LoginRecord {
  id: string
  loginTime: string
  ip: string
  location: string
  device: string
  browser: string
  os: string
  status: 'success' | 'failed'
  duration?: number
  logoutTime?: string
}

interface LoginRecordsProps {
  className?: string
}

const LoginRecords: React.FC<LoginRecordsProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<LoginRecord[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  // 获取设备图标
  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase()
    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return <MobileOutlined className="text-blue-500" />
    } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return <TabletOutlined className="text-green-500" />
    } else {
      return <DesktopOutlined className="text-gray-500" />
    }
  }

  // 格式化持续时间
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-'
    if (minutes < 60) {
      return `${minutes}分钟`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
    }
  }

  // 表格列定义
  const columns: ColumnsType<LoginRecord> = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(time).format('YYYY-MM-DD')}</Text>
          <Text type="secondary" className="text-xs">
            {dayjs(time).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      sorter: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
      filters: [
        { text: '成功', value: 'success' },
        { text: '失败', value: 'failed' }
      ]
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => (
        <Text code className="text-xs">{ip}</Text>
      )
    },
    {
      title: '地理位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => (
        <Space size={4}>
          <EnvironmentOutlined className="text-gray-400" />
          <Text className="text-xs">{location || '未知'}</Text>
        </Space>
      )
    },
    {
      title: '设备信息',
      key: 'device',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            {getDeviceIcon(record.device)}
            <Text className="text-xs">{record.device}</Text>
          </Space>
          <Text type="secondary" className="text-xs">
            {record.browser} / {record.os}
          </Text>
        </Space>
      )
    },
    {
      title: '在线时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => (
        <Space size={4}>
          <ClockCircleOutlined className="text-gray-400" />
          <Text className="text-xs">{formatDuration(duration)}</Text>
        </Space>
      )
    },
    {
      title: '退出时间',
      dataIndex: 'logoutTime',
      key: 'logoutTime',
      width: 120,
      render: (time?: string) => (
        time ? (
          <Text className="text-xs">{dayjs(time).format('HH:mm:ss')}</Text>
        ) : (
          <Text type="secondary" className="text-xs">仍在线</Text>
        )
      )
    }
  ]

  // 获取登录记录
  const fetchLoginRecords = async (params = {}) => {
    try {
      setLoading(true)
      const queryParams = {
        page: pagination.current,
        size: pagination.pageSize,
        ...params
      }

      if (dateRange) {
        queryParams.startTime = dateRange[0].format('YYYY-MM-DD')
        queryParams.endTime = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await getLoginRecords(queryParams)
      
      if (response.data?.code === 200) {
        setRecords(response.data.data.records || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }))
      } else {
        message.error('获取登录记录失败')
      }
    } catch (error) {
      console.error('获取登录记录失败:', error)
      message.error('获取登录记录失败')
      // 设置模拟数据用于展示
      setRecords([
        {
          id: '1',
          loginTime: '2025-01-20 09:30:15',
          ip: '192.168.1.100',
          location: '北京市',
          device: 'Desktop',
          browser: 'Chrome 120',
          os: 'Windows 11',
          status: 'success',
          duration: 480,
          logoutTime: '2025-01-20 17:30:15'
        },
        {
          id: '2',
          loginTime: '2025-01-19 14:20:30',
          ip: '192.168.1.101',
          location: '上海市',
          device: 'Mobile',
          browser: 'Safari 17',
          os: 'iOS 17',
          status: 'success',
          duration: 120
        },
        {
          id: '3',
          loginTime: '2025-01-19 08:15:45',
          ip: '192.168.1.102',
          location: '广州市',
          device: 'Desktop',
          browser: 'Firefox 121',
          os: 'macOS 14',
          status: 'failed'
        }
      ])
      setPagination(prev => ({ ...prev, total: 3 }))
    } finally {
      setLoading(false)
    }
  }

  // 处理表格变化
  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }))
    
    fetchLoginRecords({
      ...filters,
      sortField: sorter.field,
      sortOrder: sorter.order
    })
  }

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates)
  }

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchLoginRecords()
  }

  // 重置
  const handleReset = () => {
    setDateRange(null)
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchLoginRecords()
  }

  useEffect(() => {
    fetchLoginRecords()
  }, [])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <Space>
            <LoginOutlined />
            <Title level={4} className="m-0">登录记录</Title>
          </Space>
        }
        extra={
          <Space>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={['开始日期', '结束日期']}
              size="small"
            />
            <Button size="small" onClick={handleSearch}>搜索</Button>
            <Button size="small" onClick={handleReset}>重置</Button>
            <Tooltip title="刷新">
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchLoginRecords()}
              />
            </Tooltip>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </motion.div>
  )
}

export default LoginRecords
