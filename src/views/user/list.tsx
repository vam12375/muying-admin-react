import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Space, Tag, Modal, message, Typography, Form, Select, Tooltip, InputNumber } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, WalletOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getUserPage, deleteUser, toggleUserStatus, addUser, updateUser, getUserById } from '@/api/user'
import { getUserAccountByUserId, rechargeUserAccount } from '@/api/userAccount'
import './userList.css' // 我们将添加这个CSS文件

const { Title } = Typography
const { Option } = Select

// 定义用户数据接口，匹配后端返回的字段
interface UserData {
  userId: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  role: string
  createTime: string
  balance?: number // 添加余额字段
}

// 定义分页数据接口
interface Pagination {
  current: number
  pageSize: number
  total: number
}

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [userForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('添加用户')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  
  // 充值相关状态
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false)
  const [rechargeForm] = Form.useForm()
  const [rechargingUserId, setRechargingUserId] = useState<number | null>(null)
  const [rechargingUserName, setRechargingUserName] = useState('')
  
  // 加载用户数据
  const fetchUsers = async (page = pagination.current, pageSize = pagination.pageSize, keyword?: string, status?: string, role?: string) => {
    setLoading(true)
    
    try {
      const res = await getUserPage(page, pageSize, keyword, status, role)
      if (res.data && res.data.records) {
        // 获取用户列表
        const userList = res.data.records
        
        // 获取每个用户的账户余额
        const usersWithBalance = await Promise.all(
          userList.map(async (user: UserData) => {
            try {
              const accountRes = await getUserAccountByUserId(user.userId)
              if (accountRes.data) {
                return {
                  ...user,
                  balance: accountRes.data.balance || 0
                }
              }
              return user
            } catch (error) {
              console.error(`获取用户${user.userId}余额失败:`, error)
              return {
                ...user,
                balance: 0
              }
            }
          })
        )
        
        setUsers(usersWithBalance)
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: res.data.total
        })
      } else {
        message.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表出错:', error)
      message.error('获取用户列表出错')
    } finally {
      setLoading(false)
    }
  }
  
  // 初始化时加载数据
  useEffect(() => {
    fetchUsers()
  }, [])
  
  // 处理搜索
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchText, statusFilter, roleFilter)
  }
  
  // 处理表格分页、筛选、排序变化
  const handleTableChange = (newPagination: any) => {
    fetchUsers(
      newPagination.current,
      newPagination.pageSize,
      searchText,
      statusFilter,
      roleFilter
    )
  }
  
  // 处理删除
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可逆。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        
        try {
          const res = await deleteUser(id)
          if (res.success) {
            message.success('删除成功')
            // 重新加载当前页数据
            fetchUsers(pagination.current, pagination.pageSize, searchText, statusFilter, roleFilter)
          } else {
            message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除用户出错:', error)
          message.error('删除用户出错')
        } finally {
          setLoading(false)
        }
      }
    })
  }
  
  // 处理状态切换
  const handleStatusToggle = async (id: number, currentStatus: number) => {
    // 切换状态: 0 -> 1 或 1 -> 0
    const newStatus = currentStatus === 1 ? 0 : 1
    
    try {
      setLoading(true)
      const res = await toggleUserStatus(id, newStatus)
      if (res.success) {
        message.success(newStatus === 1 ? '启用成功' : '禁用成功')
        // 更新本地数据，避免重新请求
        setUsers(users.map(user => 
          user.userId === id ? { ...user, status: newStatus } : user
        ))
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('修改用户状态出错:', error)
      message.error('修改用户状态出错')
    } finally {
      setLoading(false)
    }
  }
  
  // 打开添加用户对话框
  const handleAdd = () => {
    setModalTitle('添加用户')
    setEditingUserId(null)
    userForm.resetFields()
    setModalVisible(true)
  }
  
  // 打开编辑用户对话框
  const handleEdit = async (id: number) => {
    setModalTitle('编辑用户')
    setEditingUserId(id)
    
    try {
      setLoading(true)
      const res = await getUserById(id)
      if (res.success) {
        const userData = res.data
        // 设置表单值
        userForm.setFieldsValue({
          username: userData.username,
          nickname: userData.nickname,
          email: userData.email,
          phone: userData.phone,
          status: userData.status,
          role: userData.role
        })
        setModalVisible(true)
      } else {
        message.error(res.message || '获取用户详情失败')
      }
    } catch (error) {
      console.error('获取用户详情出错:', error)
      message.error('获取用户详情出错')
    } finally {
      setLoading(false)
    }
  }
  
  // 保存用户信息
  const handleSave = () => {
    userForm.validateFields().then(async (values) => {
      try {
        setLoading(true)
        let res
        
        if (editingUserId === null) {
          // 添加用户
          res = await addUser(values)
        } else {
          // 编辑用户
          res = await updateUser(editingUserId, values)
        }
        
        if (res.success) {
          message.success(editingUserId === null ? '添加成功' : '更新成功')
          setModalVisible(false)
          // 重新加载数据
          fetchUsers(pagination.current, pagination.pageSize, searchText, statusFilter, roleFilter)
        } else {
          message.error(res.message || (editingUserId === null ? '添加失败' : '更新失败'))
        }
      } catch (error) {
        console.error('保存用户信息出错:', error)
        message.error('保存用户信息出错')
      } finally {
        setLoading(false)
      }
    }).catch(info => {
      console.log('表单验证失败:', info)
    })
  }
  
  // 处理状态筛选变化
  const handleStatusFilterChange = (value: string | undefined) => {
    setStatusFilter(value)
    fetchUsers(1, pagination.pageSize, searchText, value, roleFilter)
  }
  
  // 处理角色筛选变化
  const handleRoleFilterChange = (value: string | undefined) => {
    setRoleFilter(value)
    fetchUsers(1, pagination.pageSize, searchText, statusFilter, value)
  }
  
  // 创建可复制的带提示的文本单元格
  const renderWithTooltip = (text: string) => (
    <Tooltip title={text} placement="topLeft">
      <div className="text-ellipsis">{text}</div>
    </Tooltip>
  );
  
  // 打开充值对话框
  const handleRecharge = (userId: number, username: string) => {
    setRechargingUserId(userId)
    setRechargingUserName(username)
    rechargeForm.resetFields()
    setRechargeModalVisible(true)
  }
  
  // 执行充值操作
  const handleRechargeSubmit = () => {
    rechargeForm.validateFields().then(async (values) => {
      if (!rechargingUserId) return
      
      try {
        setLoading(true)
        const rechargeData = {
          userId: rechargingUserId,
          amount: values.amount,
          paymentMethod: 'admin',
          description: '管理员充值',
          remark: values.remark
        }
        
        const res = await rechargeUserAccount(rechargeData)
        if (res.data) {
          message.success('充值成功')
          setRechargeModalVisible(false)
          
          // 更新本地数据，避免重新请求
          setUsers(users.map(user => 
            user.userId === rechargingUserId 
              ? { ...user, balance: (user.balance || 0) + values.amount } 
              : user
          ))
        } else {
          message.error(res.message || '充值失败')
        }
      } catch (error) {
        console.error('充值出错:', error)
        message.error('充值出错')
      } finally {
        setLoading(false)
      }
    })
  }
  
  // 表格列定义
  const columns: ColumnsType<UserData> = [
    {
      title: 'ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 60
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: renderWithTooltip
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
      render: renderWithTooltip
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: renderWithTooltip
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: renderWithTooltip
    },
    {
      title: '账户余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 100,
      render: (balance) => `¥${balance?.toFixed(2) || '0.00'}`
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: renderWithTooltip
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.userId)}
          >
            编辑
          </Button>
          <Button 
            type="primary"
            size="small" 
            danger={record.status === 1}
            icon={record.status === 1 ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleStatusToggle(record.userId, record.status)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
          <Button 
            type="primary"
            size="small"
            style={{ background: '#52c41a' }}
            icon={<WalletOutlined />}
            onClick={() => handleRecharge(record.userId, record.username)}
          >
            充值
          </Button>
          <Button 
            danger
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.userId)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]
  
  return (
    <div className="user-list-container">
      <Title level={2}>用户管理</Title>
      
      <Card className="user-card">
        <div className="search-bar">
          <Input
            placeholder="搜索用户名/昵称/邮箱/手机"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            allowClear
            onChange={handleStatusFilterChange}
          >
            <Option value="1">正常</Option>
            <Option value="0">禁用</Option>
          </Select>
          
          <Select
            placeholder="角色筛选"
            style={{ width: 120 }}
            allowClear
            onChange={handleRoleFilterChange}
          >
            <Option value="admin">管理员</Option>
            <Option value="user">普通用户</Option>
          </Select>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        </div>
        
        <div className="table-container">
          <Table<UserData>
            columns={columns}
            dataSource={users}
            rowKey="userId"
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
            scroll={{ x: 1200 }}
            className="user-table"
          />
        </div>
      </Card>
      
      {/* 添加/编辑用户表单 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        maskClosable={false}
        className="user-modal"
      >
        <Form
          form={userForm}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { 
                required: editingUserId === null, 
                message: '请输入密码' 
              },
              { 
                min: 6, 
                message: '密码至少6位' 
              }
            ]}
          >
            <Input.Password placeholder={editingUserId === null ? "请输入密码" : "留空表示不修改密码"} />
          </Form.Item>
          
          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { 
                type: 'email', 
                message: '请输入有效邮箱' 
              }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            initialValue="user"
          >
            <Select>
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select>
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 充值对话框 */}
      <Modal
        title={`为用户 ${rechargingUserName} 充值`}
        open={rechargeModalVisible}
        onOk={handleRechargeSubmit}
        onCancel={() => setRechargeModalVisible(false)}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Form
          form={rechargeForm}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="充值金额"
            rules={[
              { required: true, message: '请输入充值金额' },
              { type: 'number', min: 0.01, message: '充值金额必须大于0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入充值金额"
              precision={2}
              min={0.01}
              step={10}
              prefix="¥"
            />
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea
              placeholder="请输入充值备注信息"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserList