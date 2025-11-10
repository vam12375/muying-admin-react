import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Input, Space, Tag, Image, Typography, Select, Form, message, Popconfirm, Modal, InputNumber, Upload } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { productApi } from '../../api/product'
import type { ProductData, PageResult } from '../../api/product'
import { brandApi } from '../../api/product'
import { categoryApi } from '../../api/product'
import type { BrandData, CategoryData } from '../../api/product'
import ProductDetailModal from '../../components/ProductDetailModal'
import ProductEditModal from '../../components/ProductEditModal'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

// 安全的 toString 转换函数
const safeToString = (value: any): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
};

// 移除模拟数据，使用后端API数据

const ProductList: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductData[]>([])
  const [form] = Form.useForm()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
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
      
      // 使用 list 字段，这个字段在 API 层已经被正确映射
      setProducts(result.list || [])
      setPagination({
        current: result.pageNum || result.current || 1,
        pageSize: result.pageSize || result.size || 10,
        total: result.total || 0
      })
    } catch (error: any) {
      // 根据错误类型显示不同的错误信息
      if (error.response) {
        const { status } = error.response
        if (status === 401 || status === 403) {
          // 认证错误已经在request.ts中处理，这里不需要额外处理
          message.error('获取商品列表失败：请先登录或检查访问权限')
        } else if (status === 404) {
          message.error('获取商品列表失败：接口不存在')
        } else {
          message.error(`获取商品列表失败：${error.response.data?.message || '服务器错误'}`)
        }
      } else if (error.request) {
        message.error('获取商品列表失败：服务器无响应，请检查网络连接')
      } else {
        message.error(`获取商品列表失败：${error.message || '未知错误'}`)
      }
      console.error('获取商品列表失败:', error)
      
      // 设置空数据，避免显示旧数据
      setProducts([])
      setPagination({
        ...pagination,
        total: 0
      })
    } finally {
      setLoading(false)
    }
  }
  
  // 获取所有品牌
  const fetchAllBrands = async () => {
    try {
      console.log('开始获取品牌列表');
      const result = await brandApi.getAllBrands();
      console.log('品牌列表获取结果:', result);
      setBrands(result || []);
    } catch (error: any) {
      // 品牌数据不是核心功能，可以简化错误处理
      console.error('获取品牌列表失败:', error);
      message.error('获取品牌列表失败，将使用空列表');
      setBrands([]); // 确保在错误情况下设置为空数组
    }
  }
  
  // 获取所有分类
  const fetchAllCategories = async () => {
    try {
      console.log('开始获取分类列表');
      const result = await categoryApi.getAllCategoriesFlat();
      console.log('分类列表获取结果:', result);
      setCategories(result || []);
    } catch (error: any) {
      // 分类数据不是核心功能，可以简化错误处理
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败，将使用空列表');
      setCategories([]); // 确保在错误情况下设置为空数组
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
      // 如果当前是上架状态(1)，则切换为下架(0)，反之亦然
      const newStatus = status === 1 ? 0 : 1;
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
      console.log('获取到的商品详情:', product) // 调试日志
      setCurrentProduct(product)
      setIsDetailModalVisible(true)
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
    setIsModalVisible(true)
  }
  
  // 保存商品
  const handleSave = async (values: any) => {
    try {
      // 转换一些字段类型
      const productData = {
        ...values,
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        brandId: values.brandId ? Number(values.brandId) : undefined,
        // 映射字段名
        productName: values.name,
        productImg: values.image,
        priceNew: values.price,
        priceOld: values.originalPrice,
        productDetail: values.description,
        productStatus: values.status === 1 ? '上架' : '下架'
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
      throw error // 重新抛出错误，让组件处理
    }
  }
  
  // 表格列定义
  const columns: ColumnsType<ProductData> = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 60
    },
    {
      title: '图片',
      dataIndex: 'productImg',
      key: 'image',
      width: 100,
      render: (image, record) => {
        // 构建完整的图片URL
        const imageUrl = image 
          ? (image.startsWith('http') ? image : `http://localhost:5173/products/${image}`)
          : 'https://via.placeholder.com/60?text=No+Image';
          
        return (
          <div className="dark:p-1 dark:bg-gray-700/30 dark:rounded-md">
            <Image
              src={imageUrl}
              alt="商品图片"
              width={60}
              height={60}
              style={{ objectFit: 'cover' }}
              fallback="https://via.placeholder.com/60?text=No+Image"
              className="rounded-md dark:border dark:border-gray-600"
              preview={{
                mask: <div className="dark:text-white">预览</div>
              }}
            />
          </div>
        );
      }
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'name',
      ellipsis: true,
      width: 200
    },
    {
      title: '价格',
      dataIndex: 'priceNew',
      key: 'price',
      width: 100,
      render: (price, record) => (
        <>
          <div>¥{price !== undefined && price !== null ? price.toFixed(2) : '0.00'}</div>
          {record.priceOld && (
            <div style={{ textDecoration: 'line-through', color: '#999' }}>
              ¥{typeof record.priceOld === 'number' ? record.priceOld.toFixed(2) : '0.00'}
            </div>
          )}
        </>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 100
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'productStatus',
      key: 'status',
      width: 80,
      render: (status) => {
        // 根据状态文本显示不同颜色的标签
        return (
          <Tag color={status === '上架' ? 'green' : 'red'}>
            {status}
          </Tag>
        );
      }
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
      width: 240,
      render: (_, record) => (
        <Space size="small" wrap>
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
            type={record.productStatus === '上架' ? 'default' : 'primary'}
            size="small"
            onClick={() => handleStatusChange(record.productId, record.productStatus === '上架' ? 1 : 0)}
          >
            {record.productStatus === '上架' ? '下架' : '上架'}
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
        // 新组件会自己处理图片URL更新
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
              {(categories || []).map(category => (
                category && category.categoryId ? (
                  <Option key={category.categoryId} value={safeToString(category.categoryId)}>
                    {category.name || '未命名分类'}
                  </Option>
                ) : null
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
          scroll={{ x: 1300 }}
          bordered
        />
      </Card>
      
      {/* 商品编辑模态框 */}
      <ProductEditModal
        visible={isModalVisible && !isViewMode}
        product={currentProduct}
        brands={brands || []}
        categories={categories || []}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        uploadProps={uploadProps}
      />

      {/* 商品详情模态框 */}
      <ProductDetailModal
        visible={isDetailModalVisible}
        product={currentProduct}
        onCancel={() => setIsDetailModalVisible(false)}
      />
    </div>
  )
}

export default ProductList