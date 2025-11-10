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
  Switch,
  InputNumber,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponRuleList } from '@/store/slices/couponSlice';
import { 
  createCouponRule, 
  updateCouponRule,
  deleteCouponRule
} from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义优惠券规则数据类型
interface CouponRuleData {
  id: number;
  name: string;
  description: string;
  type: string;
  condition: any;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

const CouponRule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { ruleList, loading } = useSelector((state: RootState) => state.coupon);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加规则');
  const [currentRule, setCurrentRule] = useState<CouponRuleData | null>(null);
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchRules();
  }, [dispatch]);
  
  // 获取规则列表
  const fetchRules = () => {
    dispatch(fetchCouponRuleList({}));
  };
  
  // 添加规则
  const handleAdd = () => {
    setModalTitle('添加规则');
    setCurrentRule(null);
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      type: 'product_category'
    });
    setModalVisible(true);
  };
  
  // 编辑规则
  const handleEdit = (record: CouponRuleData) => {
    setModalTitle('编辑规则');
    setCurrentRule(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      type: record.type,
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
        enabled: values.enabled,
        condition: {}
      };
      
      // 根据不同类型设置条件
      switch (values.type) {
        case 'product_category':
          submitData.condition = {
            categoryIds: values.categoryIds
          };
          break;
        case 'product_brand':
          submitData.condition = {
            brandIds: values.brandIds
          };
          break;
        case 'order_amount':
          submitData.condition = {
            minAmount: values.minAmount,
            maxAmount: values.maxAmount || null
          };
          break;
        case 'user_level':
          submitData.condition = {
            userLevels: values.userLevels
          };
          break;
        default:
          break;
      }
      
      try {
        if (currentRule) {
          // 更新
          await updateCouponRule(currentRule.id, submitData);
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await createCouponRule(submitData);
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
          await deleteCouponRule(id);
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
  const toggleEnabled = async (record: CouponRuleData) => {
    const hide = message.loading('正在更新...', 0);
    try {
      await updateCouponRule(record.id, {
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
      case 'product_category':
        return '商品分类';
      case 'product_brand':
        return '商品品牌';
      case 'order_amount':
        return '订单金额';
      case 'user_level':
        return '用户等级';
      default:
        return type;
    }
  };
  
  // 获取规则条件描述
  const getRuleConditionText = (record: CouponRuleData) => {
    const { type, condition } = record;
    
    switch (type) {
      case 'product_category':
        return `适用分类ID: ${condition.categoryIds?.join(', ') || '无'}`;
      case 'product_brand':
        return `适用品牌ID: ${condition.brandIds?.join(', ') || '无'}`;
      case 'order_amount':
        return `订单金额: ${condition.minAmount || 0} ~ ${condition.maxAmount ? condition.maxAmount : '无上限'}`;
      case 'user_level':
        return `用户等级: ${condition.userLevels?.join(', ') || '无'}`;
      default:
        return JSON.stringify(condition);
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<CouponRuleData> = [
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
      title: '规则条件',
      key: 'condition',
      width: 250,
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
      case 'product_category':
        return (
          <Form.Item
            name="categoryIds"
            label="适用分类ID"
            rules={[{ required: true, message: '请输入适用分类ID' }]}
          >
            <Select
              mode="tags"
              placeholder="输入分类ID，按Enter键确认"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        );
      case 'product_brand':
        return (
          <Form.Item
            name="brandIds"
            label="适用品牌ID"
            rules={[{ required: true, message: '请输入适用品牌ID' }]}
          >
            <Select
              mode="tags"
              placeholder="输入品牌ID，按Enter键确认"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        );
      case 'order_amount':
        return (
          <>
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
            <Form.Item
              name="maxAmount"
              label="最高订单金额"
              extra="不填则表示无上限"
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0} 
                precision={2} 
                placeholder="最高订单金额（可选）" 
              />
            </Form.Item>
          </>
        );
      case 'user_level':
        return (
          <Form.Item
            name="userLevels"
            label="适用用户等级"
            rules={[{ required: true, message: '请选择适用用户等级' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择适用用户等级"
              style={{ width: '100%' }}
            >
              <Option value="1">普通会员</Option>
              <Option value="2">银卡会员</Option>
              <Option value="3">金卡会员</Option>
              <Option value="4">钻石会员</Option>
            </Select>
          </Form.Item>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="coupon-rule-container">
      <Title level={2}>优惠券规则管理</Title>
      
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
        
        <Table<CouponRuleData>
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
              <Option value="product_category">商品分类</Option>
              <Option value="product_brand">商品品牌</Option>
              <Option value="order_amount">订单金额</Option>
              <Option value="user_level">用户等级</Option>
            </Select>
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

export default CouponRule; 