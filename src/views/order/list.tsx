import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Row, 
  Col, 
  Form, 
  Select, 
  Modal, 
  message, 
  Typography 
} from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchOrderList, 
  fetchOrderStatistics, 
  setPagination 
} from '@/store/slices/orderSlice';
import { shipOrder, cancelOrder, exportOrders } from '@/api/order';
import OrderStatusTag from '@/components/OrderStatusTag';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;

// 模拟数据
const mockStatistics = [
  { title: '总订单数', value: 1253 },
  { title: '待支付', value: 125 },
  { title: '待发货', value: 85 },
  { title: '已发货', value: 95 },
  { title: '已完成', value: 948 }
];

// 定义订单数据类型
interface OrderData {
  orderId: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  actualAmount: number;
  status: string;
  paymentMethod?: string;
  createTime: string;
  payTime?: string;
}

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { orderList, statistics, pagination, loading } = useSelector((state: RootState) => state.order);
  
  // 本地状态
  const [shipDialogVisible, setShipDialogVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [shipForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchOrders();
    dispatch(fetchOrderStatistics());
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取订单列表
  const fetchOrders = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values
    };
    dispatch(fetchOrderList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchOrders();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchOrders();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看订单详情
  const handleDetail = (record: OrderData) => {
    navigate(`/order/detail/${record.orderId}`);
  };
  
  // 处理发货
  const handleShip = (record: OrderData) => {
    setCurrentOrder(record);
    shipForm.resetFields();
    setShipDialogVisible(true);
  };
  
  // 确认发货
  const confirmShip = async () => {
    try {
      const values = await shipForm.validateFields();
      if (!currentOrder) return;
      
      const hide = message.loading('正在发货...', 0);
      try {
        await shipOrder(currentOrder.orderId, values);
        hide();
        message.success('发货成功');
        setShipDialogVisible(false);
        fetchOrders();
        dispatch(fetchOrderStatistics());
      } catch (error) {
        hide();
        message.error('发货失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 处理取消订单
  const handleCancel = (record: OrderData) => {
    setCurrentOrder(record);
    cancelForm.resetFields();
    setCancelDialogVisible(true);
  };
  
  // 确认取消订单
  const confirmCancel = async () => {
    try {
      const values = await cancelForm.validateFields();
      if (!currentOrder) return;
      
      const hide = message.loading('正在取消订单...', 0);
      try {
        await cancelOrder(currentOrder.orderId, values);
        hide();
        message.success('订单已取消');
        setCancelDialogVisible(false);
        fetchOrders();
        dispatch(fetchOrderStatistics());
      } catch (error) {
        hide();
        message.error('取消订单失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 导出订单
  const handleExport = async () => {
    const values = form.getFieldsValue();
    const hide = message.loading('正在导出...', 0);
    
    try {
      const response = await exportOrders(values);
      hide();
      
      // 创建Blob对象
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `订单列表_${new Date().getTime()}.xlsx`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error) {
      hide();
      message.error('导出失败');
    }
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
  
  // 获取支付方式标签类型
  const getPaymentMethodTagType = (method?: string) => {
    switch (method) {
      case 'alipay':
        return 'blue';
      case 'wechat':
        return 'green';
      case 'bank':
        return 'purple';
      case 'balance':
        return 'orange';
      default:
        return 'default';
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<OrderData> = [
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 80
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '实付金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 120,
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <OrderStatusTag status={status} />
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => method ? (
        <span>{getPaymentMethodText(method)}</span>
      ) : (
        <span>未支付</span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 180,
      render: (time) => time ? formatDateTime(time) : '-'
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDetail(record)}>详情</Button>
          {record.status === 'pending_shipment' && (
            <Button 
              type="link" 
              style={{ color: '#52c41a' }}
              onClick={() => handleShip(record)}
            >
              发货
            </Button>
          )}
          {['pending_payment', 'pending_shipment'].includes(record.status) && (
            <Button 
              type="link" 
              danger
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          )}
        </Space>
      )
    }
  ];
  
  return (
    <div className="order-list-container">
      <Title level={2}>订单管理</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="orderNo" label="订单编号">
            <Input placeholder="订单编号" allowClear />
          </Form.Item>
          <Form.Item name="status" label="订单状态">
            <Select placeholder="订单状态" style={{ width: 150 }} allowClear>
              <Option value="">全部</Option>
              <Option value="pending_payment">待支付</Option>
              <Option value="pending_shipment">待发货</Option>
              <Option value="shipped">已发货</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="用户ID" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button onClick={resetQuery}>重置</Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      {/* 订单统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {mockStatistics.map((item, index) => (
          <Col span={4} key={index}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#999' }}>{item.title}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* 订单列表表格 */}
      <Card>
        <Table<OrderData>
          columns={columns}
          dataSource={orderList}
          rowKey="orderId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange
          }}
          scroll={{ x: 1300 }}
        />
      </Card>
      
      {/* 发货对话框 */}
      <Modal
        title="订单发货"
        open={shipDialogVisible}
        onOk={confirmShip}
        onCancel={() => setShipDialogVisible(false)}
        width={500}
      >
        <Form
          form={shipForm}
          layout="vertical"
        >
          <Form.Item label="订单编号">
            <span>{currentOrder?.orderNo}</span>
          </Form.Item>
          <Form.Item
            name="shippingCompany"
            label="物流公司"
            rules={[{ required: true, message: '请选择物流公司' }]}
          >
            <Select placeholder="请选择物流公司">
              <Option value="SF">顺丰速运</Option>
              <Option value="ZTO">中通快递</Option>
              <Option value="YTO">圆通速递</Option>
              <Option value="YD">韵达快递</Option>
              <Option value="STO">申通快递</Option>
              <Option value="JD">京东物流</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="trackingNo"
            label="物流单号"
            rules={[{ required: true, message: '请输入物流单号' }]}
          >
            <Input placeholder="请输入物流单号" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 取消订单对话框 */}
      <Modal
        title="取消订单"
        open={cancelDialogVisible}
        onOk={confirmCancel}
        onCancel={() => setCancelDialogVisible(false)}
        width={500}
      >
        <Form
          form={cancelForm}
          layout="vertical"
        >
          <Form.Item label="订单编号">
            <span>{currentOrder?.orderNo}</span>
          </Form.Item>
          <Form.Item
            name="remark"
            label="取消原因"
            rules={[{ required: true, message: '请输入取消原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入取消原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList; 