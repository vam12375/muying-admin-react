import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Typography, Tag, Image, Upload, message, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { brandApi } from '../../api/product'
import type { BrandData } from '../../api/product'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

// 移除模拟数据，使用后端API数据

const BrandManage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<BrandData[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [keyword, setKeyword] = useState('')
  
  // 获取品牌列表
  const fetchBrands = async (page = 1, size = 10, searchKeyword = '') => {
    try {
      setLoading(true)
      const result = await brandApi.getBrandPage(page, size, searchKeyword)
      
      // 确保result.list存在，否则使用空数组
      setBrands(result.list || [])
      setPagination({
        current: result.pageNum,
        pageSize: result.pageSize,
        total: result.total
      })
    } catch (error) {
      message.error('获取品牌列表失败')
      console.error('获取品牌列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchBrands()
  }, [])
  
  // 处理添加品牌
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalVisible(true)
  }
  
  // 处理编辑品牌
  const handleEdit = async (id: number) => {
    try {
      setLoading(true)
      const brand = await brandApi.getBrandDetail(id)
      setEditingId(id)
      form.setFieldsValue({
        name: brand.name,
        logo: brand.logo,
        description: brand.description,
        status: brand.status,
        sort: brand.sort
      })
      setIsModalVisible(true)
    } catch (error) {
      message.error('获取品牌详情失败')
      console.error('获取品牌详情失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 处理删除品牌
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个品牌吗？此操作不可逆。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true)
          const success = await brandApi.deleteBrand(id)
          
          if (success) {
            message.success('删除品牌成功')
            fetchBrands(pagination.current, pagination.pageSize, keyword)
          } else {
            message.error('删除品牌失败')
          }
        } catch (error) {
          message.error('删除品牌失败')
          console.error('删除品牌失败:', error)
        } finally {
          setLoading(false)
        }
      }
    })
  }
  
  // 处理保存品牌
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      let success = false
      
      if (editingId === null) {
        // 添加操作
        success = await brandApi.createBrand(values)
        if (success) {
          message.success('添加品牌成功')
        } else {
          message.error('添加品牌失败')
        }
      } else {
        // 编辑操作
        success = await brandApi.updateBrand(editingId, values)
        if (success) {
          message.success('更新品牌成功')
        } else {
          message.error('更新品牌失败')
        }
      }
      
      if (success) {
        setIsModalVisible(false)
        fetchBrands(pagination.current, pagination.pageSize, keyword)
      }
    } catch (error) {
      console.error('保存品牌失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 处理搜索
  const handleSearch = (value: string) => {
    setKeyword(value)
    fetchBrands(1, pagination.pageSize, value)
  }
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchBrands(pagination.current, pagination.pageSize, keyword)
  }
  
  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        // 假设上传成功后，服务器返回的URL在response.url中
        message.success(`${info.file.name} 上传成功`);
        form.setFieldsValue({ logo: info.file.response.url })
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  }
  
  const columns: ColumnsType<BrandData> = [
    {
      title: 'ID',
      dataIndex: 'brandId',
      key: 'brandId',
      width: 80
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      render: (logo) => (
        <Image
          src={logo || 'https://via.placeholder.com/60'}
          alt="品牌Logo"
          width={60}
          height={60}
          style={{ objectFit: 'contain' }}
          fallback="https://via.placeholder.com/60?text=No+Logo"
        />
      )
    },
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '商品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (time) => time ? time.substring(0, 10) : ''
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.brandId)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.brandId)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]
  
  return (
    <div className="brand-manage-container">
      <Title level={2}>品牌管理</Title>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索品牌名称"
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加品牌
          </Button>
        </div>
        
        <Table<BrandData>
          columns={columns}
          dataSource={brands}
          rowKey="brandId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>
      
      <Modal
        title={editingId === null ? '添加品牌' : '编辑品牌'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="品牌名称"
            rules={[{ required: true, message: '请输入品牌名称' }]}
          >
            <Input placeholder="请输入品牌名称" />
          </Form.Item>
          
          <Form.Item
            name="logo"
            label="品牌Logo"
            rules={[{ required: true, message: '请输入Logo图片URL' }]}
          >
            <Input placeholder="Logo图片URL" />
          </Form.Item>
          
          <Form.Item label="上传Logo">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传Logo</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="品牌描述"
          >
            <TextArea rows={4} placeholder="请输入品牌描述" />
          </Form.Item>
          
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <Input placeholder="请输入排序值" type="number" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BrandManage 