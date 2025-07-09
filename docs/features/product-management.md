# 商品管理模块

## 📋 模块概述

商品管理模块是母婴商城的核心业务模块，负责管理商品信息、分类体系、品牌管理和商品数据分析。

### 主要功能
- 🛍️ **商品管理**: 商品的增删改查和状态管理
- 📂 **分类管理**: 商品分类的层级管理
- 🏷️ **品牌管理**: 品牌信息和授权管理
- 📊 **商品分析**: 销售数据和趋势分析
- 🖼️ **图片管理**: 商品图片的上传和管理

## 🏗️ 模块架构

### 文件结构
```
src/views/product/
├── components/              # 商品模块组件
│   ├── ProductCard/        # 商品卡片组件
│   ├── ProductForm/        # 商品表单组件
│   ├── CategoryTree/       # 分类树组件
│   ├── BrandSelector/      # 品牌选择器
│   ├── ImageUploader/      # 图片上传组件
│   └── ProductFilter/      # 商品筛选组件
├── hooks/                  # 商品模块 Hooks
│   ├── useProductList.ts   # 商品列表 Hook
│   ├── useProductForm.ts   # 商品表单 Hook
│   ├── useCategory.ts      # 分类管理 Hook
│   └── useBrand.ts         # 品牌管理 Hook
├── types/                  # 商品类型定义
│   └── index.ts
├── utils/                  # 商品工具函数
│   ├── validation.ts       # 表单验证
│   ├── formatter.ts        # 数据格式化
│   └── constants.ts        # 常量定义
├── ProductList.tsx         # 商品列表页面
├── ProductForm.tsx         # 商品表单页面
├── CategoryManage.tsx      # 分类管理页面
├── BrandManage.tsx         # 品牌管理页面
└── analysis/               # 商品分析页面
    ├── index.tsx
    ├── SalesAnalysis.tsx
    └── InventoryAnalysis.tsx
```

### 数据模型
```typescript
// 商品数据模型
interface Product {
  id: number
  name: string                    // 商品名称
  description: string             // 商品描述
  categoryId: number             // 分类ID
  brandId: number                // 品牌ID
  sku: string                    // 商品SKU
  price: number                  // 价格
  originalPrice: number          // 原价
  stock: number                  // 库存
  minStock: number               // 最低库存
  images: string[]               // 商品图片
  specifications: Specification[] // 商品规格
  attributes: ProductAttribute[]  // 商品属性
  status: ProductStatus          // 商品状态
  isRecommended: boolean         // 是否推荐
  sortOrder: number              // 排序
  createdAt: string              // 创建时间
  updatedAt: string              // 更新时间
}

// 商品分类
interface Category {
  id: number
  name: string                   // 分类名称
  parentId: number | null        // 父分类ID
  level: number                  // 分类层级
  icon: string                   // 分类图标
  description: string            // 分类描述
  sortOrder: number              // 排序
  isActive: boolean              // 是否启用
  children?: Category[]          // 子分类
}

// 品牌信息
interface Brand {
  id: number
  name: string                   // 品牌名称
  logo: string                   // 品牌Logo
  description: string            // 品牌描述
  website: string                // 官方网站
  country: string                // 品牌国家
  isAuthorized: boolean          // 是否授权
  sortOrder: number              // 排序
}
```

## 🎯 核心功能

### 1. 商品列表管理

#### 功能特性
- ✅ 分页显示商品列表
- ✅ 多维度筛选（分类、品牌、价格、状态）
- ✅ 排序功能（价格、销量、创建时间）
- ✅ 批量操作（上架/下架、删除、修改分类）
- ✅ 快速搜索（商品名称、SKU）

#### 实现示例
```typescript
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  
  // 获取商品列表
  const fetchProducts = useCallback(async (params?: ProductListParams) => {
    setLoading(true)
    try {
      const response = await productApi.getProducts({ ...filters, ...params })
      setProducts(response.data.items)
    } catch (error) {
      message.error('获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  // 表格列配置
  const columns: ColumnsType<Product> = [
    {
      title: '商品信息',
      key: 'productInfo',
      width: 300,
      render: (_, record: Product) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.images[0]}
            alt={record.name}
            width={60}
            height={60}
            className="rounded-md object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">SKU: {record.sku}</div>
          </div>
        </div>
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
      title: '价格',
      key: 'price',
      render: (_, record: Product) => (
        <div>
          <div className="text-red-600 font-medium">¥{record.price}</div>
          {record.originalPrice > record.price && (
            <div className="text-gray-400 line-through text-sm">
              ¥{record.originalPrice}
            </div>
          )}
        </div>
      )
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: Product) => (
        <span className={stock <= record.minStock ? 'text-red-600' : 'text-green-600'}>
          {stock}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductStatus) => (
        <Tag color={getProductStatusColor(status)}>
          {getProductStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: Product) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            size="small" 
            type={record.status === 'active' ? 'default' : 'primary'}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制商品' },
                { key: 'delete', label: '删除', danger: true }
              ],
              onClick: ({ key }) => handleMenuAction(key, record)
            }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]
  
  return (
    <div className="product-list">
      {/* 筛选区域 */}
      <ProductFilter onFilter={setFilters} />
      
      {/* 批量操作 */}
      {selectedRows.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <Space>
            <span>已选择 {selectedRows.length} 个商品</span>
            <Button size="small" onClick={handleBatchOnline}>
              批量上架
            </Button>
            <Button size="small" onClick={handleBatchOffline}>
              批量下架
            </Button>
            <Button size="small" danger onClick={handleBatchDelete}>
              批量删除
            </Button>
          </Space>
        </div>
      )}
      
      {/* 商品表格 */}
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowSelection={{
          selectedRowKeys: selectedRows,
          onChange: setSelectedRows
        }}
        rowKey="id"
      />
    </div>
  )
}
```

