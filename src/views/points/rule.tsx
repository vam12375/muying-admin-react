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
  Switch,
  Tooltip,
  Tag,
  Checkbox
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
      enabled: record.enabled,
      // 设置条件字段
      ...(record.condition || {})
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
            consecutive: values.consecutive || false,
            days: values.days || 1
          };
          break;
        case 'order_complete':
          submitData.condition = {
            minAmount: values.minAmount || 0,
            firstOrder: values.firstOrder || false
          };
          break;
        case 'product_review':
          submitData.condition = {
            withImage: values.withImage || false,
            minLength: values.minLength || 0,
            productCategory: values.productCategory || null
          };
          break;
        case 'profile_complete':
          submitData.condition = {
            fields: values.fields || [],
            allRequired: values.allRequired || false
          };
          break;
        case 'invite_user':
          submitData.condition = {
            registerOnly: values.registerOnly || false,
            firstOrderRequired: values.firstOrderRequired || false
          };
          break;
        case 'daily_share':
          submitData.condition = {
            platforms: values.platforms || [],
            minShares: values.minShares || 1
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
      content: '确定要删除此规则吗？删除后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
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
    const hide = message.loading('正在更新状态...', 0);
    try {
      await updatePointsRule(record.id, {
        ...record,
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
      case 'daily_share':
        return '每日分享';
      case 'level_upgrade':
        return '会员升级';
      default:
        return type;
    }
  };
  
  // 获取规则条件描述
  const getRuleConditionText = (record: PointsRuleData) => {
    const { type, condition } = record;
    if (!condition) return '无条件';
    
    switch (type) {
      case 'sign_in':
        if (condition.consecutive) {
          return `连续签到${condition.days || 1}天`;
        }
        return '每日签到';
      case 'order_complete':
        let text = `订单金额 ≥ ${condition.minAmount || 0}元`;
        if (condition.firstOrder) {
          text += '，首单';
        }
        return text;
      case 'product_review':
        let reviewText = condition.withImage ? '带图评价' : '文字评价';
        if (condition.minLength) {
          reviewText += `，最少${condition.minLength}字`;
        }
        if (condition.productCategory) {
          reviewText += `，类别：${condition.productCategory}`;
        }
        return reviewText;
      case 'profile_complete':
        if (condition.allRequired) {
          return '完善所有资料';
        }
        return `完善字段: ${(condition.fields || []).join(', ') || '任意'}`;
      case 'invite_user':
        if (condition.firstOrderRequired) {
          return '邀请新用户并完成首单';
        }
        return condition.registerOnly ? '邀请新用户注册' : '邀请新用户';
      case 'daily_share':
        return `每日分享${condition.minShares || 1}次，平台：${(condition.platforms || []).join(', ') || '任意'}`;
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
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      width: 200,
      render: (_, record) => getRuleConditionText(record)
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'default'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
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
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            onClick={() => toggleEnabled(record)}
          >
            {record.enabled ? '禁用' : '启用'}
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
  
  // 根据规则类型渲染不同的条件表单项
  const renderConditionFormItems = () => {
    const type = form.getFieldValue('type');
    
    switch (type) {
      case 'sign_in':
        return (
          <>
            <Form.Item
              name="consecutive"
              valuePropName="checked"
              label="连续签到"
              tooltip="选择是否需要连续签到才能获得积分"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="days"
              label="连续天数"
              tooltip="连续签到的天数，启用连续签到时有效"
              initialValue={1}
            >
              <InputNumber min={1} max={365} />
            </Form.Item>
          </>
        );
      
      case 'order_complete':
        return (
          <>
            <Form.Item
              name="minAmount"
              label="订单最低金额"
              tooltip="达到该金额才能获得积分"
              initialValue={0}
            >
              <InputNumber min={0} step={10} addonAfter="元" />
            </Form.Item>
            
            <Form.Item
              name="firstOrder"
              valuePropName="checked"
              label="首单专享"
              tooltip="是否仅对用户的第一笔订单有效"
            >
              <Switch />
            </Form.Item>
          </>
        );
      
      case 'product_review':
        return (
          <>
            <Form.Item
              name="withImage"
              valuePropName="checked"
              label="带图评价"
              tooltip="是否需要上传图片才能获得积分"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="minLength"
              label="评价最少字数"
              tooltip="评价内容需要达到的最少字数"
              initialValue={0}
            >
              <InputNumber min={0} max={1000} />
            </Form.Item>
            
            <Form.Item
              name="productCategory"
              label="商品类别"
              tooltip="限制特定类别的商品评价才可获得积分"
            >
              <Select allowClear placeholder="所有类别">
                <Option value="baby_clothes">婴儿服装</Option>
                <Option value="baby_food">婴儿食品</Option>
                <Option value="toys">玩具</Option>
                <Option value="diapers">尿布</Option>
              </Select>
            </Form.Item>
          </>
        );
      
      case 'profile_complete':
        return (
          <>
            <Form.Item
              name="allRequired"
              valuePropName="checked"
              label="完善所有资料"
              tooltip="是否需要完善全部资料才能获得积分"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="fields"
              label="完善字段"
              tooltip="选择需要完善的字段，当不需要完善所有资料时有效"
            >
              <Select mode="multiple" placeholder="请选择字段">
                <Option value="avatar">头像</Option>
                <Option value="nickname">昵称</Option>
                <Option value="phone">手机号</Option>
                <Option value="email">邮箱</Option>
                <Option value="address">收货地址</Option>
                <Option value="birthday">生日</Option>
              </Select>
            </Form.Item>
          </>
        );
        
      case 'invite_user':
        return (
          <>
            <Form.Item
              name="registerOnly"
              valuePropName="checked"
              label="仅注册即可"
              tooltip="邀请的用户仅需注册即可获得积分"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="firstOrderRequired"
              valuePropName="checked"
              label="需完成首单"
              tooltip="邀请的用户需要完成首单才能获得积分"
            >
              <Switch />
            </Form.Item>
          </>
        );
        
      case 'daily_share':
        return (
          <>
            <Form.Item
              name="minShares"
              label="最少分享次数"
              tooltip="每日需要分享的最少次数"
              initialValue={1}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>
            
            <Form.Item
              name="platforms"
              label="分享平台"
              tooltip="选择可以获得积分的分享平台"
            >
              <Select mode="multiple" placeholder="请选择分享平台">
                <Option value="wechat">微信</Option>
                <Option value="weibo">微博</Option>
                <Option value="qq">QQ</Option>
                <Option value="alipay">支付宝</Option>
              </Select>
            </Form.Item>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="points-rule-container">
      <Title level={2}>积分规则管理</Title>
      
      <Card className="action-container" style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加规则
        </Button>
      </Card>
      
      <Card>
        <Table<PointsRuleData>
          columns={columns}
          dataSource={ruleList}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
      
      {/* 新增/编辑规则弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        maskClosable={false}
      >
        <Form 
          form={form} 
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" maxLength={50} />
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
              <Option value="daily_share">每日分享</Option>
              <Option value="level_upgrade">会员升级</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="points"
            label="积分值"
            rules={[{ required: true, message: '请输入积分值' }]}
            tooltip="用户完成该规则可获得的积分数量"
          >
            <InputNumber min={1} max={10000} addonAfter="分" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="规则描述"
          >
            <TextArea rows={3} placeholder="请输入规则描述" maxLength={200} />
          </Form.Item>
          
          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="是否启用"
          >
            <Switch />
          </Form.Item>
          
          <div className="condition-form">
            <h3>
              规则条件
              <Tooltip title="根据不同的规则类型设置不同的条件">
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </h3>
            
            {renderConditionFormItems()}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsRule; 