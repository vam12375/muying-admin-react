import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Input, DatePicker, Space, Tag, Modal, message, Typography, Form, Select, Tooltip } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getTransactionPage, getTransactionDetail } from '@/api/userAccount'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// 定义交易记录数据接口
interface TransactionData {
  id: number
  userId: number
  type: number
  amount: number
  beforeBalance: number
  afterBalance: number
  status: number
  paymentMethod: string
  transactionNo: string
  createTime: string
  updateTime: string
  description: string
  remark: string
  user?: {
    id: number
    username: string
    nickname: string
    email: string
    phone: string
  }
}

// 定义分页数据接口
interface Pagination {
  current: number
  pageSize: number
  total: number
}

const TransactionList: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<TransactionData | null>(null)
  
  // 查询条件
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [type, setType] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined)
  const [transactionNo, setTransactionNo] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined>(undefined)
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  
  // 加载交易记录数据
  const fetchTransactions = async (
    page = pagination.current, 
    pageSize = pagination.pageSize,
    query: any = {}
  ) => {
    setLoading(true)
    
    try {
      const res = await getTransactionPage(page, pageSize, query)
      if (res.data) {
        setTransactions(res.data.list || [])
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: res.data.total || 0
        })
      } else {
        message.error('获取交易记录列表失败')
      }
    } catch (error) {
      console.error('获取交易记录列表出错:', error)
      message.error('获取交易记录列表出错')
    } finally {
      setLoading(false)
    }
  }
  
  // 初始化时加载数据
  useEffect(() => {
    fetchTransactions()
  }, [])
  
  // 处理查询
  const handleSearch = () => {
    const query: any = {}
    
    if (userId) query.userId = userId
    if (type !== undefined) query.type = type
    if (status !== undefined) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (transactionNo) query.transactionNo = transactionNo
    if (keyword) query.keyword = keyword
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      query.startTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      query.endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss')
    }
    
    fetchTransactions(1, pagination.pageSize, query)
  }
  
  // 处理表格分页、筛选、排序变化
  const handleTableChange = (newPagination: any) => {
    const query: any = {}
    
    if (userId) query.userId = userId
    if (type !== undefined) query.type = type
    if (status !== undefined) query.status = status
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (transactionNo) query.transactionNo = transactionNo
    if (keyword) query.keyword = keyword
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      query.startTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      query.endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss')
    }
    
    fetchTransactions(
      newPagination.current,
      newPagination.pageSize,
      query
    )
  }
  
  // 查看交易详情
  const handleViewDetail = async (id: number) => {
    try {
      setLoading(true)
      const res = await getTransactionDetail(id)
      if (res.data) {
        setCurrentTransaction(res.data)
        setDetailModalVisible(true)
      } else {
        message.error('获取交易详情失败')
      }
    } catch (error) {
      console.error('获取交易详情出错:', error)
      message.error('获取交易详情出错')
    } finally {
      setLoading(false)
    }
  }
  
  // 重置查询条件
  const handleReset = () => {
    setUserId(undefined)
    setType(undefined)
    setStatus(undefined)
    setPaymentMethod(undefined)
    setTransactionNo(undefined)
    setDateRange(undefined)
    setKeyword(undefined)
    
    fetchTransactions(1, pagination.pageSize, {})
  }
  
  // 创建可复制的带提示的文本单元格
  const renderWithTooltip = (text: string) => (
    <Tooltip title={text} placement="topLeft">
      <div className="text-ellipsis">{text}</div>
    </Tooltip>
  );
  
  // 渲染交易类型
  const renderTransactionType = (type: number) => {
    let color = ''
    let text = ''
    
    switch (type) {
      case 1:
        color = 'green'
        text = '充值'
        break
      case 2:
        color = 'blue'
        text = '消费'
        break
      case 3:
        color = 'purple'
        text = '退款'
        break
      case 4:
        color = 'orange'
        text = '管理员调整'
        break
      default:
        color = 'default'
        text = '未知'
    }
    
    return <Tag color={color}>{text}</Tag>
  }
  
  // 渲染交易状态
  const renderTransactionStatus = (status: number) => {
    let color = ''
    let text = ''
    
    switch (status) {
      case 0:
        color = 'red'
        text = '失败'
        break
      case 1:
        color = 'green'
        text = '成功'
        break
      case 2:
        color = 'blue'
        text = '处理中'
        break
      default:
        color = 'default'
        text = '未知'
    }
    
    return <Tag color={color}>{text}</Tag>
  }
  
  // 渲染支付方式
  const renderPaymentMethod = (method: string) => {
    let text = ''
    
    switch (method) {
      case 'alipay':
        text = '支付宝'
        break
      case 'wechat':
        text = '微信支付'
        break
      case 'bank':
        text = '银行卡'
        break
      case 'admin':
        text = '管理员操作'
        break
      default:
        text = method || '未知'
    }
    
    return text
  }
  
  // 表格列定义
  const columns: ColumnsType<TransactionData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '用户',
      key: 'user',
      width: 120,
      render: (_, record) => record.user ? renderWithTooltip(record.user.username) : '-'
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: renderTransactionType
    },
    {
      title: '交易金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '交易前余额',
      dataIndex: 'beforeBalance',
      key: 'beforeBalance',
      width: 120,
      render: (balance) => `¥${balance.toFixed(2)}`
    },
    {
      title: '交易后余额',
      dataIndex: 'afterBalance',
      key: 'afterBalance',
      width: 120,
      render: (balance) => `¥${balance.toFixed(2)}`
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: renderPaymentMethod
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderTransactionStatus
    },
    {
      title: '交易时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: renderWithTooltip
    },
    {
      title: '交易描述',
      dataIndex: 'description',
      key: 'description',
      width: 150,
      render: renderWithTooltip
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          详情
        </Button>
      )
    }
  ]
  
  return (
    <div className="transaction-list-container">
      <Title level={2}>交易记录管理</Title>
      
      <Card className="transaction-card">
        <div className="search-bar">
          <Space wrap>
            <Input
              placeholder="用户ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: 100 }}
            />
            
            <Select
              placeholder="交易类型"
              style={{ width: 120 }}
              allowClear
              value={type}
              onChange={(value) => setType(value)}
            >
              <Option value={1}>充值</Option>
              <Option value={2}>消费</Option>
              <Option value={3}>退款</Option>
              <Option value={4}>管理员调整</Option>
            </Select>
            
            <Select
              placeholder="交易状态"
              style={{ width: 120 }}
              allowClear
              value={status}
              onChange={(value) => setStatus(value)}
            >
              <Option value={0}>失败</Option>
              <Option value={1}>成功</Option>
              <Option value={2}>处理中</Option>
            </Select>
            
            <Select
              placeholder="支付方式"
              style={{ width: 120 }}
              allowClear
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value)}
            >
              <Option value="alipay">支付宝</Option>
              <Option value="wechat">微信支付</Option>
              <Option value="bank">银行卡</Option>
              <Option value="admin">管理员操作</Option>
            </Select>
            
            <Input
              placeholder="交易流水号"
              value={transactionNo}
              onChange={(e) => setTransactionNo(e.target.value)}
              style={{ width: 150 }}
            />
            
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['开始时间', '结束时间']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            />
            
            <Input
              placeholder="搜索用户名/昵称/邮箱/手机"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
        
        <div className="table-container">
          <Table<TransactionData>
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              className: 'pagination'
            }}
            onChange={handleTableChange}
            scroll={{ x: 1300 }}
            className="transaction-table"
          />
        </div>
      </Card>
      
      {/* 交易详情对话框 */}
      <Modal
        title="交易详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentTransaction && (
          <div className="transaction-detail">
            <div className="detail-item">
              <span className="label">交易ID：</span>
              <span className="value">{currentTransaction.id}</span>
            </div>
            <div className="detail-item">
              <span className="label">用户ID：</span>
              <span className="value">{currentTransaction.userId}</span>
            </div>
            {currentTransaction.user && (
              <div className="detail-item">
                <span className="label">用户名：</span>
                <span className="value">{currentTransaction.user.username}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="label">交易类型：</span>
              <span className="value">{renderTransactionType(currentTransaction.type)}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易金额：</span>
              <span className="value">¥{currentTransaction.amount.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易前余额：</span>
              <span className="value">¥{currentTransaction.beforeBalance.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易后余额：</span>
              <span className="value">¥{currentTransaction.afterBalance.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易状态：</span>
              <span className="value">{renderTransactionStatus(currentTransaction.status)}</span>
            </div>
            <div className="detail-item">
              <span className="label">支付方式：</span>
              <span className="value">{renderPaymentMethod(currentTransaction.paymentMethod)}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易流水号：</span>
              <span className="value">{currentTransaction.transactionNo}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易时间：</span>
              <span className="value">{currentTransaction.createTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易描述：</span>
              <span className="value">{currentTransaction.description || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">交易备注：</span>
              <span className="value">{currentTransaction.remark || '-'}</span>
            </div>
          </div>
        )}
      </Modal>
      
      <style jsx>{`
        .transaction-list-container {
          padding: 20px;
        }
        
        .transaction-card {
          margin-top: 20px;
        }
        
        .search-bar {
          margin-bottom: 20px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .text-ellipsis {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .transaction-detail {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .detail-item {
          margin-bottom: 10px;
          display: flex;
        }
        
        .label {
          font-weight: bold;
          width: 100px;
          flex-shrink: 0;
        }
        
        .value {
          flex-grow: 1;
        }
      `}</style>
    </div>
  )
}

export default TransactionList 