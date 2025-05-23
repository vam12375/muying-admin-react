import React, { useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Typography, 
  Divider, 
  Table, 
  Row, 
  Col, 
  Steps, 
  message,
  Space
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { fetchOrderDetail, clearOrderDetail } from '@/store/slices/orderSlice';
import OrderStatusTag from '@/components/OrderStatusTag';
import { formatDateTime } from '@/utils/dateUtils';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Title, Text } = Typography;
const { Step } = Steps;

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

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { orderDetail, loading } = useSelector((state: RootState) => state.order);
  
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
  
  // 获取订单状态步骤
  const getOrderSteps = () => {
    const orderStatus = orderDetail?.status;
    let current = 0;
    
    switch (orderStatus) {
      case 'pending_payment':
        current = 0;
        break;
      case 'pending_shipment':
        current = 1;
        break;
      case 'shipped':
        current = 2;
        break;
      case 'completed':
        current = 3;
        break;
      case 'cancelled':
        current = -1;
        break;
      case 'refunding':
        current = -1;
        break;
      case 'refunded':
        current = -1;
        break;
      default:
        current = 0;
    }
    
    if (current === -1) {
      return (
        <Steps
          current={1}
          status="error"
          items={[
            { title: '下单' },
            { title: orderStatus === 'cancelled' ? '已取消' : '退款中' },
          ]}
        />
      );
    }
    
    return (
      <Steps
        current={current}
        items={[
          { title: '下单' },
          { title: '付款' },
          { title: '发货' },
          { title: '完成' },
        ]}
      />
    );
  };
  
  // 表格列定义
  const columns: ColumnsType<OrderItemData> = [
    {
      title: '商品图片',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 100,
      render: (image) => (
        <img 
          src={getThumbnailUrl(image)} 
          alt="商品图片" 
          style={{ width: 80, height: 80, objectFit: 'cover' }} 
        />
      )
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 300
    },
    {
      title: '规格',
      dataIndex: 'attributes',
      key: 'attributes',
      width: 150
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 100,
      render: (subtotal) => `¥${subtotal.toFixed(2)}`
    }
  ];
  
  // 打印订单
  const printOrder = () => {
    window.print();
  };
  
  // 导出订单
  const exportOrder = () => {
    message.success('订单导出功能待实现');
  };
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!orderDetail) {
    return <div>未找到订单信息</div>;
  }
  
  return (
    <div className="order-detail-container">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
          >
            返回列表
          </Button>
          <Button onClick={printOrder}>打印订单</Button>
          <Button onClick={exportOrder}>导出订单</Button>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>订单信息</Title>
        <div style={{ marginBottom: 20 }}>
          {getOrderSteps()}
        </div>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="订单ID">{orderDetail.orderId}</Descriptions.Item>
          <Descriptions.Item label="订单编号">{orderDetail.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <OrderStatusTag status={orderDetail.status} />
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {formatDateTime(orderDetail.createTime)}
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">
            {getPaymentMethodText(orderDetail.paymentMethod)}
          </Descriptions.Item>
          <Descriptions.Item label="支付时间">
            {orderDetail.payTime ? formatDateTime(orderDetail.payTime) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="订单金额">¥{orderDetail.totalAmount.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="实付金额">¥{orderDetail.actualAmount.toFixed(2)}</Descriptions.Item>
          {orderDetail.discountAmount > 0 && (
            <Descriptions.Item label="优惠金额">¥{orderDetail.discountAmount.toFixed(2)}</Descriptions.Item>
          )}
          {orderDetail.shippingFee > 0 && (
            <Descriptions.Item label="运费">¥{orderDetail.shippingFee.toFixed(2)}</Descriptions.Item>
          )}
          {orderDetail.couponAmount > 0 && (
            <Descriptions.Item label="优惠券抵扣">¥{orderDetail.couponAmount.toFixed(2)}</Descriptions.Item>
          )}
          {orderDetail.pointsAmount > 0 && (
            <Descriptions.Item label="积分抵扣">¥{orderDetail.pointsAmount.toFixed(2)}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>用户信息</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户ID">{orderDetail.userId}</Descriptions.Item>
          <Descriptions.Item label="用户名">{orderDetail.username}</Descriptions.Item>
          <Descriptions.Item label="手机号">{orderDetail.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{orderDetail.email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>收货信息</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="收货人">{orderDetail.receiver}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{orderDetail.receiverPhone}</Descriptions.Item>
          <Descriptions.Item label="收货地址" span={2}>
            {`${orderDetail.province} ${orderDetail.city} ${orderDetail.district} ${orderDetail.address}`}
          </Descriptions.Item>
          <Descriptions.Item label="邮政编码">{orderDetail.zipCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="配送方式">{orderDetail.shippingMethod || '普通快递'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      {orderDetail.status === 'shipped' && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={3}>物流信息</Title>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="物流公司">{orderDetail.shippingCompany}</Descriptions.Item>
            <Descriptions.Item label="物流单号">{orderDetail.trackingNo}</Descriptions.Item>
            <Descriptions.Item label="发货时间">
              {formatDateTime(orderDetail.shippingTime)}
            </Descriptions.Item>
            <Descriptions.Item label="物流状态">{orderDetail.shippingStatus || '运输中'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      
      <Card>
        <Title level={3}>商品信息</Title>
        <Table<OrderItemData>
          columns={columns}
          dataSource={orderDetail.items || []}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
        
        <Row justify="end" style={{ marginTop: 20 }}>
          <Col span={8}>
            <div style={{ textAlign: 'right', padding: '0 20px' }}>
              <p>
                <Text>商品总价：</Text>
                <Text strong>¥{orderDetail.totalAmount.toFixed(2)}</Text>
              </p>
              {orderDetail.shippingFee > 0 && (
                <p>
                  <Text>运费：</Text>
                  <Text strong>¥{orderDetail.shippingFee.toFixed(2)}</Text>
                </p>
              )}
              {orderDetail.discountAmount > 0 && (
                <p>
                  <Text>优惠金额：</Text>
                  <Text type="danger">-¥{orderDetail.discountAmount.toFixed(2)}</Text>
                </p>
              )}
              {orderDetail.couponAmount > 0 && (
                <p>
                  <Text>优惠券抵扣：</Text>
                  <Text type="danger">-¥{orderDetail.couponAmount.toFixed(2)}</Text>
                </p>
              )}
              {orderDetail.pointsAmount > 0 && (
                <p>
                  <Text>积分抵扣：</Text>
                  <Text type="danger">-¥{orderDetail.pointsAmount.toFixed(2)}</Text>
                </p>
              )}
              <Divider style={{ margin: '10px 0' }} />
              <p>
                <Text strong style={{ fontSize: 16 }}>实付金额：</Text>
                <Text type="danger" strong style={{ fontSize: 18 }}>
                  ¥{orderDetail.actualAmount.toFixed(2)}
                </Text>
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrderDetail; 