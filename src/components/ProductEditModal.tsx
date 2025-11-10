import React, { useState, useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Divider,
  Tag,
  Image,
  message,
  Switch
} from 'antd'
import { 
  UploadOutlined, 
  PictureOutlined, 
  DollarOutlined, 
  InboxOutlined,
  TagOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons'
import type { ProductData, BrandData, CategoryData } from '../api/product'
import './ProductEditModal.scss'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface ProductEditModalProps {
  visible: boolean
  product: ProductData | null
  brands: BrandData[]
  categories: CategoryData[]
  onCancel: () => void
  onSave: (values: any) => Promise<void>
  uploadProps: any
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  visible,
  product,
  brands = [],
  categories = [],
  onCancel,
  onSave,
  uploadProps
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  // 安全的数据过滤
  const safeCategories = categories.filter(category => category && category.categoryId && category.name)
  const safeBrands = brands.filter(brand => brand && brand.brandId && brand.name)

  // 当产品数据变化时更新表单
  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue({
        name: product.productName,
        image: product.productImg,
        price: product.priceNew || 0,
        originalPrice: product.priceOld || 0,
        description: product.productDetail,
        stock: product.stock || 0,
        categoryId: product.categoryId?.toString(),
        brandId: product.brandId?.toString(),
        status: product.productStatus === '上架' ? 1 : 0
      })
      setImagePreview(product.productImg || '')
    } else if (visible && !product) {
      form.resetFields()
      setImagePreview('')
    }
  }, [visible, product, form])

  // 处理保存
  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      await onSave(values)
      message.success(product ? '商品更新成功' : '商品创建成功')
      onCancel()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理图片URL变化
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImagePreview(url)
  }

  // 创建增强的上传配置
  const enhancedUploadProps = {
    ...uploadProps,
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        // 假设上传成功后，服务器返回的URL在response.url中
        const imageUrl = info.file.response?.url || info.file.response?.data?.url
        if (imageUrl) {
          form.setFieldsValue({ image: imageUrl })
          setImagePreview(imageUrl)
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }

      // 调用原始的onChange处理器
      if (uploadProps.onChange) {
        uploadProps.onChange(info)
      }
    },
  }

  // 获取图片URL
  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${window.location.origin}/products/${url}`
  }

  return (
    <Modal
      title={
        <div className="modal-header">
          <Space>
            <PictureOutlined className="header-icon" />
            <Title level={4} style={{ margin: 0 }}>
              {product ? '编辑商品' : '添加商品'}
            </Title>
          </Space>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={
        <div className="modal-footer">
          <Space>
            <Button 
              icon={<CloseOutlined />} 
              onClick={onCancel}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSave}
            >
              {product ? '更新商品' : '创建商品'}
            </Button>
          </Space>
        </div>
      }
      width={900}
      className="product-edit-modal"
      maskClosable={false}
    >
      <div className="product-edit-content">
        <Form
          form={form}
          layout="vertical"
          className="product-form"
        >
          <Row gutter={24}>
            {/* 左侧：基本信息 */}
            <Col span={14}>
              <Card 
                title={
                  <Space>
                    <TagOutlined />
                    <span>基本信息</span>
                  </Space>
                } 
                className="form-card"
              >
                <Form.Item
                  name="name"
                  label="商品名称"
                  rules={[{ required: true, message: '请输入商品名称' }]}
                >
                  <Input 
                    placeholder="请输入商品名称" 
                    size="large"
                    maxLength={100}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="商品描述"
                  rules={[{ required: true, message: '请输入商品描述' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="请输入商品描述，建议包含商品特点、适用人群等信息"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="categoryId"
                      label="商品分类"
                      rules={[{ required: true, message: '请选择商品分类' }]}
                    >
                      <Select 
                        placeholder="请选择商品分类"
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {safeCategories.length > 0 ? (
                          safeCategories.map(category => (
                            <Option key={category.categoryId} value={category.categoryId.toString()}>
                              <Space>
                                <AppstoreOutlined />
                                {category.name}
                              </Space>
                            </Option>
                          ))
                        ) : (
                          <Option disabled value="">暂无分类数据</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="brandId"
                      label="商品品牌"
                      rules={[{ required: true, message: '请选择商品品牌' }]}
                    >
                      <Select 
                        placeholder="请选择商品品牌"
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {safeBrands.length > 0 ? (
                          safeBrands.map(brand => (
                            <Option key={brand.brandId} value={brand.brandId.toString()}>
                              <Space>
                                <BranchesOutlined />
                                {brand.name}
                              </Space>
                            </Option>
                          ))
                        ) : (
                          <Option disabled value="">暂无品牌数据</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card 
                title={
                  <Space>
                    <DollarOutlined />
                    <span>价格库存</span>
                  </Space>
                } 
                className="form-card"
                style={{ marginTop: 16 }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="price"
                      label="售价"
                      rules={[{ required: true, message: '请输入售价' }]}
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        addonBefore="¥"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="originalPrice"
                      label="原价"
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        addonBefore="¥"
                        size="large"
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
                        style={{ width: '100%' }}
                        placeholder="0"
                        addonAfter="件"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="status"
                  label="商品状态"
                  initialValue={1}
                >
                  <Select placeholder="请选择商品状态" size="large">
                    <Option value={1}>
                      <Tag color="green">在售</Tag>
                    </Option>
                    <Option value={0}>
                      <Tag color="red">下架</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            {/* 右侧：图片管理 */}
            <Col span={10}>
              <Card 
                title={
                  <Space>
                    <PictureOutlined />
                    <span>商品图片</span>
                  </Space>
                } 
                className="form-card image-card"
              >
                <Form.Item
                  name="image"
                  label="图片URL"
                  rules={[{ required: true, message: '请输入图片URL或上传图片' }]}
                >
                  <Input 
                    placeholder="请输入图片URL" 
                    onChange={handleImageChange}
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="上传图片">
                  <Upload {...enhancedUploadProps} className="image-uploader">
                    <Button icon={<UploadOutlined />} size="large" block>
                      点击上传图片
                    </Button>
                  </Upload>
                </Form.Item>

                {/* 图片预览 */}
                {imagePreview && (
                  <div className="image-preview">
                    <Text strong>图片预览：</Text>
                    <div className="preview-container">
                      <Image
                        src={getImageUrl(imagePreview)}
                        alt="商品图片预览"
                        fallback="https://via.placeholder.com/200x200?text=No+Image"
                        preview={{
                          mask: (
                            <div className="preview-mask">
                              <EyeOutlined />
                              <span>预览</span>
                            </div>
                          )
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  )
}

export default ProductEditModal
