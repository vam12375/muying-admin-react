import React, { useState, useEffect } from 'react';
import { 
  Card, Descriptions, Button, Space, Tag, Steps, Divider, Row, Col, 
  Image, Timeline, Modal, Form, Input, Select, message, Result 
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  DollarOutlined, SyncOutlined, ExclamationCircleOutlined, 
  LoadingOutlined, BankOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getRefundDetail, reviewRefund, processRefund, 
  completeRefund, failRefund 
} from '@/api/afterSale';
import dayjs from 'dayjs';

const { Step } = Steps;
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
  refundReason: string;
  refundReasonDetail: string;
  images: string[];
  createTime: string;
  updateTime: string;
  refundLogs?: RefundLog[];
}

interface RefundLog {
  id: number;
  refundId: number;
  refundNo: string;
  oldStatus: string;
  newStatus: string;
  operatorType: string;
  operatorId: number;
  operatorName: string;
  comment: string;
  createTime: string;
}

const RefundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refund, setRefund] = useState<RefundData | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [processModalVisible, setProcessModalVisible] = useState<boolean>(false);
  const [completeModalVisible, setCompleteModalVisible] = useState<boolean>(false);
  const [failModalVisible, setFailModalVisible] = useState<boolean>(false);
  
  const [reviewForm] = Form.useForm();
  const [processForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [failForm] = Form.useForm();

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

  // 状态中文映射
  const statusNameMap = {
    'PENDING': '待审核',
    'APPROVED': '已审核',
    'REJECTED': '已拒绝',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成',
    'FAILED': '退款失败',
    'CANCELLED': '已取消',
  };

  // 获取退款详情
  const fetchRefundDetail = async () => {
    if (!id) {
      console.error('缺少退款ID参数');
      message.error('缺少退款ID参数');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getRefundDetail(id);
      console.log('获取退款详情响应:', response);
      
      if (response && response.data && response.data.data) {
        setRefund(response.data.data);
      } else if (response && response.data) {
        // 兼容直接返回数据的情况
        setRefund(response.data);
      } else {
        console.error('获取退款详情失败：响应数据为空');
        message.error('获取退款详情失败：数据为空');
      }
    } catch (error) {
      console.error('获取退款详情失败:', error);
      message.error('获取退款详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理返回列表
  const handleBack = () => {
    navigate('/afterSale/list');
  };

  // 显示审核模态框
  const showReviewModal = () => {
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  // 显示处理模态框
  const showProcessModal = () => {
    processForm.resetFields();
    setProcessModalVisible(true);
  };

  // 显示完成模态框
  const showCompleteModal = () => {
    completeForm.resetFields();
    setCompleteModalVisible(true);
  };

  // 显示失败模态框
  const showFailModal = () => {
    failForm.resetFields();
    setFailModalVisible(true);
  };

  // 提交审核
  const handleReviewSubmit = async () => {
    try {
      if (!refund) return;
      
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
        refund.refundId || refund.id,
        approved,
        adminId,
        adminName,
        rejectReason
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success(approved ? '退款申请已批准' : '退款申请已拒绝');
        setReviewModalVisible(false);
        fetchRefundDetail();
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
      if (!refund) return;
      
      const values = await processForm.validateFields();
      const { refundChannel, refundAccount } = values;
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await processRefund(
        refund.refundId || refund.id,
        refundChannel,
        adminId,
        adminName,
        refundAccount
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success('退款处理已开始');
        setProcessModalVisible(false);
        fetchRefundDetail();
      } else {
        message.error(response?.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('处理失败:', error);
      message.error('处理失败，请重试');
    }
  };

  // 提交完成
  const handleCompleteSubmit = async () => {
    try {
      if (!refund) return;
      
      const values = await completeForm.validateFields();
      const { transactionId } = values;
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await completeRefund(
        refund.refundId || refund.id,
        transactionId,
        adminId,
        adminName
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success('退款已完成');
        setCompleteModalVisible(false);
        fetchRefundDetail();
      } else {
        message.error(response?.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('完成失败:', error);
      message.error('完成失败，请重试');
    }
  };

  // 提交失败
  const handleFailSubmit = async () => {
    try {
      if (!refund) return;
      
      const values = await failForm.validateFields();
      const { reason } = values;
      
      // 模拟管理员信息，实际项目中应从全局状态获取
      const adminId = 1;
      const adminName = 'admin';
      
      const response = await failRefund(
        refund.refundId || refund.id,
        reason,
        adminId,
        adminName
      );
      
      if (response && response.data && response.data.code === 200) {
        message.success('退款已标记为失败');
        setFailModalVisible(false);
        fetchRefundDetail();
      } else {
        message.error(response?.data?.message || '操作失败');
      }
    } catch (error) {
      console.error('标记失败错误:', error);
      message.error('操作失败，请重试');
    }
  };

  // 获取当前步骤
  const getCurrentStep = (status: string) => {
    const statusMap: { [key: string]: number } = {
      'PENDING': 0,
      'APPROVED': 1,
      'REJECTED': 1,
      'PROCESSING': 2,
      'COMPLETED': 3,
      'FAILED': 3,
    };
    return statusMap[status] || 0;
  };

  // 初始加载
  useEffect(() => {
    fetchRefundDetail();
  }, [id]);

  // 如果正在加载或退款数据为空，显示加载状态
  if (loading || !refund) {
    return (
      <Card loading={loading} title="退款详情">
        {!loading && !refund && (
          <Result
            status="404"
            title="未找到退款信息"
            subTitle="找不到该退款记录或者已被删除"
            extra={<Button type="primary" onClick={handleBack}>返回列表</Button>}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="refund-detail-page">
      <Card 
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回</Button>
            <span>退款详情</span>
          </Space>
        }
        extra={
          <Space>
            {refund.status === 'PENDING' && (
              <Button type="primary" onClick={showReviewModal}>审核</Button>
            )}
            {refund.status === 'APPROVED' && (
              <Button type="primary" onClick={showProcessModal}>处理</Button>
            )}
            {refund.status === 'PROCESSING' && (
              <>
                <Button type="primary" onClick={showCompleteModal}>完成退款</Button>
                <Button danger onClick={showFailModal}>标记失败</Button>
              </>
            )}
          </Space>
        }
      >
        <Row gutter={24}>
          <Col span={24}>
            <Steps current={getCurrentStep(refund.status)}>
              <Step title="申请中" description="用户已提交退款申请" icon={<ExclamationCircleOutlined />} />
              <Step 
                title={refund.status === 'REJECTED' ? '已拒绝' : '已审核'} 
                description={refund.status === 'REJECTED' ? '申请被拒绝' : '管理员已审核'} 
                icon={refund.status === 'REJECTED' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                status={refund.status === 'REJECTED' ? 'error' : undefined}
              />
              <Step 
                title="处理中" 
                description="正在执行退款" 
                icon={<SyncOutlined spin={refund.status === 'PROCESSING'} />} 
              />
              <Step 
                title={refund.status === 'FAILED' ? '退款失败' : '退款完成'} 
                description={refund.status === 'FAILED' ? '退款过程出错' : '退款已完成'} 
                icon={refund.status === 'FAILED' ? <CloseCircleOutlined /> : <DollarOutlined />}
                status={refund.status === 'FAILED' ? 'error' : undefined}
              />
            </Steps>
          </Col>
        </Row>

        <Divider />

        <Row gutter={24}>
          <Col span={16}>
            <Card title="退款信息" bordered={undefined}>
              <Descriptions column={2}>
                <Descriptions.Item label="退款单号">{refund.refundNo}</Descriptions.Item>
                <Descriptions.Item label="关联订单号">{refund.orderNo}</Descriptions.Item>
                <Descriptions.Item label="退款金额">
                  <span style={{ color: '#f50', fontWeight: 'bold' }}>
                    ¥{refund.amount.toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="退款状态">
                  <Tag color={statusColors[refund.status] || 'default'}>
                    {statusNameMap[refund.status] || refund.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请时间" span={2}>
                  {dayjs(refund.createTime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="申请原因" span={2}>
                  {refund.refundReason}
                </Descriptions.Item>
                <Descriptions.Item label="详细说明" span={2}>
                  {refund.refundReasonDetail || '无'}
                </Descriptions.Item>
              </Descriptions>

              {refund.images && refund.images.length > 0 && (
                <>
                  <Divider orientation="left">退款凭证</Divider>
                  <div className="refund-images">
                    <Image.PreviewGroup>
                      {refund.images.map((image, index) => (
                        <Image
                          key={index}
                          width={100}
                          height={100}
                          style={{ marginRight: '8px', objectFit: 'cover' }}
                          src={image}
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
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

      {/* 失败模态框 */}
      <Modal
        title="标记退款失败"
        open={failModalVisible}
        onCancel={() => setFailModalVisible(false)}
        footer={null}
      >
        <Form
          form={failForm}
          layout="vertical"
          onFinish={handleFailSubmit}
        >
          <Form.Item
            name="reason"
            label="失败原因"
            rules={[{ required: true, message: '请填写失败原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入退款失败的具体原因" />
          </Form.Item>
          
          <Form.Item style={{ marginTop: '16px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setFailModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" danger>
                确认标记失败
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefundDetail;
 