import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Select, 
  DatePicker, 
  Typography,
  Tag,
  Modal,
  message,
  Descriptions,
  Image
} from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchPointsExchangeList, 
  setPagination 
} from '@/store/slices/pointsSlice';
import { updateExchangeStatus } from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 定义积分兑换记录数据类型
interface PointsExchangeData {
  id: number;
  userId: number;
  username: string;
  productId: number;
  productName: string;
  productImage: string;
  points: number;
  quantity: number;
  status: string;
  address: string;
  contact: string;
  phone: string;
  createTime: string;
  updateTime: string;
  remark: string;
}

const PointsExchange: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { exchangeList, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentExchange, setCurrentExchange] = useState<PointsExchangeData | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [statusForm] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchExchangeList();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取积分兑换记录列表
  const fetchExchangeList = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...values,
      // 处理日期范围
      startDate: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD') : undefined,
      endDate: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD') : undefined
    };
    
    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }
    
    dispatch(fetchPointsExchangeList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchExchangeList();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchExchangeList();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看详情
  const showDetail = (record: PointsExchangeData) => {
    setCurrentExchange(record);
    setDetailVisible(true);
  };
  
  // 打开状态修改弹窗
  const showStatusModal = (record: PointsExchangeData) => {
    setCurrentExchange(record);
    statusForm.setFieldsValue({
      status: record.status,
      remark: ''
    });
    setStatusModalVisible(true);
  };
  
  // 更新兑换状态
  const handleUpdateStatus = async () => {
    try {
      if (!currentExchange) return;
      
      const values = await statusForm.validateFields();
      const hide = message.loading('正在更新状态...', 0);
      
      try {
        await updateExchangeStatus(currentExchange.id, values.status);
        hide();
        message.success('状态更新成功');
        setStatusModalVisible(false);
        fetchExchangeList();
      } catch (error) {
        hide();
        message.error('状态更新失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="warning">待处理</Tag>;
      case 'processing':
        return <Tag color="processing">处理中</Tag>;
      case 'shipped':
        return <Tag color="blue">已发货</Tag>;
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      case 'cancelled':
        return <Tag color="error">已取消</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<PointsExchangeData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '兑换时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button 
            type="link" 
            onClick={() => showStatusModal(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            更新状态
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="points-exchange-container">
      <Title level={2}>积分兑换记录</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="用户ID" allowClear />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item name="productId" label="商品ID">
            <Input placeholder="商品ID" allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="shipped">已发货</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card>
        <Table<PointsExchangeData>
          columns={columns}
          dataSource={exchangeList}
          rowKey="id"
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
        />
      </Card>
      
      {/* 详情弹窗 */}
      <Modal
        title="兑换详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentExchange && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="兑换ID">{currentExchange.id}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{currentExchange.userId}</Descriptions.Item>
              <Descriptions.Item label="用户名">{currentExchange.username}</Descriptions.Item>
              <Descriptions.Item label="商品ID">{currentExchange.productId}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{currentExchange.productName}</Descriptions.Item>
              <Descriptions.Item label="积分">{currentExchange.points}</Descriptions.Item>
              <Descriptions.Item label="数量">{currentExchange.quantity}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(currentExchange.status)}
              </Descriptions.Item>
              <Descriptions.Item label="联系人" span={2}>{currentExchange.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话" span={2}>{currentExchange.phone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>{currentExchange.address}</Descriptions.Item>
              <Descriptions.Item label="兑换时间" span={2}>
                {formatDateTime(currentExchange.createTime)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>
                {formatDateTime(currentExchange.updateTime)}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{currentExchange.remark || '-'}</Descriptions.Item>
            </Descriptions>
            
            {currentExchange.productImage && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <p>商品图片</p>
                <Image
                  width={200}
                  src={getThumbnailUrl(currentExchange.productImage)}
 