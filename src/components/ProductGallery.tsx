import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Badge, 
  Tooltip, 
  Tag, 
  Divider, 
  Modal,
  Empty 
} from 'antd';
import { 
  ZoomInOutlined, 
  ShoppingOutlined, 
  TagOutlined,
  RightOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Text, Title } = Typography;

// 定义商品接口
interface Product {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
  attributes?: string;
  tags?: string[];
}

// 组件属性接口
interface ProductGalleryProps {
  products: Product[];
  loading?: boolean;
  onItemClick?: (product: Product) => void;
  layout?: 'grid' | 'list';
}

// 样式化组件
const GalleryContainer = styled.div`
  margin-bottom: 16px;
`;

const ProductCard = styled(motion.div)`
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  height: 100%;
  
  &:hover .zoom-icon {
    opacity: 1;
  }
  
  .product-image {
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-title {
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5;
    height: 42px;
  }
  
  .product-price {
    color: #f5222d;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .product-attributes {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .zoom-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
  }
  
  .quantity-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
  }
  
  .ant-card {
    height: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductListItem = styled(motion.div)`
  margin-bottom: 12px;
  
  .ant-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  .list-item-content {
    display: flex;
    align-items: center;
  }
  
  .list-item-image {
    flex: 0 0 100px;
    margin-right: 16px;
    position: relative;
  }
  
  .list-item-info {
    flex: 1;
  }
  
  .list-item-actions {
    flex: 0 0 80px;
    text-align: right;
  }
  
  .product-image-small {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

// 商品弹窗内容
const ProductDetailModal = styled(Modal)`
  .modal-product-image {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    margin-bottom: 16px;
  }
  
  .modal-product-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .modal-product-price {
    color: #f5222d;
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .modal-product-quantity {
    margin-bottom: 16px;
  }
  
  .modal-product-attributes {
    margin-bottom: 16px;
  }
`;

/**
 * 产品画廊组件
 * 以网格或列表形式展示订单中的商品
 */
const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  loading = false,
  onItemClick,
  layout = 'grid'
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // 处理商品点击
  const handleProductClick = (product: Product) => {
    if (onItemClick) {
      onItemClick(product);
    } else {
      setCurrentProduct(product);
      setPreviewVisible(true);
    }
  };
  
  // 关闭预览
  const handleClosePreview = () => {
    setPreviewVisible(false);
  };
  
  // 渲染网格布局
  const renderGrid = () => {
    return (
      <Row gutter={[16, 16]}>
        {products.map((product, index) => (
          <Col xs={24} sm={12} md={8} lg={6} xxl={4} key={product.id || index}>
            <ProductCard
              onClick={() => handleProductClick(product)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hoverable>
                <div className="product-image">
                  <div className="zoom-icon">
                    <ZoomInOutlined />
                  </div>
                  {product.quantity > 1 && (
                    <Badge count={product.quantity} className="quantity-badge" />
                  )}
                  <ProductImage 
                    src={product.productImage || 'https://via.placeholder.com/300x300?text=No+Image'} 
                    alt={product.productName}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      // 图片加载失败时使用替代图片
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // 防止循环触发
                      target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                    }}
                  />
                </div>
                <div className="product-info">
                  <div className="product-title">{product.productName}</div>
                  <div className="product-price">
                    <span>¥{product.price.toFixed(2)}</span>
                    <span>x{product.quantity}</span>
                  </div>
                  {product.attributes && (
                    <div className="product-attributes">{product.attributes}</div>
                  )}
                </div>
              </Card>
            </ProductCard>
          </Col>
        ))}
      </Row>
    );
  };
  
  // 渲染列表布局
  const renderList = () => {
    return (
      <div>
        {products.map((product, index) => (
          <ProductListItem
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card bordered={undefined} loading={loading} onClick={() => handleProductClick(product)}>
              <div className="list-item-content">
                <div className="list-item-image">
                  {product.quantity > 1 && (
                    <Badge count={product.quantity} style={{ position: 'absolute', right: 0, zIndex: 1 }} />
                  )}
                  <img 
                    className="product-image-small" 
                    src={product.productImage || 'https://via.placeholder.com/80x80?text=No+Image'} 
                    alt={product.productName}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      // 图片加载失败时使用替代图片
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // 防止循环触发
                      target.src = 'https://via.placeholder.com/80x80?text=Image+Error';
                    }}  
                  />
                </div>
                <div className="list-item-info">
                  <Text strong className="product-title">{product.productName}</Text>
                  {product.attributes && (
                    <div className="product-attributes">{product.attributes}</div>
                  )}
                  <div className="product-price">
                    <Text type="danger">¥{product.price.toFixed(2)} × {product.quantity}</Text>
                  </div>
                </div>
                <div className="list-item-actions">
                  <Text type="danger" strong>¥{product.subtotal.toFixed(2)}</Text>
                  <div style={{ marginTop: 8 }}>
                    <RightOutlined style={{ color: '#bfbfbf' }} />
                  </div>
                </div>
              </div>
            </Card>
          </ProductListItem>
        ))}
      </div>
    );
  };
  
  // 渲染产品详情弹窗
  const renderProductModal = () => {
    if (!currentProduct) return null;
    
    return (
      <ProductDetailModal
        title="商品详情"
        open={previewVisible}
        onCancel={handleClosePreview}
        footer={null}
        width={600}
        centered
      >
        <img 
          className="modal-product-image" 
          src={getThumbnailUrl(currentProduct.productImage, 600, 600)} 
          alt={currentProduct.productName} 
        />
        <div className="modal-product-title">{currentProduct.productName}</div>
        
        {currentProduct.attributes && (
          <div className="modal-product-attributes">
            <TagOutlined style={{ marginRight: 8 }} />
            规格: {currentProduct.attributes}
          </div>
        )}
        
        <div className="modal-product-quantity">
          <ShoppingOutlined style={{ marginRight: 8 }} />
          数量: {currentProduct.quantity}
        </div>
        
        <div className="modal-product-price">
          单价: ¥{currentProduct.price.toFixed(2)}
        </div>
        
        <Divider />
        
        <div className="modal-product-price">
          小计: ¥{currentProduct.subtotal.toFixed(2)}
        </div>
      </ProductDetailModal>
    );
  };
  
  if (!products || products.length === 0) {
    return <Empty description="暂无商品数据" />;
  }
  
  return (
    <GalleryContainer>
      {layout === 'grid' ? renderGrid() : renderList()}
      {renderProductModal()}
    </GalleryContainer>
  );
};

export default ProductGallery; 