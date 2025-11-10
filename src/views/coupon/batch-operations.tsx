import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Space,
  Alert,
  Progress,
  Typography,
  Divider,
  List,
  Tag,
  message,
  Steps,
  Result,
  Checkbox
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { CouponData } from '@/api/coupon';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Step } = Steps;

interface BatchOperationsProps {
  visible: boolean;
  onCancel: () => void;
  selectedCoupons: CouponData[];
  onSuccess: () => void;
}

type OperationType = 'status' | 'delete' | 'send' | 'export' | 'edit';

const BatchOperations: React.FC<BatchOperationsProps> = ({
  visible,
  onCancel,
  selectedCoupons,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [operationType, setOperationType] = useState<OperationType>('status');
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });

  // 操作类型选项
  const operationOptions = [
    { value: 'status', label: '批量修改状态', icon: <EditOutlined /> },
    { value: 'delete', label: '批量删除', icon: <DeleteOutlined />, danger: true },
    { value: 'send', label: '批量发送', icon: <SendOutlined /> },
    { value: 'export', label: '批量导出', icon: <DownloadOutlined /> }
  ];

  // 状态选项
  const statusOptions = [
    { value: 'ACTIVE', label: '启用', color: 'green' },
    { value: 'INACTIVE', label: '禁用', color: 'red' },
    { value: 'EXPIRED', label: '过期', color: 'default' }
  ];

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });
    setProcessing(false);
  };

  // 关闭弹窗
  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // 下一步
  const nextStep = async () => {
    try {
      await form.validateFields();
      setCurrentStep(1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 上一步
  const prevStep = () => {
    setCurrentStep(0);
  };

  // 执行批量操作
  const executeBatchOperation = async () => {
    setProcessing(true);
    setCurrentStep(2);
    
    const values = form.getFieldsValue();
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < selectedCoupons.length; i++) {
        const coupon = selectedCoupons[i];
        
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 根据操作类型执行不同的操作
          switch (operationType) {
            case 'status':
              // 调用更新状态API
              console.log(`更新优惠券 ${coupon.id} 状态为 ${values.status}`);
              break;
            case 'delete':
              // 调用删除API
              console.log(`删除优惠券 ${coupon.id}`);
              break;
            case 'send':
              // 调用发送API
              console.log(`发送优惠券 ${coupon.id} 给用户`);
              break;
            case 'export':
              // 调用导出API
              console.log(`导出优惠券 ${coupon.id} 数据`);
              break;
          }
          
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`优惠券 "${coupon.name}" 操作失败: ${error}`);
        }
        
        // 更新进度
        setProgress(Math.round(((i + 1) / selectedCoupons.length) * 100));
        setResults({ success: successCount, failed: failedCount, errors });
      }
      
      message.success(`批量操作完成！成功 ${successCount} 个，失败 ${failedCount} 个`);
      
      if (successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      message.error('批量操作失败');
    } finally {
      setProcessing(false);
    }
  };

  // 渲染操作配置步骤
  const renderConfigStep = () => {
    return (
      <div>
        <Alert
          message="批量操作配置"
          description={`您选择了 ${selectedCoupons.length} 个优惠券进行批量操作`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="operationType"
            label="操作类型"
            rules={[{ required: true, message: '请选择操作类型' }]}
            initialValue={operationType}
          >
            <Select
              placeholder="请选择操作类型"
              onChange={setOperationType}
            >
              {operationOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    {option.icon}
                    <span style={{ color: option.danger ? '#ff4d4f' : undefined }}>
                      {option.label}
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {operationType === 'status' && (
            <Form.Item
              name="status"
              label="目标状态"
              rules={[{ required: true, message: '请选择目标状态' }]}
            >
              <Select placeholder="请选择目标状态">
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <Tag color={option.color}>{option.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {operationType === 'send' && (
            <>
              <Form.Item
                name="sendType"
                label="发送方式"
                rules={[{ required: true, message: '请选择发送方式' }]}
              >
                <Select placeholder="请选择发送方式">
                  <Option value="all">发送给所有用户</Option>
                  <Option value="specific">发送给指定用户</Option>
                  <Option value="group">发送给用户组</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="message"
                label="发送消息"
                rules={[{ required: true, message: '请输入发送消息' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入发送给用户的消息内容"
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </>
          )}

          {operationType === 'delete' && (
            <Alert
              message="危险操作"
              description="删除操作不可恢复，请确认您要删除选中的优惠券"
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      </div>
    );
  };

  // 渲染确认步骤
  const renderConfirmStep = () => {
    const values = form.getFieldsValue();
    const operationLabel = operationOptions.find(op => op.value === operationType)?.label;

    return (
      <div>
        <Alert
          message="确认批量操作"
          description="请仔细检查以下信息，确认无误后点击执行"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>操作信息</Title>
          <div style={{ padding: 16, background: '#fafafa', borderRadius: 6 }}>
            <p><strong>操作类型：</strong>{operationLabel}</p>
            {operationType === 'status' && (
              <p><strong>目标状态：</strong>
                <Tag color={statusOptions.find(s => s.value === values.status)?.color}>
                  {statusOptions.find(s => s.value === values.status)?.label}
                </Tag>
              </p>
            )}
            {operationType === 'send' && (
              <>
                <p><strong>发送方式：</strong>{values.sendType}</p>
                <p><strong>发送消息：</strong>{values.message}</p>
              </>
            )}
            <p><strong>影响数量：</strong>{selectedCoupons.length} 个优惠券</p>
          </div>
        </div>

        <div>
          <Title level={5}>优惠券列表</Title>
          <List
            size="small"
            bordered
            dataSource={selectedCoupons.slice(0, 10)}
            renderItem={(coupon) => (
              <List.Item>
                <Space>
                  <Text strong>{coupon.name}</Text>
                  <Tag>{coupon.type === 'FIXED' ? '固定金额' : '折扣比例'}</Tag>
                  <Tag color={coupon.status === 'ACTIVE' ? 'green' : 'default'}>
                    {coupon.status}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
          {selectedCoupons.length > 10 && (
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              还有 {selectedCoupons.length - 10} 个优惠券未显示...
            </Text>
          )}
        </div>
      </div>
    );
  };

  // 渲染执行步骤
  const renderExecuteStep = () => {
    if (processing) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <LoadingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>正在执行批量操作...</Title>
          <Progress percent={progress} style={{ marginBottom: 16 }} />
          <Text type="secondary">
            已处理 {Math.round((progress / 100) * selectedCoupons.length)} / {selectedCoupons.length} 个优惠券
          </Text>
        </div>
      );
    }

    return (
      <Result
        status={results.failed === 0 ? 'success' : 'warning'}
        title="批量操作完成"
        subTitle={`成功处理 ${results.success} 个优惠券，失败 ${results.failed} 个`}
        extra={[
          <Button type="primary" key="close" onClick={handleCancel}>
            关闭
          </Button>
        ]}
      >
        {results.errors.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: 24 }}>
            <Title level={5}>错误详情：</Title>
            <List
              size="small"
              dataSource={results.errors}
              renderItem={(error) => (
                <List.Item>
                  <Text type="danger">{error}</Text>
                </List.Item>
              )}
            />
          </div>
        )}
      </Result>
    );
  };

  return (
    <Modal
      title="批量操作"
      visible={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="配置操作" icon={<EditOutlined />} />
        <Step title="确认信息" icon={<ExclamationCircleOutlined />} />
        <Step title="执行操作" icon={<CheckCircleOutlined />} />
      </Steps>

      {currentStep === 0 && renderConfigStep()}
      {currentStep === 1 && renderConfirmStep()}
      {currentStep === 2 && renderExecuteStep()}

      {currentStep < 2 && (
        <>
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              {currentStep > 0 && (
                <Button onClick={prevStep}>上一步</Button>
              )}
              {currentStep === 0 && (
                <Button type="primary" onClick={nextStep}>
                  下一步
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" onClick={executeBatchOperation}>
                  执行操作
                </Button>
              )}
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
};

export default BatchOperations;
