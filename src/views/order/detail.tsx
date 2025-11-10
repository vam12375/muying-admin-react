import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Descriptions, 
  Divider, 
  Space, 
  Tag, 
  Tooltip, 
  message,
  Badge,
  Skeleton,
  Row,
  Col,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PrinterOutlined, 
  DownloadOutlined, 
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  ShopOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchOrderDetail, clearOrderDetail, shipOrder } from '@/store/slices/orderSlice';
import { getEnabledLogisticsCompanies, generateTrackingNo, getLogisticsByOrderId } from '@/api/logistics';
import OrderStatusTag from '@/components/OrderStatusTag';
import OrderFlowChart from '@/components/OrderFlowChart';
import OrderTimeline from '@/components/OrderTimeline';
import ProductGallery from '@/components/ProductGallery';
import { formatDateTime } from '@/utils/dateUtils';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import '@/styles/animations.css';

const { Title, Text } = Typography;

// 定义API响应类型接口
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
  success?: boolean;
}

// 数据转换工具函数
const formatOrderData = (rawData: any) => {
  if (!rawData) return null;
  
  // 开发环境打印完整数据结构以便调试
  if (process.env.NODE_ENV === 'development') {
    console.log('订单原始数据结构:', JSON.stringify(rawData, null, 2));
  }
  
  // 尝试获取用户信息（可能来自多个地方）
  let userData = {
    userId: rawData.userId || rawData.user_id || '',
    username: '',
  };
  
  // 从各种可能的数据结构中提取用户名
  if (rawData.user && typeof rawData.user === 'object') {
    userData.username = rawData.user.username || rawData.user.nickname || '';
  } else if (rawData.username) {
    userData.username = rawData.username;
  } else if (rawData.user_name) {
    userData.username = rawData.user_name;
  }
  
  // 如果仍然没有用户名，使用用户ID作为备用
  if (!userData.username && userData.userId) {
    userData.username = `用户${userData.userId}`;
  }
  
  // 处理商品信息，确保每个商品都有有效的图片路径
  const products = Array.isArray(rawData.products) ? rawData.products.map((product: any) => {
    // 获取商品图片路径（从多个可能的属性中）
    let productImage = product.productImg || product.product_image || '';
    
    // 处理特殊路径格式
    if (productImage.includes('muying-web/public/products')) {
      const fileName = productImage.split('/').pop();
      productImage = `http://localhost:5173/products/${fileName}`;
    } else if (!productImage.startsWith('http') && !productImage.startsWith('/')) {
      // 如果只是文件名，添加默认路径
      productImage = `http://localhost:5173/products/${productImage}`;
    }
    
    return {
      id: product.id,
      productId: product.productId || product.product_id,
      productName: product.productName || product.product_name || '未知商品',
      productImage: productImage,
      price: product.price || 0,
      quantity: product.quantity || 0,
      subtotal: (product.price || 0) * (product.quantity || 0),
      attributes: product.specs || product.attributes || '',
    };
  }) : [];
  
  return {
    // 订单基本信息
    orderId: rawData.orderId || rawData.order_id || '',
    orderNo: rawData.orderNo || rawData.order_no || '',
    createTime: rawData.createTime || rawData.create_time,
    paymentMethod: rawData.paymentMethod || rawData.payment_method || '未知',
    payTime: rawData.payTime || rawData.pay_time,
    status: rawData.status || 'pending_payment',
    totalAmount: rawData.totalAmount || rawData.total_amount || 0,
    actualAmount: rawData.actualAmount || rawData.actual_amount || 0,
    discountAmount: rawData.discountAmount || rawData.discount_amount || 0,
    couponAmount: rawData.couponAmount || rawData.coupon_amount || 0,
    shippingFee: rawData.shippingFee || rawData.shipping_fee || 0,
    
    // 积分抵扣信息
    pointsUsed: rawData.pointsUsed || rawData.points_used || 0,
    pointsDiscount: rawData.pointsDiscount || rawData.points_discount || 0,
    
    // 支付信息
    paymentNo: rawData.paymentNo || rawData.payment_no || rawData.paymentFlowNo || rawData.payment_flow_no || rawData.transactionId || '',
    
    // 用户信息
    userId: userData.userId,
    username: userData.username,
    user: rawData.user || {},
    
    // 收货信息
    receiverName: rawData.receiverName || rawData.receiver_name || '',
    receiverPhone: rawData.receiverPhone || rawData.receiver_phone || '',
    receiverAddress: `${rawData.receiverProvince || ''} ${rawData.receiverCity || ''} ${rawData.receiverDistrict || ''} ${rawData.receiverAddress || ''}`,
    receiverProvince: rawData.receiverProvince || rawData.receiver_province || '',
    receiverCity: rawData.receiverCity || rawData.receiver_city || '',
    receiverDistrict: rawData.receiverDistrict || rawData.receiver_district || '',
    receiverDetailAddress: rawData.receiverAddress || rawData.receiver_address || '',
    receiverZip: rawData.receiverZip || rawData.receiver_zip || '',
    
    // 物流信息
    trackingNo: rawData.trackingNo || rawData.tracking_no || '',
    shippingCompany: rawData.shippingCompany || rawData.shipping_company || '',
    shippingMethod: rawData.shippingMethod || rawData.shipping_method || '',
    shippingTime: rawData.shippingTime || rawData.shipping_time,
    
    // 商品信息
    products: products,
  };
};

