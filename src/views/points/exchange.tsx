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
  Image,
  Steps,
  Divider,
  Alert,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ShoppingOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPointsExchangeList,
  fetchExchangeStats,
  setPagination
} from '@/store/slices/pointsSlice';
import { updateExchangeStatus } from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Step } = Steps;

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
  const { exchangeList, exchangeStatsData, pagination, loading } = useSelector((state: RootState) => state.points);

  // 格式化数字,添加千位分隔符
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('zh-CN');
  };

  // 本地状态
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentExchange, setCurrentExchange] = useState<PointsExchangeData | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [shipModalVisible, setShipModalVisible] = useState<boolean>(false);
  const [statusForm] = Form.useForm();
  const [shipForm] = Form.useForm();

  // 初始加载
  useEffect(() => {
    fetchExchangeList();
    // 加载统计数据
    dispatch(fetchExchangeStats({}));
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
  
  // 打开发货弹窗
  const showShipModal = (record: PointsExchangeData) => {
    setCurrentExchange(record);
    shipForm.resetFields();
    setShipModalVisible(true);
  };
  
  // 确认发货
  const handleShip = async () => {
    try {
      if (!currentExchange) return;
      
      const values = await shipForm.validateFields();
      const hide = message.loading('正在发货...', 0);
      
      try {
        // 调用发货API
        const { shipExchange } = await import('@/api/points');
        await shipExchange(currentExchange.id, values);
        hide();
        message.success('发货成功');
        setShipModalVisible(false);
        fetchExchangeList();
      } catch (error) {
        hide();
        message.error('发货失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 快速操作：确认处理
  const handleConfirmProcessing = async (record: PointsExchangeData) => {
    Modal.confirm({
      title: '确认处理',
      content: '确认将此兑换记录标记为处理中？',
      onOk: async () => {
        const hide = message.loading('正在处理...', 0);
        try {
          await updateExchangeStatus(record.id, 'processing');
          hide();
          message.success('操作成功');
          fetchExchangeList();
        } catch (error) {
          hide();
          message.error('操作失败');
        }
      }
    });
  };
  
  // 快速操作：完成兑换
  const handleComplete = async (record: PointsExchangeData) => {
    Modal.confirm({
      title: '确认完成',
      content: '确认此兑换已完成？',
      onOk: async () => {
        const hide = message.loading('正在处理...', 0);
        try {
          await updateExchangeStatus(record.id, 'completed');
          hide();
          message.success('操作成功');
          fetchExchangeList();
        } catch (error) {
          hide();
          message.error('操作失败');
        }
      }
    });
  };
  
  // 快速操作：取消兑换
  const handleCancel = async (record: PointsExchangeData) => {
    Modal.confirm({
      title: '取消兑换',
      content: '确认取消此兑换记录？取消后将退还用户积分。',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('正在处理...', 0);
        try {
          await updateExchangeStatus(record.id, 'cancelled');
          hide();
          message.success('操作成功');
          fetchExchangeList();
        } catch (error) {
          hide();
          message.error('操作失败');
        }
      }
    });
  };
  
  // 获取当前步骤
  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'completed':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
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
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'descend'
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: (a, b) => a.userId - b.userId
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
      width: 100,
      sorter: (a, b) => a.points - b.points,
      render: (points) => formatNumber(points)
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      sorter: (a, b) => a.quantity - b.quantity
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
      sorter: (a, b) => {
        const timeA = new Date(a.createTime).getTime();
        const timeB = new Date(b.createTime).getTime();
        return timeA - timeB;
      },
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />} 
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleConfirmProcessing(record)}
            >
              确认处理
            </Button>
          )}
          
          {record.status === 'processing' && (
            <Button 
              type="primary" 
              size="small"
              icon={<SendOutlined />}
              onClick={() => showShipModal(record)}
            >
              发货
            </Button>
          )}
          
          {record.status === 'shipped' && (
            <Button 
              type="link" 
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
            >
              完成
            </Button>
          )}
          
          {(record.status === 'pending' || record.status === 'processing') && (
            <Button 
              type="link" 
              size="small"
              danger
              icon={<CloseCircleOutlined />}
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
    <div className="points-exchange-container">
      <Title level={2}>积分兑换记录</Title>

      {/* 统计面板 */}
      {exchangeStatsData && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总兑换次数"
                value={exchangeStatsData.totalCount || 0}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总消耗积分"
                value={formatNumber(exchangeStatsData.totalPoints || 0)}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待处理订单"
                value={exchangeStatsData.pendingCount || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日兑换次数"
                value={exchangeStatsData.todayCount || 0}
                suffix={`/ ${formatNumber(exchangeStatsData.todayPoints || 0)}积分`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="orderNo" label="订单号">
            <Input placeholder="订单号" allowClear style={{ width: 180 }} />
          </Form.Item>
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
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
      
      {/* 详情弹窗 */}
      <Modal
        title="兑换详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentExchange && (
          <>
            {/* 订单流程 */}
            <div style={{ marginBottom: 24 }}>
              <Steps 
                current={getCurrentStep(currentExchange.status)}
                status={currentExchange.status === 'cancelled' ? 'error' : 'process'}
              >
                <Step title="待处理" description="等待管理员确认" />
                <Step title="处理中" description="准备发货" />
                <Step title="已发货" description="商品已发出" />
                <Step title="已完成" description="兑换完成" />
              </Steps>
            </div>
            
            <Divider />
            
            {/* 基本信息 */}
            <Title level={5}>基本信息</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="兑换ID">{currentExchange.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(currentExchange.status)}
              </Descriptions.Item>
              <Descriptions.Item label="用户ID">{currentExchange.userId}</Descriptions.Item>
              <Descriptions.Item label="用户名">{currentExchange.username}</Descriptions.Item>
              <Descriptions.Item label="商品ID">{currentExchange.productId}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{currentExchange.productName}</Descriptions.Item>
              <Descriptions.Item label="所需积分">
                <Badge count={formatNumber(currentExchange.points)} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
              <Descriptions.Item label="兑换数量">{currentExchange.quantity}</Descriptions.Item>
              <Descriptions.Item label="总积分">
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#f5222d' }}>
                  {formatNumber(currentExchange.points * currentExchange.quantity)}
                </span>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            {/* 收货信息 */}
            <Title level={5}>收货信息</Title>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="联系人">{currentExchange.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentExchange.phone}</Descriptions.Item>
              <Descriptions.Item label="收货地址">{currentExchange.address}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            {/* 时间信息 */}
            <Title level={5}>时间信息</Title>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="兑换时间">
                {formatDateTime(currentExchange.createTime)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {formatDateTime(currentExchange.updateTime)}
              </Descriptions.Item>
            </Descriptions>
            
            {currentExchange.remark && (
              <>
                <Divider />
                <Title level={5}>备注信息</Title>
                <Alert message={currentExchange.remark} type="info" />
              </>
            )}
            
            {currentExchange.productImage && (
              <>
                <Divider />
                <Title level={5}>商品图片</Title>
                <div style={{ textAlign: 'center' }}>
                  <Image
                    width={200}
                    src={getThumbnailUrl(currentExchange.productImage)}
                    fallback="data:image/png;base64,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"
                  />
                </div>
              </>
            )}
            
            {/* 操作按钮 */}
            <Divider />
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {currentExchange.status === 'pending' && (
                <Button 
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={() => {
                    setDetailVisible(false);
                    handleConfirmProcessing(currentExchange);
                  }}
                >
                  确认处理
                </Button>
              )}
              
              {currentExchange.status === 'processing' && (
                <Button 
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    setDetailVisible(false);
                    showShipModal(currentExchange);
                  }}
                >
                  发货
                </Button>
              )}
              
              {currentExchange.status === 'shipped' && (
                <Button 
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailVisible(false);
                    handleComplete(currentExchange);
                  }}
                >
                  完成
                </Button>
              )}
              
              {(currentExchange.status === 'pending' || currentExchange.status === 'processing') && (
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailVisible(false);
                    handleCancel(currentExchange);
                  }}
                >
                  取消兑换
                </Button>
              )}
            </Space>
          </>
        )}
      </Modal>
      
      {/* 发货弹窗 */}
      <Modal
        title="商品发货"
        open={shipModalVisible}
        onCancel={() => setShipModalVisible(false)}
        onOk={handleShip}
        width={600}
      >
        {currentExchange && (
          <>
            <Alert
              message="发货提示"
              description="请确认商品已准备完毕，填写物流信息后点击确认发货。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="兑换ID">{currentExchange.id}</Descriptions.Item>
              <Descriptions.Item label="用户名">{currentExchange.username}</Descriptions.Item>
              <Descriptions.Item label="商品名称" span={2}>{currentExchange.productName}</Descriptions.Item>
              <Descriptions.Item label="兑换数量">{currentExchange.quantity}</Descriptions.Item>
              <Descriptions.Item label="所需积分">{formatNumber(currentExchange.points * currentExchange.quantity)}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>{currentExchange.address}</Descriptions.Item>
              <Descriptions.Item label="联系人">{currentExchange.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentExchange.phone}</Descriptions.Item>
            </Descriptions>
            
            <Form form={shipForm} layout="vertical">
              <Form.Item
                name="logisticsCompany"
                label="物流公司"
                rules={[{ required: true, message: '请选择物流公司' }]}
              >
                <Select placeholder="请选择物流公司">
                  <Option value="顺丰速运">顺丰速运</Option>
                  <Option value="中通快递">中通快递</Option>
                  <Option value="圆通速递">圆通速递</Option>
                  <Option value="申通快递">申通快递</Option>
                  <Option value="韵达快递">韵达快递</Option>
                  <Option value="百世快递">百世快递</Option>
                  <Option value="邮政EMS">邮政EMS</Option>
                  <Option value="京东物流">京东物流</Option>
                  <Option value="德邦快递">德邦快递</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="trackingNumber"
                label="物流单号"
                rules={[{ required: true, message: '请输入物流单号' }]}
              >
                <Input placeholder="请输入物流单号" />
              </Form.Item>
              
              <Form.Item
                name="shipRemark"
                label="发货备注"
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入发货备注（选填）" 
                  maxLength={200}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PointsExchange;
 