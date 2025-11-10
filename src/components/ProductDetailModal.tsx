import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Image, Typography, Tag, Divider, Space, Card, Descriptions, Rate, Badge } from 'antd'
import {
  ShoppingCartOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
  CalendarOutlined,
  DollarOutlined,
  InboxOutlined,
  TagOutlined,
  AppstoreOutlined,
  BranchesOutlined
} from '@ant-design/icons'
import type { ProductData, BrandData, CategoryData } from '../api/product'
import { brandApi, categoryApi } from '../api/product'
import './ProductDetailModal.scss'

const { Title, Text, Paragraph } = Typography

interface ProductDetailModalProps {
  visible: boolean
  product: ProductData | null
  onCancel: () => void
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onCancel
}) => {
  const [brandName, setBrandName] = useState<string>('')
  const [categoryName, setCategoryName] = useState<string>('')

  // 获取品牌信息
  useEffect(() => {
    const fetchBrandInfo = async () => {
      if (product?.brandId && !product.brandName) {
        try {
          const brandData = await brandApi.getBrandDetail(product.brandId)
          setBrandName(brandData.name)
        } catch (error) {
          console.error('获取品牌信息失败:', error)
          setBrandName('无品牌')
        }
      } else {
        setBrandName(product?.brandName || '无品牌')
      }
    }

    if (visible && product) {
      fetchBrandInfo()
    }
  }, [visible, product])

  // 获取分类信息
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (product?.categoryId && !product.categoryName) {
        try {
          const categoryData = await categoryApi.getCategoryDetail(product.categoryId)
          setCategoryName(categoryData.name)
        } catch (error) {
          console.error('获取分类信息失败:', error)
          setCategoryName('未分类')
        }
      } else {
        setCategoryName(product?.categoryName || '未分类')
      }
    }

    if (visible && product) {
      fetchCategoryInfo()
    }
  }, [visible, product])

  // 调试信息
  if (product) {
    console.log('商品详情数据:', {
      productId: product.productId,
      productName: product.productName,
      productImg: product.productImg,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      brandId: product.brandId,
      brandName: product.brandName,
      resolvedCategoryName: categoryName,
      resolvedBrandName: brandName
    })
  }

  if (!product) {
    console.log('ProductDetailModal: 没有商品数据')
    return null
  }

  // 构建图片URL（与商品列表保持一致）
  const getImageUrl = (image: string) => {
    if (!image) {
      return 'https://via.placeholder.com/400x400?text=No+Image'
    }
    if (image.startsWith('http')) {
      return image
    }
    // 与商品列表保持一致的图片路径
    return `http://localhost:5173/products/${image}`
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price?.toFixed(2) || '0.00'}`
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      '上架': { color: 'success', text: '在售' },
      '下架': { color: 'default', text: '下架' },
      '1': { color: 'success', text: '在售' },
      '0': { color: 'default', text: '下架' }
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  // 获取库存状态
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: 'error', text: '缺货' }
    if (stock <= 10) return { color: 'warning', text: '库存紧张' }
    return { color: 'success', text: '库存充足' }
  }

  const stockStatus = getStockStatus(product.stock)

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="product-detail-modal"
      centered
    >
      <div className="product-detail-content">
        {/* 头部信息 */}
        <div className="product-header">
          <Row gutter={24}>
            <Col span={10}>
              <div className="product-image-container">
                <Image
                  src={getImageUrl(product.productImg)}
                  alt={product.productName}
                  className="product-main-image"
                  fallback="https://via.placeholder.com/400x400?text=No+Image"
                  preview={{
                    mask: <div className="preview-mask">
                      <EyeOutlined />
                      <span>预览</span>
                    </div>
                  }}
                />
                <div className="product-badges">
                  {product.isHot === 1 && <Badge.Ribbon text="热销" color="red" />}
                  {product.isNew === 1 && <Badge.Ribbon text="新品" color="blue" />}
                  {product.isRecommend === 1 && <Badge.Ribbon text="推荐" color="gold" />}
                </div>
              </div>
            </Col>
            <Col span={14}>
              <div className="product-info">
                <div className="product-title-section">
                  <Title level={3} className="product-title">
                    {product.productName}
                  </Title>
                  <div className="product-meta">
                    <Space size="middle">
                      <Text type="secondary">ID: {product.productId}</Text>
                      <Text type="secondary">SKU: {product.productSn || 'BY' + product.productId}</Text>
                      {getStatusTag(product.productStatus)}
                    </Space>
                  </div>
                </div>

                <div className="price-section">
                  <div className="price-container">
                    <div className="current-price">
                      <DollarOutlined />
                      <span className="price-value">{formatPrice(product.priceNew)}</span>
                      <span className="price-label">现价</span>
                    </div>
                    {product.priceOld && product.priceOld > product.priceNew && (
                      <div className="original-price">
                        <span className="price-value">{formatPrice(product.priceOld)}</span>
                        <span className="price-label">原价</span>
                      </div>
                    )}
                  </div>
                  {product.priceOld && product.priceOld > product.priceNew && (
                    <div className="discount-info">
                      <Tag color="red">
                        省 {formatPrice(product.priceOld - product.priceNew)}
                      </Tag>
                      <Tag color="orange">
                        {Math.round((product.priceNew / product.priceOld) * 10)}折
                      </Tag>
                    </div>
                  )}
                </div>

                <div className="stats-section">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="stat-card">
                        <div className="stat-item">
                          <InboxOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-value">{product.stock}</div>
                            <div className="stat-label">库存</div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="stat-card">
                        <div className="stat-item">
                          <ShoppingCartOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-value">{product.sales || 0}</div>
                            <div className="stat-label">销量</div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="stat-card">
                        <div className="stat-item">
                          <StarOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-value">
                              <Rate disabled defaultValue={product.rating || 0} />
                            </div>
                            <div className="stat-label">评分</div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" className="stat-card">
                        <div className="stat-item">
                          <HeartOutlined className="stat-icon" />
                          <div className="stat-content">
                            <div className="stat-value">{product.support || 0}</div>
                            <div className="stat-label">收藏</div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* 库存状态标签 */}
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <Tag
                      color={stockStatus.color}
                      style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontWeight: 500
                      }}
                    >
                      {stockStatus.text}
                    </Tag>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* 商品详情信息 */}
        <div className="product-details">
          <Row gutter={24}>
            <Col span={12}>
              <Card title={<><AppstoreOutlined /> 基本信息</>} size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="商品分类">
                    <TagOutlined /> {categoryName}
                  </Descriptions.Item>
                  <Descriptions.Item label="商品品牌">
                    <BranchesOutlined /> {brandName}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    <CalendarOutlined /> {formatDate(product.createTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    <CalendarOutlined /> {formatDate(product.updateTime)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card title={<><TagOutlined /> 商品描述</>} size="small">
                <div className="product-description">
                  {product.productDetail ? (
                    <Paragraph ellipsis={{ rows: 6, expandable: true, symbol: '展开' }}>
                      {product.productDetail}
                    </Paragraph>
                  ) : (
                    <Text type="secondary">暂无商品描述</Text>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  )
}

export default ProductDetailModal
