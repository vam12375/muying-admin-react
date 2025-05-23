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
  Typography,
  Drawer,
  DatePicker,
  Tooltip,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  Tag,
  Statistic,
  Divider,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  SendOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  EllipsisOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchOrderList, 
  fetchOrderStatistics, 
  setPagination 
} from '@/store/slices/orderSlice';
import { 
  shipOrder, 
  cancelOrder, 
  exportOrders 
} from '@/api/order';
import { 
  getEnabledLogisticsCompanies,
  generateTrackingNo,
  type LogisticsCompany
} from '@/api/logistics';
import OrderStatusTag from '@/components/OrderStatusTag';
import { formatDateTime } from '@/utils/dateUtils';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import OrderStatCard from '@/components/OrderStatCard';
import AdvancedSearchPanel from '@/components/AdvancedSearchPanel';
import '@/styles/animations.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 定义订单数据类型
interface OrderData {
  orderId: number;
  orderNo: string;
  userId: number;
  username?: string;
  totalAmount: number;
  actualAmount: number;
  status: string;
  paymentMethod?: string;
  createTime: string;
  payTime?: string;
}

// 样式化组件
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
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TableActionButton = styled(Button)`
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
`;

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showStatistics, setShowStatistics] = useState(true);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  
  // 物流公司状态
  const [logisticsCompanies, setLogisticsCompanies] = useState<Array<LogisticsCompany>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [generatingTrackingNo, setGeneratingTrackingNo] = useState(false);
  
  // 默认物流公司，当API调用失败或返回空列表时使用
  const defaultLogisticsCompanies: Array<LogisticsCompany> = [
    { id: 1, code: 'SF', name: '顺丰速运', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 1, createTime: '', updateTime: '' },
    { id: 2, code: 'ZTO', name: '中通快递', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 2, createTime: '', updateTime: '' },
    { id: 3, code: 'YTO', name: '圆通速递', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 3, createTime: '', updateTime: '' },
    { id: 4, code: 'YD', name: '韵达快递', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 4, createTime: '', updateTime: '' },
    { id: 5, code: 'STO', name: '申通快递', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 5, createTime: '', updateTime: '' },
    { id: 6, code: 'JD', name: '京东物流', contact: null, phone: null, address: null, status: 1, logo: null, sortOrder: 6, createTime: '', updateTime: '' },
  ];
  
  // 模拟历史趋势数据
  const [trendData] = useState({
    total: [120, 132, 101, 134, 90, 230, 210, 240, 280, 300, 320, 350],
    pending_payment: [20, 32, 18, 30, 20, 40, 30, 50, 40, 60, 50, 40],
    pending_shipment: [30, 40, 28, 40, 30, 50, 60, 70, 80, 90, 100, 110],
    shipped: [40, 30, 20, 30, 20, 70, 60, 80, 70, 80, 90, 100],
    completed: [30, 30, 35, 34, 20, 70, 60, 70, 80, 70, 60, 100],
    cancelled: [10, 10, 15, 14, 10, 20, 10, 20, 10, 20, 10, 20]
  });
  
  // 初始加载
  useEffect(() => {
    fetchOrders();
    dispatch(fetchOrderStatistics());
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取启用的物流公司列表
  useEffect(() => {
    const fetchLogisticsCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await getEnabledLogisticsCompanies();
        if (response && response.data && response.data.code === 200) {
          const companies = response.data.data || [];
          if (companies.length > 0) {
            setLogisticsCompanies(companies);
            console.log('获取物流公司成功，共', companies.length, '家公司');
          } else {
            console.warn('物流公司列表为空，使用默认物流公司列表');
            setLogisticsCompanies(defaultLogisticsCompanies);
          }
        } else {
          const errorMsg = response?.data?.message || '未知错误';
          console.error('获取物流公司列表失败:', errorMsg);
          message.warning(`获取物流公司列表失败: ${errorMsg}，使用默认物流公司列表`);
          setLogisticsCompanies(defaultLogisticsCompanies);
        }
      } catch (error: unknown) {
        let errorMessage = '未知错误';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String((error as { message: unknown }).message);
        }
        
        console.error('获取物流公司列表失败:', errorMessage);
        message.warning(`获取物流公司列表失败: ${errorMessage}，使用默认物流公司列表`);
        setLogisticsCompanies(defaultLogisticsCompanies);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchLogisticsCompanies();
  }, []);
  
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
  const handleSearch = (values: any) => {
    // 计算激活的筛选条件数量
    const activeFilters = Object.values(values).filter(val => 
      val !== undefined && val !== null && val !== ''
    ).length;
    setFilterCount(activeFilters);
    
    dispatch(setPagination({ current: 1 }));
    dispatch(fetchOrderList({ ...values, page: 1, pageSize: pagination.pageSize }));
  };
  
  // 重置查询
  const handleReset = () => {
    form.resetFields();
    setFilterCount(0);
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
  
  // 生成物流单号
  const handleGenerateTrackingNo = async () => {
    const companyId = shipForm.getFieldValue('companyId');
    if (!companyId) {
      message.warning('请先选择物流公司');
      return;
    }
    
    const company = logisticsCompanies.find(c => c.id === companyId);
    if (!company || !company.code) {
      message.warning('所选物流公司无效或缺少公司代码');
      return;
    }
    
    try {
      setGeneratingTrackingNo(true);
      const response = await generateTrackingNo(company.code);
      if (response && response.data && response.data.code === 200) {
        const trackingNo = response.data.data;
        shipForm.setFieldsValue({ trackingNo });
        message.success(`物流单号生成成功: ${trackingNo}`);
      } else {
        message.error(response?.data?.message || '物流单号生成失败，请稍后重试');
      }
    } catch (error: any) {
      console.error('物流单号生成失败:', error);
      message.error(`物流单号生成失败: ${error?.message || '未知错误，请稍后重试'}`);
    } finally {
      setGeneratingTrackingNo(false);
    }
  };
  
  // 确认发货
  const confirmShip = async () => {
    try {
      const values = await shipForm.validateFields();
      if (!currentOrder) return;
      
      // 如果没有输入物流单号，尝试自动生成
      if (!values.trackingNo && values.companyId) {
        const company = logisticsCompanies.find(c => c.id === values.companyId);
        if (company && company.code) {
          try {
            setGeneratingTrackingNo(true);
            const response = await generateTrackingNo(company.code);
            if (response && response.data && response.data.code === 200) {
              values.trackingNo = response.data.data;
              message.info(`已自动生成物流单号: ${values.trackingNo}`);
            } else {
              message.error(response?.data?.message || '物流单号生成失败，请手动输入');
              setGeneratingTrackingNo(false);
              return;
            }
          } catch (error: any) {
            console.error('物流单号生成失败:', error);
            message.error(`物流单号生成失败: ${error?.message || '请手动输入物流单号'}`);
            setGeneratingTrackingNo(false);
            return;
          } finally {
            setGeneratingTrackingNo(false);
          }
        }
      }
      
      const hide = message.loading('正在发货...', 0);
      try {
        const response = await shipOrder(currentOrder.orderId, values);
        hide();
        
        if (response && response.data && response.data.code === 200) {
          message.success('发货成功');
          setShipDialogVisible(false);
          fetchOrders();
          dispatch(fetchOrderStatistics());
        } else {
          message.error(response?.data?.message || '发货失败，请重试');
        }
      } catch (error: any) {
        hide();
        console.error('发货失败:', error);
        message.error(`发货失败: ${error?.message || '未知错误，请重试'}`);
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
  
  // 批量操作
  const handleBatchAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个订单');
      return;
    }
    
    switch (action) {
      case 'export':
        message.info(`已选择${selectedRowKeys.length}个订单进行导出`);
        break;
      case 'ship':
        message.info(`已选择${selectedRowKeys.length}个订单进行批量发货`);
        break;
      default:
        break;
    }
  };
  
  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      {
        key: 'pending_shipment',
        text: '选择所有待发货',
        onSelect: (changeableRowKeys: React.Key[]) => {
          const pendingShipmentKeys = orderList
            .filter(item => item.status === 'pending_shipment')
            .map(item => item.orderId);
          setSelectedRowKeys(pendingShipmentKeys);
        }
      }
    ]
  };
  
  // 表格列定义
  const columns: ColumnsType<OrderData> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (orderNo, record) => (
        <div>
          <Text strong className="hover-text" onClick={() => navigate(`/order/detail/${record.orderId}`)}>
            {orderNo}
          </Text>
          {record.createTime && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDateTime(record.createTime, 'YYYY-MM-DD HH:mm')}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: '用户信息',
      dataIndex: 'userId',
      key: 'userId',
      width: 150,
      render: (userId, record) => (
        <div className="user-info">
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <div>{record.username || `用户${userId}`}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>ID: {userId}</div>
          </div>
        </div>
      )
    },
    {
      title: '金额',
      key: 'amount',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ color: '#f5222d', fontWeight: 500 }}>
            ¥{record.actualAmount.toFixed(2)}
          </div>
          {record.totalAmount !== record.actualAmount && (
            <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(0, 0, 0, 0.45)' }}>
              ¥{record.totalAmount.toFixed(2)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '待支付', value: 'pending_payment' },
        { text: '待发货', value: 'pending_shipment' },
        { text: '已发货', value: 'shipped' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <OrderStatusTag status={status} size="default" />
    },
    {
      title: '支付信息',
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            {record.paymentMethod ? (
              <Badge status="success" text={getPaymentMethodText(record.paymentMethod)} />
            ) : (
              <Badge status="default" text="未支付" />
            )}
          </div>
          {record.payTime && (
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
              {formatDateTime(record.payTime, 'YYYY-MM-DD HH:mm')}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <TableActionButton 
              type="primary" 
              ghost
              icon={<EyeOutlined />} 
              onClick={() => handleDetail(record)}
            >
              详情
            </TableActionButton>
          </Tooltip>
          
          {record.status === 'pending_shipment' && (
            <Tooltip title="发货">
              <TableActionButton 
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleShip(record)}
              >
                发货
              </TableActionButton>
            </Tooltip>
          )}
          
          {['pending_payment', 'pending_shipment'].includes(record.status) && (
            <Tooltip title="取消订单">
              <TableActionButton 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record)}
              >
                取消
              </TableActionButton>
            </Tooltip>
          )}
          
          <Dropdown 
            menu={{
              items: [
                {
                  key: 'detail',
                  icon: <EyeOutlined />,
                  label: '查看详情',
                  onClick: () => handleDetail(record)
                },
                ...(record.status === 'pending_shipment' ? [
                  {
                    key: 'ship',
                    icon: <SendOutlined />,
                    label: '发货',
                    onClick: () => handleShip(record)
                  }
                ] : []),
                ...(['pending_payment', 'pending_shipment'].includes(record.status) ? [
                  {
                    key: 'cancel',
                    icon: <CloseCircleOutlined />,
                    label: '取消订单',
                    onClick: () => handleCancel(record)
                  }
                ] : [])
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];
  
  // 渲染统计卡片
  const renderStatCards = () => {
    return (
      <AnimatePresence>
        {showStatistics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Row gutter={[16, 16]} className="stat-row">
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="总订单数" 
                  value={statistics.total}
                  icon={<ShoppingOutlined />}
                  trend={trendData.total}
                  color="#ffffff"
                  trendColor="#1890ff"
                  onClick={() => handleSearch({ status: '' })}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="待支付" 
                  value={statistics.pending_payment}
                  previousValue={statistics.pending_payment > 0 ? statistics.pending_payment - 5 : 0}
                  icon={<DollarOutlined />}
                  trend={trendData.pending_payment}
                  color="#fff7e6"
                  trendColor="#fa8c16"
                  onClick={() => handleSearch({ status: 'pending_payment' })}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="待发货" 
                  value={statistics.pending_shipment}
                  previousValue={statistics.pending_shipment > 0 ? statistics.pending_shipment - 8 : 0}
                  icon={<ClockCircleOutlined />}
                  trend={trendData.pending_shipment}
                  color="#e6f7ff"
                  trendColor="#1890ff"
                  onClick={() => handleSearch({ status: 'pending_shipment' })}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="已发货" 
                  value={statistics.shipped}
                  previousValue={statistics.shipped > 0 ? statistics.shipped - 3 : 0}
                  icon={<CarOutlined />}
                  trend={trendData.shipped}
                  color="#e6fffb"
                  trendColor="#13c2c2"
                  onClick={() => handleSearch({ status: 'shipped' })}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="已完成" 
                  value={statistics.completed}
                  previousValue={statistics.completed > 0 ? statistics.completed - 10 : 0}
                  icon={<CheckCircleOutlined />}
                  trend={trendData.completed}
                  color="#f6ffed"
                  trendColor="#52c41a"
                  onClick={() => handleSearch({ status: 'completed' })}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={4}>
                <OrderStatCard 
                  title="已取消" 
                  value={statistics.cancelled}
                  previousValue={statistics.cancelled > 0 ? statistics.cancelled - 2 : 0}
                  icon={<CloseCircleOutlined />}
                  trend={trendData.cancelled}
                  color="#fff1f0"
                  trendColor="#f5222d"
                  onClick={() => handleSearch({ status: 'cancelled' })}
                />
              </Col>
            </Row>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // 渲染高级搜索面板
  const renderSearchForm = () => {
    return (
      <AdvancedSearchPanel
        title="订单筛选"
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
        form={form}
        extra={
          <Space>
            <Badge count={filterCount} size="small" offset={[3, -3]}>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
              >
                高级筛选
              </Button>
            </Badge>
            <Button 
              icon={showStatistics ? <LineChartOutlined /> : <LineChartOutlined />}
              onClick={() => setShowStatistics(!showStatistics)}
            >
              {showStatistics ? '隐藏统计' : '显示统计'}
            </Button>
          </Space>
        }
      >
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="orderNo" label="订单编号">
            <Input placeholder="请输入订单编号" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="请输入用户ID" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="status" label="订单状态">
            <Select placeholder="请选择订单状态" allowClear>
              <Option value="">全部</Option>
              <Option value="pending_payment">待支付</Option>
              <Option value="pending_shipment">待发货</Option>
              <Option value="shipped">已发货</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="dateRange" label="下单时间">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </AdvancedSearchPanel>
    );
  };
  
  // 渲染高级筛选抽屉
  const renderFilterDrawer = () => {
    return (
      <Drawer
        title="高级筛选"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={360}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleReset}>
              重置
            </Button>
            <Button 
              type="primary" 
              onClick={() => {
                const values = form.getFieldsValue();
                handleSearch(values);
                setFilterDrawerVisible(false);
              }}
            >
              应用筛选
            </Button>
          </div>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="orderNo" label="订单编号">
            <Input placeholder="请输入订单编号" allowClear />
          </Form.Item>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="请输入用户ID" allowClear />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item name="status" label="订单状态">
            <Select placeholder="请选择订单状态" allowClear>
              <Option value="">全部</Option>
              <Option value="pending_payment">待支付</Option>
              <Option value="pending_shipment">待发货</Option>
              <Option value="shipped">已发货</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="paymentMethod" label="支付方式">
            <Select placeholder="请选择支付方式" allowClear>
              <Option value="">全部</Option>
              <Option value="alipay">支付宝</Option>
              <Option value="wechat">微信支付</Option>
              <Option value="bank">银行卡</Option>
              <Option value="balance">余额支付</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="下单时间范围">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minAmount" label="最小金额">
            <Input placeholder="最小金额" type="number" addonBefore="¥" />
          </Form.Item>
          <Form.Item name="maxAmount" label="最大金额">
            <Input placeholder="最大金额" type="number" addonBefore="¥" />
          </Form.Item>
        </Form>
      </Drawer>
    );
  };
  
  return (
    <PageContainer className="order-list-container">
      <PageHeader>
        <div className="fade-in">
          <Title level={2}>订单管理</Title>
        </div>
        
        <Space>
          {selectedRowKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Space>
                <Text>{`已选择 ${selectedRowKeys.length} 项`}</Text>
                <Button 
                  type="primary" 
                  onClick={() => handleBatchAction('export')}
                  icon={<DownloadOutlined />}
                >
                  批量导出
                </Button>
                <Button
                  danger
                  onClick={() => setSelectedRowKeys([])}
                >
                  取消选择
                </Button>
              </Space>
            </motion.div>
          )}
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          >
            导出订单
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchOrders();
              dispatch(fetchOrderStatistics());
            }}
          >
            刷新
          </Button>
        </Space>
      </PageHeader>
      
      {renderStatCards()}
      {renderSearchForm()}
      
      <StyledCard className="table-card">
        <Table<OrderData>
          rowSelection={rowSelection}
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
          scroll={{ x: 1200 }}
          rowClassName={(record) => {
            if (record.status === 'pending_shipment') return 'row-highlight';
            return '';
          }}
        />
      </StyledCard>
      
      {/* 发货对话框 */}
      <Modal
        title="订单发货"
        open={shipDialogVisible}
        onOk={confirmShip}
        onCancel={() => setShipDialogVisible(false)}
        width={600}
        okText="确认发货"
        cancelText="取消"
      >
        <Form
          form={shipForm}
          layout="vertical"
        >
          <Form.Item label="订单编号" style={{ marginBottom: '12px' }}>
            <span className="order-no">{currentOrder?.orderNo}</span>
          </Form.Item>
          
          <Form.Item
            name="companyId"
            label="物流公司"
            rules={[{ required: true, message: '请选择物流公司' }]}
            extra="选择物流公司后可自动生成物流单号"
            style={{ marginBottom: '16px' }}
          >
            <Select 
              placeholder="请选择物流公司" 
              loading={loadingCompanies}
              notFoundContent={loadingCompanies ? <Spin size="small" /> : '无匹配的物流公司'}
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {logisticsCompanies.map(company => (
                <Option key={company.id} value={company.id}>{company.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="trackingNo"
            label="物流单号"
            rules={[{ required: true, message: '请输入物流单号或点击生成按钮自动生成' }]}
            tooltip="物流单号格式：物流公司代码(大写字母)+日期时间+随机数，例如：SF2505091322338066"
            extra="系统会根据所选物流公司自动生成正确格式的物流单号"
            style={{ marginBottom: '16px' }}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                style={{ width: 'calc(100% - 110px)' }} 
                placeholder="请输入物流单号或点击生成按钮" 
              />
              <Button 
                type="primary" 
                loading={generatingTrackingNo}
                onClick={handleGenerateTrackingNo}
                style={{ width: '110px' }}
                icon={<SyncOutlined />}
              >
                生成单号
              </Button>
            </Space.Compact>
          </Form.Item>
          
          <Divider style={{ margin: '8px 0 16px' }} />
          
          <Form.Item
            name="remark"
            label="备注"
            style={{ marginBottom: '0' }}
          >
            <Input.TextArea placeholder="发货备注（可选）" rows={3} />
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
            name="cancelReason"
            label="取消原因"
            rules={[{ required: true, message: '请选择取消原因' }]}
          >
            <Select placeholder="请选择取消原因">
              <Option value="out_of_stock">商品缺货</Option>
              <Option value="customer_request">客户要求取消</Option>
              <Option value="pricing_error">价格错误</Option>
              <Option value="shipping_issue">物流问题</Option>
              <Option value="other">其他原因</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="取消备注（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      
      {renderFilterDrawer()}
    </PageContainer>
  );
};

export default OrderList; 