### 2. 商品表单管理

#### 功能特性
- ✅ 商品基本信息编辑
- ✅ 商品图片上传和管理
- ✅ 商品规格和属性设置
- ✅ 库存和价格管理
- ✅ SEO 信息设置

#### 实现示例
```typescript
const ProductForm: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  
  // 表单提交
  const handleSubmit = async (values: ProductFormData) => {
    setLoading(true)
    try {
      const productData = {
        ...values,
        images,
        specifications: formatSpecifications(values.specifications),
        attributes: formatAttributes(values.attributes)
      }
      
      await productApi.createProduct(productData)
      message.success('商品创建成功')
      // 跳转到商品列表
    } catch (error) {
      message.error('商品创建失败')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="product-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'draft',
          isRecommended: false
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* 基本信息 */}
            <Card title="基本信息" className="mb-4">
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="商品描述"
                rules={[{ required: true, message: '请输入商品描述' }]}
              >
                <TextArea rows={4} placeholder="请输入商品描述" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="categoryId"
                    label="商品分类"
                    rules={[{ required: true, message: '请选择商品分类' }]}
                  >
                    <CategorySelector />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="brandId"
                    label="商品品牌"
                    rules={[{ required: true, message: '请选择商品品牌' }]}
                  >
                    <BrandSelector />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            
            {/* 价格库存 */}
            <Card title="价格库存" className="mb-4">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="销售价格"
                    rules={[{ required: true, message: '请输入销售价格' }]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      addonBefore="¥"
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="originalPrice" label="原价">
                    <InputNumber
                      min={0}
                      precision={2}
                      addonBefore="¥"
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="stock"
                    label="库存数量"
                    rules={[{ required: true, message: '请输入库存数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            
            {/* 商品规格 */}
            <Card title="商品规格" className="mb-4">
              <SpecificationEditor />
            </Card>
          </Col>
          
          <Col span={8}>
            {/* 商品图片 */}
            <Card title="商品图片" className="mb-4">
              <ImageUploader
                images={images}
                onChange={setImages}
                maxCount={10}
              />
            </Card>
            
            {/* 商品设置 */}
            <Card title="商品设置">
              <Form.Item name="status" label="商品状态">
                <Select>
                  <Option value="draft">草稿</Option>
                  <Option value="active">上架</Option>
                  <Option value="inactive">下架</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="isRecommended" valuePropName="checked">
                <Checkbox>推荐商品</Checkbox>
              </Form.Item>
              
              <Form.Item name="sortOrder" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        
        {/* 提交按钮 */}
        <div className="text-center mt-6">
          <Space>
            <Button onClick={() => history.back()}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存商品
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  )
}
```

### 3. 分类管理

#### 功能特性
- ✅ 树形结构展示分类
- ✅ 拖拽排序和层级调整
- ✅ 分类的增删改查
- ✅ 分类图标和描述管理

#### 实现示例
```typescript
const CategoryManage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  
  // 渲染分类树节点
  const renderTreeNode = (category: Category): DataNode => ({
    key: category.id.toString(),
    title: (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {category.icon && <img src={category.icon} alt="" className="w-4 h-4" />}
          <span>{category.name}</span>
          <Tag size="small">{category.level}级</Tag>
        </div>
        <Space size="small">
          <Button size="small" type="link" onClick={() => handleEdit(category)}>
            编辑
          </Button>
          <Button size="small" type="link" onClick={() => handleAddChild(category)}>
            添加子分类
          </Button>
          <Button 
            size="small" 
            type="link" 
            danger 
            onClick={() => handleDelete(category)}
          >
            删除
          </Button>
        </Space>
      </div>
    ),
    children: category.children?.map(renderTreeNode)
  })
  
  return (
    <div className="category-manage">
      <div className="mb-4">
        <Button type="primary" onClick={handleAddRoot}>
          添加根分类
        </Button>
      </div>
      
      <Tree
        treeData={categories.map(renderTreeNode)}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        draggable
        onDrop={handleDrop}
      />
    </div>
  )
}
```

## 📊 商品分析

### 分析维度
- 📈 **销售分析**: 销量趋势、热销商品、销售排行
- 📦 **库存分析**: 库存预警、周转率、滞销商品
- 💰 **价格分析**: 价格分布、价格趋势、竞品对比
- 🎯 **用户行为**: 浏览量、收藏量、转化率

### 实现示例
```typescript
const ProductAnalysis: React.FC = () => {
  const [salesData, setSalesData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  
  // 销售趋势图配置
  const salesConfig = {
    data: salesData,
    xField: 'date',
    yField: 'sales',
    smooth: true,
    color: '#1890ff'
  }
  
  return (
    <div className="product-analysis">
      <Row gutter={16}>
        <Col span={12}>
          <Card title="销售趋势">
            <Line {...salesConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="库存分布">
            <Pie data={inventoryData} angleField="value" colorField="type" />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
```

---

*本文档详细说明了商品管理模块的功能特性、技术实现和业务流程。*
