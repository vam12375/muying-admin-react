import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Modal, 
  message, 
  Typography,
  InputNumber,
  Select,
  Switch
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { fetchPointsRuleList } from '@/store/slices/pointsSlice';
import { 
  createPointsRule, 
  updatePointsRule, 
  deletePointsRule 
} from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义积分规则数据类型
interface PointsRuleData {
  id: number;
  name: string;
  description: string;
  type: string;
  points: number;
  condition: any;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

const PointsRule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { ruleList, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加规则');
  const [currentRule, setCurrentRule] = useState<PointsRuleData | null>(null);
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchRules();
  }, [dispatch]);
  
  // 获取规则列表
  const fetchRules = () => {
    dispatch(fetchPointsRuleList({}));
  };
  
  // 添加规则
  const handleAdd = () => {
    setModalTitle('添加规则');
    setCurrentRule(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      type: 'sign_in'
    });
    setModalVisible(true);
  };
  
  // 编辑规则
  const handleEdit = (record: PointsRuleData) => {
    setModalTitle('编辑规则');
    setCurrentRule(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      type: record.type,
      points: record.points,
      ...record.condition,
      enabled: record.enabled
    });
    setModalVisible(true);
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      // 构建提交数据
      const submitData = {
        name: values.name,
        description: values.description,
        type: values.type,
        points: values.points,
        enabled: values.enabled,
        condition: {}
      };
      
      // 根据不同类型设置条件
      switch (values.type) {
        case 'sign_in':
          submitData.condition = {
            consecutive: values.consecutive || false
          };
          break;
        case 'order_complete':
          submitData.condition = {
            minAmount: values.minAmount || 0
          };
          break;
        case 'product_review':
          submitData.condition = {
            withImage: values.withImage || false
          };
          break;
        case 'profile_complete':
          submitData.condition = {
            fields: values.fields || []
          };
          break;
        default:
          break;
      }
      
      try {
        if (currentRule) {
          // 更新
          await updatePointsRule(currentRule.id, submitData);
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await createPointsRule(submitData);
          hide();
          message.success('添加成功');
        }
        
        setModalVisible(false);
        fetchRules();
      } catch (error) {
        hide();
        message.error('操作失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 删除规则
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此规则吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除...', 0);
        try {
          await deletePointsRule(id);
          hide();
          message.success('删除成功');
          fetchRules();
        } catch (error) {
          hide();
          message.error('删除失败');
        }
      }
    });
  };
  
  // 切换启用状态
  const toggleEnabled = async (record: PointsRuleData) => {
    const hide = message.loading('正在更新...', 0);
    try {
      await updatePointsRule(record.id, {
        enabled: !record.enabled
      });
      hide();
      message.success('状态更新成功');
      fetchRules();
    } catch (error) {
      hide();
      message.error('状态更新失败');
    }
  };
  
  // 获取规则类型文本
  const getRuleTypeText = (type: string) => {
    switch (type) {
      case 'sign_in':
        return '签到';
      case 'order_complete':
        return '完成订单';
      case 'product_review':
        return '商品评价';
      case 'profile_complete':
        return '完善资料';
      case 'invite_user':
        return '邀请用户';
      default:
        return type;
    }
  };
  
  // 获取规则条件描述
  const getRuleConditionText = (record: PointsRuleData) => {
    const { type, condition } = record;
    
    switch (type) {
      case 'sign_in':
        return condition.consecutive ? '连续签到' : '每日签到';
      case 'order_complete':
        return `订单金额 ≥ ${condition.minAmount || 0}元`;
      case 'product_review':
        return condition.withImage ? '带图评价' : '文字评价';
      case 'profile_complete':
        return `完善字段: ${condition.fields?.join(', ') || '全部'}`;
      case 'invite_user':
        return '邀请新用户注册';
      default:
        return JSON.stringify(condition);
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<PointsRuleData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: '规则类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getRuleTypeText(type)
    },
    {
      title: '积分值',
      dataIndex: 'points',
      key: 'points',
      width: 100
    },
    {
      title: '规则条件',
      key: 'condition',
      width: 150,
      render: (_, record) => getRuleConditionText(record)
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled, record) => (
        <Switch 
          checked={enabled} 
          onChange={() => toggleEnabled(record)} 
        />
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
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  
  // 根据规则类型渲染不同的表单项
  const renderConditionFormItems = () => {
    const ruleType = form.getFieldValue('type');
    
    switch (ruleType) {
      case 'sign_in':
        return (
          <Form.Item
            name="consecutive"
            label="连续签到"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        );
      case 'order_complete':
        return (
          <Form.Item
            name="minAmount"
            label="最低订单金额"
            rules={[{ required: true, message: '请输入最低订单金额' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              precision={2} 
              placeholder="最低订单金额" 
            />
          </Form.Item>
        );
      case 'product_review':
        return (
          <Form.Item
            name="withImage"
            label="带图评价"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        );
      case 'profile_complete':
        return (
          <Form.Item
            name="fields"
            label="需完善字段"
          >
            <Select
              mode="multiple"
              placeholder="请选择需要完善的字段"
              style={{ width: '100%' }}
            >
              <Option value="avatar">头像</Option>
              <Option value="nickname">昵称</Option>
              <Option value="birthday">生日</Option>
              <Option value="gender">性别</Option>
              <Option value="address">地址</Option>
              <Option value="phone">手机号</Option>
              <Option value="email">邮箱</Option>
            </Select>
          </Form.Item>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="points-rule-container">
      <Title level={2}>积分规则管理</Title>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加规则
          </Button>
        </div>
        
        <Table<PointsRuleData>
          columns={columns}
          dataSource={ruleList}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* 添加/编辑规则对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[
              { required: true, message: '请输入规则名称' },
              { max: 50, message: '规则名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="规则描述"
            rules={[
              { max: 200, message: '规则描述不能超过200个字符' }
            ]}
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
          <Form.Item
            name="type"
            label="规则类型"
            rules={[{ required: true, message: '请选择规则类型' }]}
          >
            <Select placeholder="请选择规则类型">
              <Option value="sign_in">签到</Option>
              <Option value="order_complete">完成订单</Option>
              <Option value="product_review">商品评价</Option>
              <Option value="profile_complete">完善资料</Option>
              <Option value="invite_user">邀请用户</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="points"
            label="积分值"
            rules={[
              { required: true, message: '请输入积分值' },
              { type: 'number', min: 1, message: '积分值必须大于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={1} 
              placeholder="请输入积分值" 
            />
          </Form.Item>
          
          {/* 根据规则类型渲染不同的表单项 */}
          <Form.Item noStyle dependencies={['type']}>
            {() => renderConditionFormItems()}
          </Form.Item>
          
          <Form.Item
            name="enabled"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsRule; 