// 格式化支付方式
const formatPaymentMethod = (method: string): string => {
  const methodMap: {[key: string]: string} = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'wallet': '钱包支付',
    'credit_card': '信用卡',
    'cod': '货到付款'
  };
  
  return methodMap[method] || method || '未知';
};

// 带颜色的支付方式标签
const renderPaymentMethodWithColor = (method: string) => {
  const methodText = formatPaymentMethod(method);
  let color = '';
  
  switch (method) {
    case 'alipay':
      color = '#1890ff'; // 蓝色
      break;
    case 'wechat':
      color = '#52c41a'; // 绿色
      break;
    case 'wallet':
      color = '#f5222d'; // 红色
      break;
    default:
      color = '#d9d9d9'; // 默认灰色
  }
  
  return <Tag color={color}>{methodText}</Tag>;
};

// 定义订单商品类型
interface OrderItemData {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
  attributes: string;
}

// 物流轨迹类型
interface LogisticsTrack {
  id: string;
  trackingTime: string;
  location: string;
  content: string;
  operator?: string;
}

// 订单历史记录类型
interface OrderHistory {
  id: string;
  title: string;
  time: string;
  description?: string;
  operator?: string;
  type?: 'success' | 'warning' | 'error' | 'processing' | 'default';
}

// 样式组件
const PageContainer = styled.div`
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    .header-buttons {
      margin-top: 16px;
    }
  }
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .ant-card-head-title {
    font-size: 16px;
    font-weight: 600;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .info-icon {
    margin-right: 8px;
    color: rgba(0, 0, 0, 0.45);
  }
  
  .info-label {
    color: rgba(0, 0, 0, 0.65);
    margin-right: 8px;
  }
  
  .info-value {
    font-weight: 500;
  }
`;

