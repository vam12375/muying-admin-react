import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Input, Form, Row, Col, 
  Select, DatePicker, Modal, message, Tooltip, Badge, Statistic,
  Upload
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, QuestionCircleOutlined, ExclamationCircleOutlined,
  DollarOutlined, BankOutlined, PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getRefundList, getRefundStatistics, reviewRefund, processRefund, completeRefund } from '@/api/afterSale';
import { translateRefundReason } from '@/utils/refundUtils';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 类型定义
interface RefundData {
  id?: number;         // 后端返回的主键ID
  refundId?: number;   // 前端使用的退款ID
  refundNo: string;
  orderNo: string;
  orderId: number;
  userId: number;
  userName: string;
  status: string;
  statusName: string;
  amount: number;
  refundReason: string;
  refundReasonDetail: string;
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

// API响应类型定义
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success?: boolean;
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
  const [completeModalVisible, setCompleteModalVisible] = useState<boolean>(false);
  const [batchCompleteModalVisible, setBatchCompleteModalVisible] = useState<boolean>(false);
  const [currentRefund, setCurrentRefund] = useState<RefundData | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRefunds, setSelectedRefunds] = useState<RefundData[]>([]);
  const [reviewForm] = Form.useForm();
  const [processForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [batchCompleteForm] = Form.useForm();

  // 状态标签颜色映射
  const statusColors: Record<string, string> = {
    'PENDING': 'gold',
    'APPROVED': 'blue',
    'REJECTED': 'red',
    'PROCESSING': 'processing',
    'COMPLETED': 'success',
    'FAILED': 'error',
    'CANCELLED': 'default',
  };

  // 状态中文映射
  const statusNameMap: Record<string, string> = {
    'PENDING': '待审核',
    'APPROVED': '已审核',
    'REJECTED': '已拒绝',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成',
    'FAILED': '退款失败',
    'CANCELLED': '已取消',
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
      dataIndex: 'refundReason',
      key: 'refundReason',
      ellipsis: true,
      render: (reason: string) => translateRefundReason(reason),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={status && statusColors[status] ? statusColors[status] : 'default'}>
          {statusNameMap[status] || status}
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
            onClick={() => navigate(`/afterSale/detail/${record.id}`)}
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
          
          {record.status === 'PROCESSING' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => showCompleteModal(record)}
            >
              完成退款
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
        status: values.status || '', // 确保传递空字符串而非undefined
        userId: values.userId || null,
        orderId: values.orderId || null,
        startTime,
        endTime,
      };
      
      console.log('Fetching refund list with params:', params);
      const response = await getRefundList(params);
      
      if (response && response.data) {
        console.log('Refund list response:', response.data);
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
        // 映射后端字段到前端字段
        const backendData = response.data;
        const mappedStatistics = {
          totalRefund: (backendData.pendingCount || 0) + (backendData.approvedCount || 0) + 
                      (backendData.processingCount || 0) + (backendData.completedCount || 0) + 
                      (backendData.rejectedCount || 0) + (backendData.failedCount || 0),
          pendingReview: backendData.pendingCount || 0,
          processing: backendData.processingCount || 0,
          completed: backendData.completedCount || 0,
          rejected: backendData.rejectedCount || 0,
          totalAmount: backendData.totalAmount || 0,
        };
        setStatistics(mappedStatistics);
        console.log('退款统计数据:', mappedStatistics);
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
    console.log('打开审核模态框, 当前记录:', record);
    // 确保record中有id字段，如果没有但有refundId字段，使用refundId
    if (!record.id && record.refundId) {
      record.id = record.refundId;
    }
    // 如果既没有id也没有refundId，记录错误
    if (!record.id) {
      console.error('退款ID不存在:', record);
      message.error('退款ID不存在');
      return;
    }
    setCurrentRefund(record);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  // 显示处理模态框
  const showProcessModal = (record: RefundData) => {
    // 确保record中有id字段，如果没有但有refundId字段，使用refundId
    if (!record.id && record.refundId) {
      record.id = record.refundId;
    }
    // 如果既没有id也没有refundId，记录错误
    if (!record.id) {
      console.error('退款ID不存在:', record);
      message.error('退款ID不存在');
      return;
    }
    setCurrentRefund(record);
    processForm.resetFields();
    setProcessModalVisible(true);
  };

  // 显示完成退款模态框
  const showCompleteModal = (record: RefundData) => {
    // 确保record中有id字段，如果没有但有refundId字段，使用refundId
    if (!record.id && record.refundId) {
      record.id = record.refundId;
    }
    // 如果既没有id也没有refundId，记录错误
    if (!record.id) {
      console.error('退款ID不存在:', record);
      message.error('退款ID不存在');
      return;
    }
    setCurrentRefund(record);
    completeForm.resetFields();
    setCompleteModalVisible(true);
  };

  // 提交审核
  const handleReviewSubmit = async () => {
    try {
      if (!currentRefund) {
        console.error('未找到当前退款记录');
        message.error('未找到退款记录');
        return;
      }
      
      const values = await reviewForm.validateFields();
      const { approved, rejectReason } = values;
      
      // 如果拒绝但没有原因，则提示错误
      if (!approved && !rejectReason) {
        message.error('请填写拒绝原因');
        return;
      }
      
      // 确保id存在且有效
      const refundId = currentRefund.id || currentRefund.refundId;
      if (!refundId) {
        console.error('退款ID不存在:', currentRefund);
        message.error('退款ID不存在');
        return;
      }
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      console.log('审核参数:', {
        refundId,
        approved,
        adminId,
        adminName,
        rejectReason
      });
      
      const response = await reviewRefund(
        refundId,
        approved,
        adminId,
        adminName,
        rejectReason
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success(approved ? '退款申请已批准' : '退款申请已拒绝');
        setReviewModalVisible(false);
        fetchRefundList();
        fetchRefundStatistics();
      } else {
        message.error(response?.data?.message || '操作失败');
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
      
      // 确保id存在且有效
      const refundId = currentRefund.id || currentRefund.refundId;
      if (!refundId) {
        console.error('退款ID不存在:', currentRefund);
        message.error('退款ID不存在');
        return;
      }
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await processRefund(
        refundId,
        refundChannel,
        adminId,
        adminName,
        refundAccount
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success('退款处理已开始');
        setProcessModalVisible(false);
        fetchRefundList();
        fetchRefundStatistics();
      } else {
        message.error(response?.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('处理失败:', error);
      message.error('处理失败，请重试');
    }
  };

  // 提交完成退款
  const handleCompleteSubmit = async () => {
    try {
      if (!currentRefund) {
        console.error('未找到当前退款记录');
        message.error('未找到退款记录');
        return;
      }
      
      const values = await completeForm.validateFields();
      const { transactionId } = values;
      
      // 确保id存在且有效
      const refundId = currentRefund.id || currentRefund.refundId;
      if (!refundId) {
        console.error('退款ID不存在:', currentRefund);
        message.error('退款ID不存在');
        return;
      }
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      // 调用API
      const response = await completeRefund(
        refundId,
        transactionId,
        adminId,
        adminName
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success('退款已完成');
        setCompleteModalVisible(false);
        fetchRefundList();
        fetchRefundStatistics();
      } else {
        message.error(response?.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('完成退款失败:', error);
      message.error('完成退款失败，请重试');
    }
  };

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: RefundData[]) => {
    console.log('选中的行:', selectedRows);
    // 只保留状态为PROCESSING的记录
    const filteredRows = selectedRows.filter(row => row.status === 'PROCESSING');
    // 使用与rowKey一致的key生成逻辑
    const filteredKeys = filteredRows.map(row => 
      row.refundId ? row.refundId.toString() : (row.id ? row.id.toString() : '')
    ).filter(key => key !== '');
    
    setSelectedRowKeys(filteredKeys);
    setSelectedRefunds(filteredRows);
  };

  // 生成统一的rowKey
  const getRowKey = (record: RefundData): string => {
    return record.refundId ? record.refundId.toString() : 
           record.id ? record.id.toString() : 
           `temp-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: RefundData) => ({
      disabled: record.status !== 'PROCESSING', // 只有处理中状态才能选择
      name: record.refundNo,
    }),
    onSelect: (record: RefundData, selected: boolean) => {
      console.log(`${selected ? '选择' : '取消选择'} 记录:`, record);
    },
    onSelectAll: (selected: boolean, selectedRows: RefundData[], changeRows: RefundData[]) => {
      console.log(`${selected ? '全选' : '取消全选'}`, selectedRows, changeRows);
    },
  };

  // 显示批量完成模态框
  const showBatchCompleteModal = () => {
    if (selectedRefunds.length === 0) {
      message.warning('请选择需要完成的退款记录');
      return;
    }
    batchCompleteForm.resetFields();
    setBatchCompleteModalVisible(true);
  };

  // 批量完成退款提交
  const handleBatchCompleteSubmit = async () => {
    try {
      if (selectedRefunds.length === 0) {
        message.warning('请选择需要完成的退款记录');
        return;
      }
      
      const values = await batchCompleteForm.validateFields();
      const { transactionId } = values;
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      // 逐个处理选中的退款
      let successCount = 0;
      let failCount = 0;
      
      for (const refund of selectedRefunds) {
        const refundId = refund.id || refund.refundId;
        if (!refundId) {
          console.error('退款ID不存在:', refund);
          failCount++;
          continue;
        }
        
        try {
          // 调用API
          const response = await completeRefund(
            refundId,
            transactionId,
            adminId,
            adminName
          );
          
          if (response && response.data && response.data.code === 200) {
            successCount++;
          } else {
            failCount++;
            console.error('批量完成退款失败:', response?.data?.message);
          }
        } catch (error) {
          failCount++;
          console.error('批量完成退款异常:', error);
        }
      }
      
      if (successCount > 0) {
        message.success(`成功完成${successCount}条退款记录`);
      }
      
      if (failCount > 0) {
        message.error(`${failCount}条退款记录处理失败`);
      }
      
      setBatchCompleteModalVisible(false);
      setSelectedRowKeys([]);
      setSelectedRefunds([]);
      fetchRefundList();
      fetchRefundStatistics();
    } catch (error) {
      console.error('批量完成退款失败:', error);
      message.error('批量完成退款失败，请重试');
    }
  };

  // 初始加载和定时刷新
  useEffect(() => {
    // 首次加载
    fetchRefundList();
    fetchRefundStatistics();
    
    // 设置定时刷新 - 每30秒刷新一次数据
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing refund list...');
      fetchRefundList(pagination.current, pagination.pageSize);
      fetchRefundStatistics();
    }, 30000);
    
    // 清理定时器
    return () => {
      clearInterval(refreshInterval);
    };
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

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {selectedRowKeys.length > 0 && (
              <Space>
                <span>已选择 {selectedRowKeys.length} 项</span>
                <Button 
                  type="primary" 
                  onClick={showBatchCompleteModal}
                  disabled={selectedRefunds.length === 0}
                >
                  批量完成退款
                </Button>
                <Button onClick={() => { setSelectedRowKeys([]); setSelectedRefunds([]); }}>
                  取消选择
                </Button>
              </Space>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          rowKey={getRowKey}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => {
              console.log('点击行:', record);
            }
          })}
          rowSelection={rowSelection}
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

      {/* 完成退款模态框 */}
      <Modal
        title="完成退款"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        footer={null}
      >
        <Form
          form={completeForm}
          layout="vertical"
          onFinish={handleCompleteSubmit}
        >
          <Form.Item
            name="transactionId"
            label="交易ID"
            rules={[{ required: true, message: '请输入交易ID' }]}
          >
            <Input placeholder="请输入支付宝交易号或其他交易凭证ID" />
          </Form.Item>
          
          <Form.Item
            name="evidenceFile"
            label="上传凭证"
            extra="支持JPG、PNG格式，大小不超过2MB"
          >
            <Upload
              name="file"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // 阻止自动上传
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息（可选）" />
          </Form.Item>
          
          <Form.Item style={{ marginTop: '16px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCompleteModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量完成模态框 */}
      <Modal
        title="批量完成退款"
        open={batchCompleteModalVisible}
        onCancel={() => setBatchCompleteModalVisible(false)}
        footer={null}
      >
        <Form
          form={batchCompleteForm}
          layout="vertical"
          onFinish={handleBatchCompleteSubmit}
        >
          <Form.Item
            name="transactionId"
            label="交易ID"
            rules={[{ required: true, message: '请输入交易ID' }]}
          >
            <Input placeholder="请输入支付宝交易号或其他交易凭证ID" />
          </Form.Item>
          
          <Form.Item style={{ marginTop: '16px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBatchCompleteModalVisible(false)}>
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