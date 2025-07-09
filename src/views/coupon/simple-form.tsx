import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Radio, 
  InputNumber, 
  DatePicker, 
  message, 
  Space, 
  Typography,
  Divider,
  Row,
  Col
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const SimpleCouponForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      // 这里可以加载优惠券数据
      console.log('编辑模式，优惠券ID:', id);
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('表单数据:', values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(isEdit ? '更新成功' : '创建成功');
      navigate('/coupon/list');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/coupon/list');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? '编辑优惠券' : '新建优惠券'}
            </Title>
          </Space>
        </div>
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
            type: 'FIXED',
            value: 0,
            minSpend: 0,
            totalQuantity: 100,
            status: 'ACTIVE'
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="优惠券名称"
                rules={[{ required: true, message: '请输入优惠券名称' }]}
              >
                <Input placeholder="请输入优惠券名称" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="type"
                label="优惠券类型"
                rules={[{ required: true, message: '请选择优惠券类型' }]}
              >
                <Radio.Group>
                  <Radio value="FIXED">固定金额</Radio>
                  <Radio value="PERCENTAGE">折扣比例</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="value"
                label="优惠值"
                rules={[{ required: true, message: '请输入优惠值' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入优惠值"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="minSpend"
                label="最低消费金额"
                rules={[{ required: true, message: '请输入最低消费金额' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入最低消费金额"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="totalQuantity"
                label="发行总量"
                rules={[{ required: true, message: '请输入发行总量' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入发行总量"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Radio.Group>
                  <Radio value="ACTIVE">启用</Radio>
                  <Radio value="INACTIVE">禁用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="validDate"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                {isEdit ? '保存修改' : '创建优惠券'}
              </Button>
              <Button onClick={goBack} icon={<CloseOutlined />}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SimpleCouponForm;
