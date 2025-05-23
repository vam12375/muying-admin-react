import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Input, Form, Row, Col, 
  Select, DatePicker, Modal, message, Tooltip, Badge, Statistic 
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, QuestionCircleOutlined, ExclamationCircleOutlined,
  DollarOutlined, BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getRefundList, getRefundStatistics, reviewRefund, processRefund } from '@/api/afterSale';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 类型定义
interface RefundData {
  refundId: number;
  refundNo: string;
  orderNo: string;
  orderId: number;
  userId: number;
  userName: string;
  status: string;
  statusName: string;
  amount: number;
  reason: string;
  description: string;
  images: string[];
  createTime: string;
  updateTime: string;
}

interface RefundStatistics {
  totalRefund: number;
  pendingReview: number;
  processing: number;
  completed: number;
  rejected: number;
  totalAmount: number;
}

const RefundList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RefundData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statistics, setStatistics] = useState<RefundStatistics>({
    totalRefund: 0,
    pendingReview: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [processModalVisible, setProcessModalVisible] = useState<boolean>(false);
  const [currentRefund, setCurrentRefund] = useState<RefundData | null>(null);
  const [reviewForm] = Form.useForm();
  const [processForm] = Form.useForm();

  // 状态标签颜色映射
  const statusColors = {
    'PENDING': 'gold',
    'APPROVED': 'blue',
    'REJECTED': 'red',
    'PROCESSING': 'processing',
    'COMPLETED': 'success',
    'FAILED': 'error',
    'CANCELLED': 'default',
  };

  // 表格列定义
  const columns: ColumnsType<RefundData> = [
    {
      title: '退款单号',
      dataIndex: 'refundNo',
      key: 'refundNo',
      ellipsis: true,
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      ellipsis: true,
    },
    {
      title: '用户信息',
      dataIndex: 'userId',
      key: 'userId',
      render: (_, record) => (
        <span>{record.userName || record.userId}</span>
      ),
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{ color: '#f50', fontWeight: 'bold' }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={statusColors[status] || 'default'}>
          {record.statusName || status}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            onClick={() => navigate(`/afterSale/detail/${record.refundId}`)}
          >
            详情
          </Button>
          
          {record.status === 'PENDING' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => showReviewModal(record)}
            >
              审核
            </Button>
          )}
          
          {record.status === 'APPROVED' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => showProcessModal(record)}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 获取退款申请列表
  const fetchRefundList = async (page = pagination.current, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      // 处理日期范围
      let startTime = '';
      let endTime = '';
      if (values.dateRange && values.dateRange.length === 2) {
        startTime = values.dateRange[0].format('YYYY-MM-DD');
        endTime = values.dateRange[1].format('YYYY-MM-DD');
      }
      
      const params = {
        page,
        size: pageSize,
        status: values.status,
        userId: values.userId,
        orderId: values.orderId,
        startTime,
        endTime,
      };
      
      const response = await getRefundList(params);
      
      if (response && response.data) {
        setData(response.data.records || []);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: response.data.total || 0,
        });
      }
    } catch (error) {
      console.error('获取退款列表失败:', error);
      message.error('获取退款列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取退款统计数据
  const fetchRefundStatistics = async () => {
    try {
      const values = form.getFieldsValue();
      
      // 处理日期范围
      let startTime = '';
      let endTime = '';
      if (values.dateRange && values.dateRange.length === 2) {
        startTime = values.dateRange[0].format('YYYY-MM-DD');
        endTime = values.dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await getRefundStatistics(startTime, endTime);
      
      if (response && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取退款统计数据失败:', error);
      message.error('获取退款统计数据失败');
    }
  };

  // 处理表格变更
  const handleTableChange = (newPagination: any) => {
    fetchRefundList(newPagination.current, newPagination.pageSize);
  };

  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchRefundList(1, pagination.pageSize);
    fetchRefundStatistics();
  };

  // 重置搜索表单
  const handleReset = () => {
    form.resetFields();
    setPagination({ ...pagination, current: 1 });
    fetchRefundList(1, pagination.pageSize);
    fetchRefundStatistics();
  };

  // 显示审核模态框
  const showReviewModal = (record: RefundData) => {
    setCurrentRefund(record);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  // 显示处理模态框
  const showProcessModal = (record: RefundData) => {
    setCurrentRefund(record);
    processForm.resetFields();
    setProcessModalVisible(true);
  };

  // 提交审核
  const handleReviewSubmit = async () => {
    try {
      if (!currentRefund) return;
      
      const values = await reviewForm.validateFields();
      const { approved, rejectReason } = values;
      
      // 如果拒绝但没有原因，则提示错误
      if (!approved && !rejectReason) {
        message.error('请填写拒绝原因');
        return;
      }
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await reviewRefund(
        currentRefund.refundId,
        approved,
        adminId,
        adminName,
        rejectReason
      );
      
      if (response && response.code === 200) {
        message.success(approved ? '退款申请已批准' : '退款申请已拒绝');
        setReviewModalVisible(false);
        fetchRefundList();
        fetchRefundStatistics();
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      message.error('审核失败，请重试');
    }
  };

  // 提交处理
  const handleProcessSubmit = async () => {
    try {
      if (!currentRefund) return;
      
      const values = await processForm.validateFields();
      const { refundChannel, refundAccount } = values;
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await processRefund(
        currentRefund.refundId,
        refundChannel,
        adminId,
        adminName,
        refundAccount
      );
      
      if (response && response.code === 200) {
        message.success('退款处理已开始');
        setProcessModalVisible(false);
        fetchRefundList();
        fetchRefundStatistics();
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      console.error('处理失败:', error);
      message.error('处理失败，请重试');
    }
  };

  // 初始加载
  useEffect(() => {
    fetchRefundList();
    fetchRefundStatistics();
  }, []);

  return (
    <div className="refund-list-page">
      <div className="statistics-cards">
        <Row gutter={16}>
          <Col span={4}>
            <Card>
              <Statistic
                title="退款总数"
                value={statistics.totalRefund}
                prefix={<QuestionCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="待审核"
                value={statistics.pendingReview}
                valueStyle={{ color: '#faad14' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="处理中"
                value={statistics.processing}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ReloadOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已完成"
                value={statistics.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已拒绝"
                value={statistics.rejected}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="退款总额"
                value={statistics.totalAmount}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix="¥"
                suffix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Card 
        title="退款申请列表" 
        className="main-card"
        style={{ marginTop: '16px' }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="orderId" label="订单号">
                <Input placeholder="请输入订单号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="userId" label="用户ID">
                <Input placeholder="请输入用户ID" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="PENDING">待审核</Option>
                  <Option value="APPROVED">已批准</Option>
                  <Option value="REJECTED">已拒绝</Option>
                  <Option value="PROCESSING">处理中</Option>
                  <Option value="COMPLETED">已完成</Option>
                  <Option value="FAILED">失败</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateRange" label="申请时间">
                <RangePicker />
              </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          rowKey="refundId"
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      {/* 审核模态框 */}
      <Modal
        title="审核退款申请"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReviewSubmit}
        >
          <Form.Item
            name="approved"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择审核结果">
              <Option value={true}>批准</Option>
              <Option value={false}>拒绝</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.approved !== currentValues.approved}
          >
            {({ getFieldValue }) => 
              getFieldValue('approved') === false && (
                <Form.Item
                  name="rejectReason"
                  label="拒绝原因"
                  rules={[{ required: true, message: '请填写拒绝原因' }]}
                >
                  <Input.TextArea rows={4} placeholder="请输入拒绝原因" />
                </Form.Item>
              )
            }
          </Form.Item>
          
          <Form.Item style={{ marginTop: '16px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 处理模态框 */}
      <Modal
        title="处理退款"
        open={processModalVisible}
        onCancel={() => setProcessModalVisible(false)}
        footer={null}
      >
        <Form
          form={processForm}
          layout="vertical"
          onFinish={handleProcessSubmit}
        >
          <Form.Item
            name="refundChannel"
            label="退款渠道"
            rules={[{ required: true, message: '请选择退款渠道' }]}
          >
            <Select placeholder="请选择退款渠道">
              <Option value="ALIPAY">支付宝</Option>
              <Option value="WECHAT">微信支付</Option>
              <Option value="BANK_TRANSFER">银行转账</Option>
              <Option value="WALLET">账户余额</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.refundChannel !== currentValues.refundChannel}
          >
            {({ getFieldValue }) => 
              getFieldValue('refundChannel') === 'BANK_TRANSFER' && (
                <Form.Item
                  name="refundAccount"
                  label="退款账户"
                  rules={[{ required: true, message: '请填写退款账户信息' }]}
                >
                  <Input.TextArea rows={4} placeholder="请输入完整的退款账户信息，包括开户行、账号、姓名等" />
                </Form.Item>
              )
            }
          </Form.Item>
          
          <Form.Item style={{ marginTop: '16px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setProcessModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefundList; 