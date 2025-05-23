import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, Typography, Tag, message, Select, InputNumber, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { categoryApi } from '../../api/product'
import type { CategoryData } from '../../api/product'

const { Title } = Typography
const { Option } = Select

// 移除模拟数据，使用后端API数据

const CategoryManage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [flatCategories, setFlatCategories] = useState<CategoryData[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [treeView, setTreeView] = useState(false)
  
  // 获取分类数据
  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // 获取树形结构的分类
      const treeData = await categoryApi.getAllCategories()
      setCategories(treeData)
      
      // 获取平铺结构的分类
      const flatData = await categoryApi.getAllCategoriesFlat()
      setFlatCategories(flatData)
    } catch (error) {
      message.error('获取分类列表失败')
      console.error('获取分类列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  // 处理添加分类
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      status: 1,
      parentId: 0,
      level: 1,
      sort: 0
    })
    setIsModalVisible(true)
  }
  
  // 处理编辑分类
  const handleEdit = async (id: number) => {
    try {
      setLoading(true)
      const category = await categoryApi.getCategoryDetail(id)
      setEditingId(id)
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId,
        level: category.level,
        sort: category.sort,
        status: category.status,
        description: category.description
      })
      setIsModalVisible(true)
    } catch (error) {
      message.error('获取分类详情失败')
      console.error('获取分类详情失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 处理删除分类
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？此操作不可逆。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true)
          const success = await categoryApi.deleteCategory(id)
          
          if (success) {
            message.success('删除分类成功')
            fetchCategories()
          } else {
            message.error('删除分类失败')
          }
        } catch (error) {
          message.error('删除分类失败')
          console.error('删除分类失败:', error)
        } finally {
          setLoading(false)
        }
      }
    })
  }
  
  // 处理保存分类
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      let success = false
      
      if (editingId === null) {
        // 添加操作
        success = await categoryApi.createCategory(values)
        if (success) {
          message.success('添加分类成功')
        } else {
          message.error('添加分类失败')
        }
      } else {
        // 编辑操作
        success = await categoryApi.updateCategory(editingId, values)
        if (success) {
          message.success('更新分类成功')
        } else {
          message.error('更新分类失败')
        }
      }
      
      if (success) {
        setIsModalVisible(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('保存分类失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 处理更新分类状态
  const handleStatusChange = async (id: number, status: number) => {
    try {
      setLoading(true)
      const newStatus = status === 1 ? 0 : 1
      const success = await categoryApi.updateCategoryStatus(id, newStatus)
      
      if (success) {
        message.success(`分类${newStatus === 1 ? '启用' : '禁用'}成功`)
        fetchCategories()
      } else {
        message.error(`分类${newStatus === 1 ? '启用' : '禁用'}失败`)
      }
    } catch (error) {
      message.error('更新分类状态失败')
      console.error('更新分类状态失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 父级分类变化时自动设置层级
  const handleParentChange = (value: number) => {
    if (value === 0) {
      form.setFieldsValue({ level: 1 })
    } else {
      const parentCategory = flatCategories.find(c => c.categoryId === value)
      if (parentCategory) {
        form.setFieldsValue({ level: parentCategory.level + 1 })
      }
    }
  }
  
  // 表格列定义
  const columns: ColumnsType<CategoryData> = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 80
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '父级分类',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => parentId && parentId !== 0 ? 
        flatCategories.find(c => c.categoryId === parentId)?.name || parentId : 
        '无'
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 80
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80
    },
    {
      title: '商品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100
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
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.categoryId)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.categoryId)}
          >
            删除
          </Button>
          <Button
            type={record.status === 1 ? 'default' : 'primary'}
            size="small"
            onClick={() => handleStatusChange(record.categoryId, record.status)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </Space>
      )
    }
  ]
  
  // 递归处理树形数据
  const processTreeData = (data: CategoryData[]) => {
    return data.map(item => ({
      key: item.categoryId,
      title: item.name,
      children: item.children && item.children.length > 0 ? processTreeData(item.children) : undefined
    }))
  }
  
  return (
    <div className="category-manage-container">
      <Title level={2}>分类管理</Title>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
              style={{ marginRight: 16 }}
            >
              添加分类
            </Button>
            
            <Button
              onClick={() => setTreeView(!treeView)}
            >
              {treeView ? '表格视图' : '树形视图'}
            </Button>
          </div>
        </div>
        
        {treeView ? (
          <Card title="分类树形结构">
            <Tree
              treeData={processTreeData(categories)}
              defaultExpandAll
              showLine
              blockNode
            />
          </Card>
        ) : (
          <Table<CategoryData>
            columns={columns}
            dataSource={flatCategories}
            rowKey="categoryId"
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
          />
        )}
      </Card>
      
      <Modal
        title={editingId === null ? '添加分类' : '编辑分类'}
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
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            name="parentId"
            label="父级分类"
            initialValue={0}
          >
            <Select 
              placeholder="请选择父级分类"
              onChange={handleParentChange}
            >
              <Option value={0}>无 (顶级分类)</Option>
              {flatCategories.map(category => (
                <Option 
                  key={category.categoryId} 
                  value={category.categoryId}
                  disabled={editingId === category.categoryId}
                >
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="level"
              label="层级"
              initialValue={1}
              style={{ width: '50%' }}
            >
              <InputNumber 
                min={1} 
                max={3} 
                style={{ width: '100%' }}
                disabled
              />
            </Form.Item>
            
            <Form.Item
              name="sort"
              label="排序"
              initialValue={0}
              style={{ width: '50%' }}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }}
                placeholder="请输入排序值"
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea rows={4} placeholder="请输入分类描述" />
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

export default CategoryManage 