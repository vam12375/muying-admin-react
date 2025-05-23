import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Space, Tag, Image, Typography, Select, Form, message, Popconfirm, Modal, InputNumber, Upload } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { productApi } from '../../api/product'
import type { ProductData, PageResult } from '../../api/product'
import { brandApi } from '../../api/product'
import { categoryApi } from '../../api/product'
import type { BrandData, CategoryData } from '../../api/product'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

// 移除模拟数据，使用后端API数据

const ProductList: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductData[]>([])
  const [form] = Form.useForm()
  const [productForm] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null)
  const [brands, setBrands] = useState<BrandData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  
  // 获取商品列表数据
  const fetchProducts = async (page = 1, size = 10, searchParams: any = {}) => {
    try {
      setLoading(true)
      const { keyword, categoryId, status } = searchParams
      
      const result = await productApi.getProductPage(
        page, 
        size, 
        keyword, 
        categoryId ? Number(categoryId) : undefined, 
        undefined, 
        status !== undefined ? Number(status) : undefined
      )
      
      setProducts(result.list || [])
      setPagination({
        current: result.pageNum,
        pageSize: result.pageSize,
        total: result.total
      })
    } catch (error) {
      message.error('获取商品列表失败')
      console.error('获取商品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 获取所有品牌
  const fetchAllBrands = async () => {
    try {
      const result = await brandApi.getAllBrands()
      setBrands(result)
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    }
  }
  
  // 获取所有分类
  const fetchAllCategories = async () => {
    try {
      const result = await categoryApi.getAllCategoriesFlat()
      setCategories(result)
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }
  
  useEffect(() => {
    fetchProducts()
    fetchAllBrands()
    fetchAllCategories()
  }, [])
  
  // 处理搜索
  const handleSearch = () => {
    const values = form.getFieldsValue()
    fetchProducts(1, pagination.pageSize, values)
  }
  
  // 处理重置
  const handleReset = () => {
    form.resetFields()
    fetchProducts(1, pagination.pageSize)
  }
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchProducts(pagination.current, pagination.pageSize, form.getFieldsValue())
  }
  
  // 处理删除商品
  const handleDelete = async (id: number) => {
    try {
      setLoading(true)
      const success = await productApi.deleteProduct(id)
      if (success) {
        message.success('删除商品成功')
        fetchProducts(pagination.current, pagination.pageSize, form.getFieldsValue())
      } else {
        message.error('删除商品失败')
      }
    } catch (error) {
      message.error('删除商品失败')
      console.error('删除商品失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 处理商品状态变更
  const handleStatusChange = async (id: number, status: number) => {
    try {
      setLoading(true)
      const newStatus = status === 1 ? 0 : 1
      const success = await productApi.updateProductStatus(id, newStatus)
      if (success) {
        message.success(`商品${newStatus === 1 ? '上架' : '下架'}成功`)
        fetchProducts(pagination.current, pagination.pageSize, form.getFieldsValue())
      } else {
        message.error(`商品${newStatus === 1 ? '上架' : '下架'}失败`)
      }
    } catch (error) {
      message.error(`商品状态更新失败`)
      console.error('商品状态更新失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 查看商品详情
  const handleView = async (id: number) => {
    try {
      const product = await productApi.getProductDetail(id)
      setCurrentProduct(product)
      setIsViewMode(true)
      productForm.setFieldsValue({
        ...product,
        categoryId: product.categoryId?.toString(),
        brandId: product.brandId?.toString()
      })
      setIsModalVisible(true)
    } catch (error) {
      message.error('获取商品详情失败')
      console.error('获取商品详情失败:', error)
    }
  }
  
  // 打开编辑商品表单
  const handleEdit = async (id: number) => {
    try {
      const product = await productApi.getProductDetail(id)
      setCurrentProduct(product)
      setIsViewMode(false)
      productForm.setFieldsValue({
        ...product,
        categoryId: product.categoryId?.toString(),
        brandId: product.brandId?.toString()
      })
      setIsModalVisible(true)
    } catch (error) {
      message.error('获取商品详情失败')
      console.error('获取商品详情失败:', error)
    }
  }
  
  // 打开添加商品表单
  const handleAdd = () => {
    setCurrentProduct(null)
    setIsViewMode(false)
    productForm.resetFields()
    setIsModalVisible(true)
  }
  
  // 保存商品
  const handleSave = async () => {
    try {
      const values = await productForm.validateFields()
      
      // 转换一些字段类型
      const productData = {
        ...values,
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        brandId: values.brandId ? Number(values.brandId) : undefined
      }
      
      let success = false
      
      if (currentProduct) {
        // 更新商品
        success = await productApi.updateProduct(currentProduct.productId, productData)
        if (success) {
          message.success('更新商品成功')
        } else {
          message.error('更新商品失败')
        }
      } else {
        // 创建商品
        success = await productApi.createProduct(productData)
        if (success) {
          message.success('创建商品成功')
        } else {
          message.error('创建商品失败')
        }
      }
      
      if (success) {
        setIsModalVisible(false)
        fetchProducts(pagination.current, pagination.pageSize, form.getFieldsValue())
      }
    } catch (error) {
      console.error('保存商品失败:', error)
    }
  }
  
  // 表格列定义
  const columns: ColumnsType<ProductData> = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <Image
          src={image || 'https://via.placeholder.com/60'}
          alt="商品图片"
          width={60}
          height={60}
          style={{ objectFit: 'cover' }}
          fallback="https://via.placeholder.com/60?text=No+Image"
        />
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <>
          <div>¥{price.toFixed(2)}</div>
          {record.originalPrice && (
            <div style={{ textDecoration: 'line-through', color: '#999' }}>
              ¥{record.originalPrice.toFixed(2)}
            </div>
          )}
        </>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName'
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      key: 'brandName'
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '在售' : '下架'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => time ? time.substring(0, 10) : ''
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record.productId)}
          >
            查看
          </Button>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.productId)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该商品吗？"
            onConfirm={() => handleDelete(record.productId)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
          <Button
            type={record.status === 1 ? 'default' : 'primary'}
            size="small"
            onClick={() => handleStatusChange(record.productId, record.status)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
        </Space>
      )
    }
  ]
  
  // 上传组件配置
  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        // 假设上传成功后，服务器返回的URL在response.url中
        productForm.setFieldsValue({ image: info.file.response.url });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };
  
  return (
    <div className="product-list-container">
      <Title level={2}>商品管理</Title>
      
      <Card>
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              placeholder="搜索商品名称/品牌"
              style={{ width: 200 }}
              allowClear
            />
          </Form.Item>
          
          <Form.Item name="categoryId">
            <Select
              placeholder="选择分类"
              style={{ width: 150 }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.categoryId} value={category.categoryId.toString()}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="status">
            <Select
              placeholder="选择状态"
              style={{ width: 150 }}
              allowClear
            >
              <Option value="1">在售</Option>
              <Option value="0">下架</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button onClick={handleReset}>重置</Button>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加商品
            </Button>
          </Form.Item>
        </Form>
        
        <Table<ProductData>
          columns={columns}
          dataSource={products}
          rowKey="productId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>
      
      {/* 商品表单模态框 */}
      <Modal
        title={
          isViewMode 
            ? '商品详情' 
            : currentProduct 
              ? '编辑商品' 
              : '添加商品'
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okButtonProps={{ disabled: isViewMode }}
        width={700}
      >
        <Form
          form={productForm}
          layout="vertical"
          disabled={isViewMode}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="商品图片"
            rules={[{ required: true, message: '请上传商品图片' }]}
          >
            <Input placeholder="图片URL" />
          </Form.Item>
          
          <Form.Item label="上传图片">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="商品描述"
          >
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="price"
              label="售价"
              rules={[{ required: true, message: '请输入售价' }]}
              style={{ width: '50%' }}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入售价"
                addonBefore="¥"
              />
            </Form.Item>
            
            <Form.Item
              name="originalPrice"
              label="原价"
              style={{ width: '50%' }}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入原价"
                addonBefore="¥"
              />
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="categoryId"
              label="商品分类"
              rules={[{ required: true, message: '请选择商品分类' }]}
              style={{ width: '50%' }}
            >
              <Select placeholder="请选择商品分类">
                {categories.map(category => (
                  <Option key={category.categoryId} value={category.categoryId.toString()}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="brandId"
              label="商品品牌"
              rules={[{ required: true, message: '请选择商品品牌' }]}
              style={{ width: '50%' }}
            >
              <Select placeholder="请选择商品品牌">
                {brands.map(brand => (
                  <Option key={brand.brandId} value={brand.brandId.toString()}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="stock"
              label="库存数量"
              rules={[{ required: true, message: '请输入库存数量' }]}
              style={{ width: '50%' }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="请输入库存数量"
              />
            </Form.Item>
            
            <Form.Item
              name="status"
              label="商品状态"
              initialValue={1}
              style={{ width: '50%' }}
            >
              <Select placeholder="请选择商品状态">
                <Option value={1}>在售</Option>
                <Option value={0}>下架</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductList 