import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, DatePicker, Button, Tooltip, message, Select } from 'antd'
import { 
  HistoryOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { getOperationRecords } from '@/api/admin'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface OperationRecord {
  id: string
  operation: string
  module: string
  target: string
  method: string
  ip: string
  userAgent: string
  createTime: string
  duration: number
  status: 'success' | 'failed'
  description: string
  params?: string
  result?: string
}

interface OperationRecordsProps {
  className?: string
}

const OperationRecords: React.FC<OperationRecordsProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<OperationRecord[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [moduleFilter, setModuleFilter] = useState<string>('')
  const [operationFilter, setOperationFilter] = useState<string>('')

  // 获取操作图标
  const getOperationIcon = (operation: string) => {
    const operationLower = operation.toLowerCase()
    if (operationLower.includes('新增') || operationLower.includes('创建') || operationLower.includes('添加')) {
      return <PlusOutlined className="text-green-500" />
    } else if (operationLower.includes('编辑') || operationLower.includes('修改') || operationLower.includes('更新')) {
      return <EditOutlined className="text-blue-500" />
    } else if (operationLower.includes('删除') || operationLower.includes('移除')) {
      return <DeleteOutlined className="text-red-500" />
    } else if (operationLower.includes('查看') || operationLower.includes('查询')) {
      return <EyeOutlined className="text-gray-500" />
    } else if (operationLower.includes('设置') || operationLower.includes('配置')) {
      return <SettingOutlined className="text-purple-500" />
    } else if (operationLower.includes('登录') || operationLower.includes('登出')) {
      return <UserOutlined className="text-orange-500" />
    } else {
      return <HistoryOutlined className="text-gray-400" />
    }
  }

  // 获取模块颜色
  const getModuleColor = (module: string) => {
    const colors = {
      '用户管理': 'blue',
      '商品管理': 'green',
      '订单管理': 'orange',
      '系统设置': 'purple',
      '权限管理': 'red',
      '数据统计': 'cyan',
      '内容管理': 'magenta',
      '财务管理': 'gold'
    }
    return colors[module as keyof typeof colors] || 'default'
  }

  // 表格列定义
  const columns: ColumnsType<OperationRecord> = [
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-xs">{dayjs(time).format('MM-DD')}</Text>
          <Text type="secondary" className="text-xs">
            {dayjs(time).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (operation: string) => (
        <Space size={4}>
          {getOperationIcon(operation)}
          <Text className="text-xs">{operation}</Text>
        </Space>
      ),
      filters: [
        { text: '新增', value: '新增' },
        { text: '编辑', value: '编辑' },
        { text: '删除', value: '删除' },
        { text: '查看', value: '查看' },
        { text: '登录', value: '登录' }
      ]
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => (
        <Tag color={getModuleColor(module)} className="text-xs">
          {module}
        </Tag>
      ),
      filters: [
        { text: '用户管理', value: '用户管理' },
        { text: '商品管理', value: '商品管理' },
        { text: '订单管理', value: '订单管理' },
        { text: '系统设置', value: '系统设置' }
      ]
    },
    {
      title: '操作对象',
      dataIndex: 'target',
      key: 'target',
      width: 120,
      render: (target: string) => (
        <Text className="text-xs" ellipsis={{ tooltip: target }}>
          {target}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'} className="text-xs">
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
      filters: [
        { text: '成功', value: 'success' },
        { text: '失败', value: 'failed' }
      ]
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => (
        <Text className="text-xs">
          {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`}
        </Text>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 110,
      render: (ip: string) => (
        <Text code className="text-xs">{ip}</Text>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text className="text-xs" ellipsis={{ tooltip: description }}>
          {description}
        </Text>
      )
    }
  ]

  // 获取操作记录
  const fetchOperationRecords = async (params = {}) => {
    try {
      setLoading(true)
      const queryParams = {
        page: pagination.current,
        size: pagination.pageSize,
        module: moduleFilter,
        operation: operationFilter,
        ...params
      }

      if (dateRange) {
        queryParams.startTime = dateRange[0].format('YYYY-MM-DD')
        queryParams.endTime = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await getOperationRecords(queryParams)
      
      if (response.data?.code === 200) {
        setRecords(response.data.data.records || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }))
      } else {
        message.error('获取操作记录失败')
      }
    } catch (error) {
      console.error('获取操作记录失败:', error)
      message.error('获取操作记录失败')
      // 设置模拟数据用于展示
      setRecords([
        {
          id: '1',
          operation: '新增商品',
          module: '商品管理',
          target: '母婴奶粉',
          method: 'POST',
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          createTime: '2025-01-20 10:30:15',
          duration: 1200,
          status: 'success',
          description: '成功添加新商品：母婴奶粉'
        },
        {
          id: '2',
          operation: '编辑用户',
          module: '用户管理',
          target: '用户ID:12345',
          method: 'PUT',
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          createTime: '2025-01-20 09:45:30',
          duration: 800,
          status: 'success',
          description: '修改用户基本信息'
        },
        {
          id: '3',
          operation: '删除订单',
          module: '订单管理',
          target: '订单号:ORD001',
          method: 'DELETE',
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0.0.0',
          createTime: '2025-01-20 09:15:45',
          duration: 500,
          status: 'failed',
          description: '删除订单失败：订单状态不允许删除'
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
    
    fetchOperationRecords({
      ...filters,
      sortField: sorter.field,
      sortOrder: sorter.order
    })
  }

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchOperationRecords()
  }

  // 重置筛选
  const handleReset = () => {
    setDateRange(null)
    setModuleFilter('')
    setOperationFilter('')
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchOperationRecords()
  }

  useEffect(() => {
    fetchOperationRecords()
  }, [])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <Title level={4} className="m-0">操作记录</Title>
          </Space>
        }
        extra={
          <Space wrap>
            <Select
              placeholder="选择模块"
              value={moduleFilter}
              onChange={setModuleFilter}
              allowClear
              size="small"
              style={{ width: 120 }}
            >
              <Option value="用户管理">用户管理</Option>
              <Option value="商品管理">商品管理</Option>
              <Option value="订单管理">订单管理</Option>
              <Option value="系统设置">系统设置</Option>
            </Select>
            <Select
              placeholder="选择操作"
              value={operationFilter}
              onChange={setOperationFilter}
              allowClear
              size="small"
              style={{ width: 100 }}
            >
              <Option value="新增">新增</Option>
              <Option value="编辑">编辑</Option>
              <Option value="删除">删除</Option>
              <Option value="查看">查看</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始日期', '结束日期']}
              size="small"
            />
            <Button size="small" onClick={handleSearch}>搜索</Button>
            <Button size="small" onClick={handleReset}>重置</Button>
            <Tooltip title="刷新">
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchOperationRecords()}
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
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </motion.div>
  )
}

export default OperationRecords