const SummaryContainer = styled.div`
  padding: 16px 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 16px;
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .summary-total {
    font-size: 16px;
    font-weight: 600;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed rgba(0, 0, 0, 0.06);
  }
  
  .price {
    color: #f5222d;
  }
  
  .discount {
    color: #52c41a;
  }
`;

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { orderDetail, loading } = useSelector((state: RootState) => state.order);
  
  // 本地状态
  const [logisticsTracks, setLogisticsTracks] = useState<LogisticsTrack[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [formattedData, setFormattedData] = useState<any>(null);
  const [realLogisticsInfo, setRealLogisticsInfo] = useState<any>(null);
  const [loadingLogisticsInfo, setLoadingLogisticsInfo] = useState(false);
  const [logisticsError, setLogisticsError] = useState<string | null>(null);
  
  // 发货相关状态
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [shipForm] = Form.useForm();
  const [logistics, setLogistics] = useState<any[]>([]);
  const [loadingLogistics, setLoadingLogistics] = useState(false);
  const [generatingTrackingNo, setGeneratingTrackingNo] = useState(false);
  const [useOrderReceiver, setUseOrderReceiver] = useState(true);
  
  // 初始加载
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(id));
    }
    
    // 组件卸载时清除订单详情
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [dispatch, id]);
  
  // 处理订单数据
  useEffect(() => {
    if (orderDetail) {
      console.log('原始订单数据:', orderDetail); // 添加日志，便于调试
      const formatted = formatOrderData(orderDetail);
      setFormattedData(formatted);
      console.log('格式化后的数据:', formatted); // 添加日志，便于调试

      // 检查产品数据
      if (formatted && formatted.products && formatted.products.length > 0) {
        console.log('产品数据:', formatted.products);
      } else {
        console.warn('订单中没有产品数据或产品数据为空');
      }
    }
  }, [orderDetail]);

  // 获取真实物流信息
  useEffect(() => {
    const fetchLogisticsInfo = async () => {
      if (!formattedData || !formattedData.orderId) return;

      // 只有已发货或已完成的订单才获取物流信息
      if (formattedData.status !== 'shipped' && formattedData.status !== 'completed') {
        setRealLogisticsInfo(null);
        setLogisticsError(null);
        return;
      }

      setLoadingLogisticsInfo(true);
      setLogisticsError(null);
      try {
        const response = await getLogisticsByOrderId(formattedData.orderId) as unknown as ApiResponse;
        if (response.code === 200 && response.data) {
          console.log('获取到真实物流信息:', response.data);
          setRealLogisticsInfo(response.data);
          setLogisticsError(null);
        } else {
          console.warn('获取物流信息失败:', response.message);
          setRealLogisticsInfo(null);
          setLogisticsError(response.message || '获取物流信息失败');
        }
      } catch (error) {
        console.error('获取物流信息异常:', error);
        setRealLogisticsInfo(null);
        setLogisticsError('网络错误，无法获取物流信息');
      } finally {
        setLoadingLogisticsInfo(false);
      }
    };

    fetchLogisticsInfo();
  }, [formattedData]);
  
  // 生成物流轨迹和订单历史数据
  useEffect(() => {
    if (orderDetail) {
      // 使用真实物流轨迹数据或降级到模拟数据
      if (orderDetail.status === 'shipped' || orderDetail.status === 'completed') {
        let tracks: LogisticsTrack[] = [];

        // 优先使用真实物流数据
        if (realLogisticsInfo && realLogisticsInfo.tracks && realLogisticsInfo.tracks.length > 0) {
          console.log('使用真实物流轨迹数据:', realLogisticsInfo.tracks);
          tracks = realLogisticsInfo.tracks.map((track: any, index: number) => ({
            id: track.id?.toString() || (index + 1).toString(),
            trackingTime: track.trackingTime ? formatDateTime(new Date(track.trackingTime)) : '',
            location: track.location || '',
            content: track.content || '',
            operator: track.operator || '系统'
          }));
        } else {
          console.log('使用模拟物流轨迹数据');
          // 降级到模拟数据
          tracks = [
            {
              id: '1',
              trackingTime: orderDetail.shippingTime || formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24)),
              location: '发货仓库',
              content: '商品已发出',
              operator: '系统'
            }
          ];

          if (orderDetail.status === 'completed') {
            tracks.unshift({
              id: '2',
              trackingTime: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 5)),
              location: '收货地址',
              content: '已签收，签收人：' + (orderDetail.receiverName || '收件人'),
              operator: '物流'
            });

            tracks.unshift({
              id: '3',
              trackingTime: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 10)),
              location: orderDetail.receiverCity || '目的地',
              content: '包裹正在派送中',
              operator: '物流'
            });

            tracks.unshift({
              id: '4',
              trackingTime: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 15)),
              location: orderDetail.receiverCity || '目的地',
              content: '快件到达派送中心',
              operator: '物流'
            });
          }
        }

        setLogisticsTracks(tracks.reverse());
      }
      
      // 生成订单历史数据
      const history: OrderHistory[] = [
        {
          id: '1',
          title: '订单创建',
          time: orderDetail.createTime,
          description: `订单号: ${orderDetail.orderNo}`,
          type: 'default'
        }
      ];
      
      if (orderDetail.payTime) {
        history.push({
          id: '2',
          title: '订单支付',
          time: orderDetail.payTime,
          description: `支付方式: ${renderPaymentMethodWithColor(orderDetail.paymentMethod)}`,
          type: 'success'
        });
      }
      
      if (orderDetail.status === 'shipped' || orderDetail.status === 'completed') {
        history.push({
          id: '3',
          title: '订单发货',
          time: orderDetail.shippingTime || formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24)),
          description: `物流公司: ${orderDetail.shippingCompany || '顺丰速运'}, 物流单号: ${orderDetail.trackingNo || 'SF1234567890'}`,
          type: 'processing'
        });
      }
      
      if (orderDetail.status === 'completed') {
        history.push({
          id: '4',
          title: '订单完成',
          time: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 5)),
          description: '订单已完成，感谢您的购买！',
          type: 'success'
        });
      }
      
      if (orderDetail.status === 'cancelled') {
        history.push({
          id: '5',
          title: '订单取消',
          time: orderDetail.updateTime || formatDateTime(new Date()),
          description: '订单已取消',
          type: 'error'
        });
      }
      
      setOrderHistory(history);
    }
  }, [orderDetail, realLogisticsInfo]);
  
  // 返回列表
  const goBack = () => {
    navigate('/order/list');
  };
  
  // 获取支付方式文本
  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信支付';
      case 'bank':
        return '银行卡';
      case 'balance':
        return '余额支付';
      default:
        return method || '未支付';
    }
  };
  
  // 获取订单流程节点数据
  const getOrderFlowNodes = () => {
    const baseNodes = [
      {
        key: 'created',
        title: '下单',
        time: orderDetail?.createTime ? formatDateTime(orderDetail.createTime, 'MM-DD HH:mm') : '',
        status: 'completed' as const
      },
      {
        key: 'paid',
        title: '支付',
        time: orderDetail?.payTime ? formatDateTime(orderDetail.payTime, 'MM-DD HH:mm') : '',
        status: 'waiting' as const
      },
      {
        key: 'shipped',
        title: '发货',
        time: orderDetail?.shippingTime ? formatDateTime(orderDetail.shippingTime, 'MM-DD HH:mm') : '',
        status: 'waiting' as const
      },
      {
        key: 'completed',
        title: '完成',
        time: '',
        status: 'waiting' as const
      }
    ];
    
    // 根据订单状态设置当前节点及其状态
    const orderStatus = orderDetail?.status;
    let currentNodeKey = 'created';
    
    if (orderStatus === 'pending_payment') {
      currentNodeKey = 'created';
    } else if (orderStatus === 'pending_shipment') {
      currentNodeKey = 'paid';
      baseNodes[1].status = 'completed';
    } else if (orderStatus === 'shipped') {
      currentNodeKey = 'shipped';
      baseNodes[1].status = 'completed';
      baseNodes[2].status = 'completed';
    } else if (orderStatus === 'completed') {
      currentNodeKey = 'completed';
      baseNodes[1].status = 'completed';
      baseNodes[2].status = 'completed';
      baseNodes[3].status = 'completed';
    } else if (orderStatus === 'cancelled') {
      // 取消订单展示不同的流程
      return [
        {
          key: 'created',
          title: '下单',
          time: orderDetail?.createTime ? formatDateTime(orderDetail.createTime, 'MM-DD HH:mm') : '',
          status: 'completed' as const
        },
        {
          key: 'cancelled',
          title: '已取消',
          time: orderDetail?.updateTime ? formatDateTime(orderDetail.updateTime, 'MM-DD HH:mm') : '',
          status: 'failed' as const
        }
      ];
    }
    
    return baseNodes;
  };
  
  // 打印订单
  const printOrder = () => {
    window.print();
  };
  
  // 导出订单
  const exportOrder = () => {
    message.success('订单导出功能待实现');
  };
  
  // 渲染没有数据时的界面
  const renderEmptyState = () => {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Title level={4}>未找到订单信息</Title>
          <Button type="primary" onClick={goBack} style={{ marginTop: 16 }}>返回订单列表</Button>
        </div>
      </Card>
    );
  };
  
  // 渲染加载状态
  const renderLoading = () => {
    return (
      <PageContainer>
        <PageHeader>
          <Skeleton.Input active style={{ width: 300 }} />
          <Skeleton.Button active size="large" shape="round" style={{ width: 120 }} />
        </PageHeader>
        
        <StyledCard>
          <Skeleton active paragraph={{ rows: 4 }} />
        </StyledCard>
        
        <StyledCard>
          <Skeleton active paragraph={{ rows: 3 }} />
        </StyledCard>
        
        <StyledCard>
          <Skeleton active paragraph={{ rows: 2 }} />
        </StyledCard>
        
        <StyledCard>
          <Skeleton active paragraph={{ rows: 6 }} />
        </StyledCard>
      </PageContainer>
    );
  };
  
  // 订单信息区域渲染
  const renderOrderInfo = () => {
    if (!formattedData) return null;
  
  return (
      <StyledCard title="订单信息">
        <Descriptions bordered size="small" column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="订单编号">
            {formattedData.orderNo}
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {formattedData.createTime ? formatDateTime(new Date(formattedData.createTime)) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <OrderStatusTag status={formattedData.status} />
          </Descriptions.Item>
          
          <Descriptions.Item label="订单金额">
            ¥{Number(formattedData.totalAmount).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="实付金额">
            ¥{Number(formattedData.actualAmount).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">
            {renderPaymentMethodWithColor(formattedData.paymentMethod)}
          </Descriptions.Item>
          
          <Descriptions.Item label="支付时间">
            {formattedData.payTime ? formatDateTime(new Date(formattedData.payTime)) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="支付流水号" span={2}>
            <Space>
              {formattedData.paymentNo || '-'}
              {formattedData.paymentNo && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => {
                    navigator.clipboard.writeText(formattedData.paymentNo);
                    message.success('支付流水号已复制到剪贴板');
                  }}
                >
                  复制
                </Button>
              )}
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="订单备注">
            {formattedData.remark || '无'}
          </Descriptions.Item>
        </Descriptions>
      </StyledCard>
    );
  };
  
  // 收货信息区域渲染
  const renderShippingInfo = () => {
    if (!formattedData) return null;
    
    return (
      <StyledCard title="收货信息">
        <Row gutter={[24, 8]}>
          <Col xs={24} sm={12} md={8}>
            <InfoItem>
              <UserOutlined className="info-icon" />
              <span className="info-label">收货人:</span>
              <span className="info-value">{formattedData.receiverName || '-'}</span>
            </InfoItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <InfoItem>
              <PhoneOutlined className="info-icon" />
              <span className="info-label">联系电话:</span>
              <span className="info-value">{formattedData.receiverPhone || '-'}</span>
            </InfoItem>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <InfoItem>
              <TagOutlined className="info-icon" />
              <span className="info-label">配送方式:</span>
              <span className="info-value">{formattedData.shippingMethod || '普通快递'}</span>
            </InfoItem>
          </Col>
          <Col xs={24}>
            <InfoItem>
              <EnvironmentOutlined className="info-icon" />
              <span className="info-label">收货地址:</span>
              <span className="info-value">{formattedData.receiverAddress || '-'}</span>
            </InfoItem>
          </Col>
          <Col xs={24} sm={12}>
            <InfoItem>
              <MailOutlined className="info-icon" />
              <span className="info-label">邮编:</span>
              <span className="info-value">{formattedData.receiverZip || '-'}</span>
            </InfoItem>
          </Col>
        </Row>
      </StyledCard>
    );
  };
  
  // 商品信息区域渲染
  const renderProductInfo = () => {
    if (!formattedData) return null;
    
    // 如果没有商品数据，显示提示信息
    if (!formattedData.products || formattedData.products.length === 0) {
      return (
        <StyledCard title="商品信息">
          <Empty description="暂无商品数据" />
        </StyledCard>
      );
    }
    
    return (
      <StyledCard title="商品信息">
        <ProductGallery 
          products={formattedData.products || []}
          layout="list"
        />
        
        <SummaryContainer>
          <div className="summary-item">
            <span>商品总价：</span>
            <span>¥{Number(formattedData.totalAmount).toFixed(2)}</span>
          </div>
          
          {Number(formattedData.shippingFee) > 0 && (
            <div className="summary-item">
              <span>运费：</span>
              <span>¥{Number(formattedData.shippingFee).toFixed(2)}</span>
            </div>
          )}
          
          {Number(formattedData.discountAmount) > 0 && (
            <div className="summary-item">
              <span>优惠金额：</span>
              <span className="discount">-¥{Number(formattedData.discountAmount).toFixed(2)}</span>
            </div>
          )}
          
          {Number(formattedData.couponAmount) > 0 && (
            <div className="summary-item">
              <span>优惠券抵扣：</span>
              <span className="discount">-¥{Number(formattedData.couponAmount).toFixed(2)}</span>
            </div>
          )}
          
          {Number(formattedData.pointsDiscount) > 0 && (
            <div className="summary-item">
              <span>积分抵扣（{formattedData.pointsUsed}积分）：</span>
              <span className="discount">-¥{Number(formattedData.pointsDiscount).toFixed(2)}</span>
            </div>
          )}
          
          <div className="summary-item summary-total">
            <span>实付金额：</span>
            <span className="price">¥{Number(formattedData.actualAmount).toFixed(2)}</span>
          </div>
        </SummaryContainer>
      </StyledCard>
    );
  };
  
  // 订单历史记录渲染
  const renderOrderTimeline = () => {
    if (!formattedData) return null;
    
    return (
      <StyledCard title="订单动态">
        <OrderTimeline 
          title="订单动态"
          items={orderHistory}
        />
      </StyledCard>
    );
  };
  
  // 处理发货按钮点击
  const handleShip = async () => {
    // 重置表单
    shipForm.resetFields();
    
    // 使用订单收件人信息
    setUseOrderReceiver(true);
    
    // 加载物流公司列表
    setLoadingLogistics(true);
    try {
      // 使用更安全的类型断言方式
      const res = await getEnabledLogisticsCompanies() as unknown as ApiResponse;
      if (res.code === 200) {
        setLogistics(res.data || []);
      } else {
        message.error(res.message || '获取物流公司列表失败');
      }
    } catch (error) {
      console.error('获取物流公司列表失败:', error);
      message.error('获取物流公司列表失败');
    } finally {
      setLoadingLogistics(false);
    }
    
    // 显示对话框
    setShipModalVisible(true);
  };
  
  // 生成物流单号
  const handleGenerateTrackingNo = async () => {
    const companyId = shipForm.getFieldValue('companyId');
    if (!companyId) {
      return message.warning('请先选择物流公司');
    }
    
    setGeneratingTrackingNo(true);
    try {
      const company = logistics.find(item => item.id === companyId);
      if (!company) {
        return message.warning('无效的物流公司');
      }
      
      // 使用更安全的类型断言方式
      const res = await generateTrackingNo(company.code) as unknown as ApiResponse;
      if (res.code === 200) {
        shipForm.setFieldValue('trackingNo', res.data);
        message.success('物流单号生成成功');
      } else {
        message.error(res.message || '生成物流单号失败');
      }
    } catch (error) {
      console.error('生成物流单号失败:', error);
      message.error('生成物流单号失败');
    } finally {
      setGeneratingTrackingNo(false);
    }
  };
  
  // 处理收件人信息变更
  const handleReceiverChange = (checked: boolean) => {
    setUseOrderReceiver(checked);
    
    if (checked) {
      // 使用订单收件人信息时，清空表单中的收件人字段
      shipForm.setFieldsValue({
        receiverName: undefined,
        receiverPhone: undefined,
        receiverAddress: undefined
      });
    } else {
      // 不使用订单收件人信息时，默认填充订单收件人信息
      shipForm.setFieldsValue({
        receiverName: formattedData?.receiverName,
        receiverPhone: formattedData?.receiverPhone,
        receiverAddress: formattedData?.receiverAddress
      });
    }
  };
  
  // 确认发货
  const handleConfirmShip = async () => {
    try {
      const values = await shipForm.validateFields();
      
      if (!id) return;
      
      const data = {
        companyId: values.companyId,
        trackingNo: values.trackingNo || undefined,
      };
      
      // 如果不使用订单收件人信息，添加收件人信息
      if (!useOrderReceiver) {
        Object.assign(data, {
          receiverName: values.receiverName,
          receiverPhone: values.receiverPhone,
          receiverAddress: values.receiverAddress
        });
      }
      
      const hide = message.loading('正在处理发货...', 0);
      try {
        const result = await dispatch(shipOrder({ id, data })).unwrap() as unknown as ApiResponse;
        hide();
        
        if (result.code === 200) {
          message.success('发货成功');
          setShipModalVisible(false);
          // 重新获取订单详情在异步Action中已处理
        } else {
          message.error(result.message || '发货失败');
        }
      } catch (error) {
        hide();
        message.error('发货失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  if (loading) {
    return renderLoading();
  }
  
  if (!formattedData) {
    return renderEmptyState();
  }
  
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>返回</Button>
            <Title level={4} style={{ margin: '16px 0 0 0' }}>
              订单详情 
            </Title>
          </div>
          <div className="header-buttons">
            {formattedData && formattedData.status === 'pending_shipment' && (
              <Button type="primary" onClick={handleShip}>
                发货
              </Button>
            )}
            <Button icon={<PrinterOutlined />} onClick={printOrder}>打印订单</Button>
            <Button icon={<DownloadOutlined />} onClick={exportOrder}>导出</Button>
          </div>
        </PageHeader>
        
        {loading && renderLoading()}
        
        {!loading && !formattedData && renderEmptyState()}
        
        {!loading && formattedData && (
          <>
            <OrderFlowChart 
              currentNodeKey={formattedData.status} 
              nodes={getOrderFlowNodes()} 
            />
            
            {renderOrderInfo()}
            
            {renderShippingInfo()}
            
            {(formattedData.status === 'shipped' || formattedData.status === 'completed') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <StyledCard 
                  title={
                    <Space>
                      <span>物流信息</span>
                      <Badge 
                        status={formattedData.status === 'completed' ? 'success' : 'processing'} 
                        text={formattedData.status === 'completed' ? '已签收' : '运输中'} 
                      />
                    </Space>
                  }
                >
                  <InfoItem>
                    <span className="info-label">物流公司:</span>
                    <span className="info-value">
                      {realLogisticsInfo?.company?.name || formattedData.shippingCompany || '顺丰速运'}
                    </span>
                  </InfoItem>
                  <InfoItem>
                    <span className="info-label">物流单号:</span>
                    <span className="info-value">
                      {realLogisticsInfo?.trackingNo || formattedData.trackingNo || 'SF1234567890'}
                    </span>
                  </InfoItem>
                  <InfoItem>
                    <span className="info-label">发货时间:</span>
                    <span className="info-value">
                      {realLogisticsInfo?.shippingTime
                        ? formatDateTime(new Date(realLogisticsInfo.shippingTime))
                        : formattedData.shippingTime
                        ? formatDateTime(new Date(formattedData.shippingTime))
                        : '-'}
                    </span>
                  </InfoItem>
                  {realLogisticsInfo?.status && (
                    <InfoItem>
                      <span className="info-label">物流状态:</span>
                      <span className="info-value">
                        <Tag color={
                          realLogisticsInfo.status === 'DELIVERED' ? 'success' :
                          realLogisticsInfo.status === 'SHIPPING' ? 'processing' :
                          realLogisticsInfo.status === 'EXCEPTION' ? 'error' : 'default'
                        }>
                          {realLogisticsInfo.status === 'DELIVERED' ? '已送达' :
                           realLogisticsInfo.status === 'SHIPPING' ? '运输中' :
                           realLogisticsInfo.status === 'CREATED' ? '已创建' :
                           realLogisticsInfo.status === 'EXCEPTION' ? '异常' : realLogisticsInfo.status}
                        </Tag>
                      </span>
                    </InfoItem>
                  )}
                  
                  <Divider orientation="left">物流轨迹</Divider>

                  {loadingLogisticsInfo ? (
                    <Skeleton active paragraph={{ rows: 3 }} />
                  ) : logisticsError ? (
                    <Empty
                      description={
                        <div>
                          <Text type="secondary">{logisticsError}</Text>
                          <br />
                          <Text type="secondary">显示模拟轨迹数据</Text>
                        </div>
                      }
                    />
                  ) : logisticsTracks.length > 0 ? (
                    <OrderTimeline
                      items={logisticsTracks.map(track => ({
                        id: track.id,
                        title: track.content,
                        time: track.trackingTime,
                        description: `${track.location}`,
                        operator: track.operator,
                        type: 'processing'
                      }))}
                    />
                  ) : (
                    <Empty description="暂无物流轨迹" />
                  )}
                </StyledCard>
              </motion.div>
            )}
            
            <Row gutter={24}>
              <Col xs={24}>
                {renderProductInfo()}
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col xs={24}>
                {renderOrderTimeline()}
          </Col>
        </Row>
          </>
        )}
      </motion.div>
      
      {/* 发货对话框 */}
      <Modal
        title="订单发货"
        open={shipModalVisible}
        onCancel={() => setShipModalVisible(false)}
        onOk={handleConfirmShip}
        width={600}
      >
        <Spin spinning={loadingLogistics}>
          <Form
            form={shipForm}
            layout="vertical"
            initialValues={{ useOrderReceiver: true }}
          >
            <Form.Item label="订单编号">
              <span>{formattedData?.orderNo}</span>
            </Form.Item>
            
            <Form.Item
              name="companyId"
              label="物流公司"
              rules={[{ required: true, message: '请选择物流公司' }]}
            >
              <Select placeholder="请选择物流公司">
                {logistics.map(company => (
                  <Select.Option key={company.id} value={company.id}>
                    {company.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="trackingNo"
              label="物流单号"
            >
              <Input.Group compact>
                <Form.Item
                  name="trackingNo"
                  noStyle
                >
                  <Input style={{ width: 'calc(100% - 80px)' }} placeholder="留空将自动生成物流单号" />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={handleGenerateTrackingNo}
                  loading={generatingTrackingNo}
                  disabled={!shipForm.getFieldValue('companyId')}
                >
                  生成
                </Button>
              </Input.Group>
            </Form.Item>
            
            <Form.Item>
              <Checkbox checked={useOrderReceiver} onChange={e => handleReceiverChange(e.target.checked)}>
                使用订单收件人信息
              </Checkbox>
            </Form.Item>
            
            {!useOrderReceiver && (
              <>
                <Form.Item
                  name="receiverName"
                  label="收件人姓名"
                  rules={[{ required: !useOrderReceiver, message: '请输入收件人姓名' }]}
                >
                  <Input placeholder="请输入收件人姓名" />
                </Form.Item>
                
                <Form.Item
                  name="receiverPhone"
                  label="收件人电话"
                  rules={[{ required: !useOrderReceiver, message: '请输入收件人电话' }]}
                >
                  <Input placeholder="请输入收件人电话" />
                </Form.Item>
                
                <Form.Item
                  name="receiverAddress"
                  label="收件人地址"
                  rules={[{ required: !useOrderReceiver, message: '请输入收件人地址' }]}
                >
                  <Input.TextArea placeholder="请输入收件人地址" rows={3} />
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </Modal>
    </PageContainer>
  );
};

export default OrderDetail; 