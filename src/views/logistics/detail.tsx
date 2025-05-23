import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Descriptions, 
  Space, 
  Tag, 
  Spin, 
  Typography, 
  Divider,
  Row,
  Col,
  Modal,
  Form,
  Select,
  Input,
  message
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchLogisticsDetail, 
  updateLogisticsStatusAction,
  clearLogisticsDetail
} from '@/store/slices/logisticsSlice';
import { formatDateTime } from '@/utils/dateUtils';
import LogisticsTracks from './tracks';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LogisticsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { logisticsDetail, loading } = useSelector((state: RootState) => ({
    logisticsDetail: state.logistics.logisticsDetail,
    loading: state.logistics.loading.detail || state.logistics.loading.action
  }));
  
  // 本地状态
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    if (id) {
      dispatch(fetchLogisticsDetail(id));
    }
    
    // 组件卸载时清除物流详情
    return () => {
      dispatch(clearLogisticsDetail());
    };
  }, [dispatch, id]);
  
  // 获取物流状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <Tag color="orange">已创建</Tag>;
      case 'SHIPPING':
        return <Tag color="blue">运输中</Tag>;
      case 'DELIVERED':
        return <Tag color="green">已送达</Tag>;
      case 'EXCEPTION':
        return <Tag color="red">异常</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 更新物流状态
  const handleUpdateStatus = () => {
    form.resetFields();
    if (logisticsDetail) {
      form.setFieldsValue({
        status: logisticsDetail.status,
        remark: logisticsDetail.remark || ''
      });
    }
    setStatusModalVisible(true);
  };
  
  // 提交状态更新
  const handleSubmitStatus = async () => {
    try {
      const values = await form.validateFields();
      if (!id) return;
      
      await dispatch(updateLogisticsStatusAction({
        id,
        status: values.status,
        remark: values.remark
      })).unwrap();
      
      setStatusModalVisible(false);
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 返回列表
  const handleBack = () => {
    navigate('/logistics/list');
  };
  
  if (!logisticsDetail) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div className="logistics-detail-container">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>物流详情</Title>
          <Space>
            <Button onClick={handleBack}>返回列表</Button>
            <Button type="primary" onClick={handleUpdateStatus}>更新状态</Button>
          </Space>
        </div>
        
        <Spin spinning={loading}>
          <Descriptions title="基本信息" bordered column={2}>
            <Descriptions.Item label="物流ID">{logisticsDetail.id}</Descriptions.Item>
            <Descriptions.Item label="订单ID">{logisticsDetail.orderId}</Descriptions.Item>
            <Descriptions.Item label="物流单号">{logisticsDetail.trackingNo}</Descriptions.Item>
            <Descriptions.Item label="物流状态">{getStatusTag(logisticsDetail.status)}</Descriptions.Item>
            <Descriptions.Item label="物流公司" span={2}>
              {logisticsDetail.company ? `${logisticsDetail.company.name} (${logisticsDetail.company.code})` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="发货时间">
              {logisticsDetail.shippingTime ? formatDateTime(logisticsDetail.shippingTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="送达时间">
              {logisticsDetail.deliveryTime ? formatDateTime(logisticsDetail.deliveryTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDateTime(logisticsDetail.createTime)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatDateTime(logisticsDetail.updateTime)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {logisticsDetail.remark || '-'}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions title="发件人信息" bordered column={1}>
                <Descriptions.Item label="发件人">{logisticsDetail.senderName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{logisticsDetail.senderPhone}</Descriptions.Item>
                <Descriptions.Item label="发件地址">{logisticsDetail.senderAddress}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions title="收件人信息" bordered column={1}>
                <Descriptions.Item label="收件人">{logisticsDetail.receiverName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{logisticsDetail.receiverPhone}</Descriptions.Item>
                <Descriptions.Item label="收件地址">{logisticsDetail.receiverAddress}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          
          <Divider />
          
          {/* 物流轨迹组件 */}
          <LogisticsTracks logisticsId={logisticsDetail.id} />
        </Spin>
      </Card>
      
      {/* 更新状态弹窗 */}
      <Modal
        title="更新物流状态"
        open={statusModalVisible}
        onOk={handleSubmitStatus}
        onCancel={() => setStatusModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="物流状态"
            rules={[{ required: true, message: '请选择物流状态' }]}
          >
            <Select placeholder="选择物流状态">
              <Option value="CREATED">已创建</Option>
              <Option value="SHIPPING">运输中</Option>
              <Option value="DELIVERED">已送达</Option>
              <Option value="EXCEPTION">异常</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={4} placeholder="输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsDetail; 