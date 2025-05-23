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
  Select,
  Tabs,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  QuestionCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchSystemConfigs, 
  updateSystemConfig,
  createSystemConfig
} from '@/store/slices/systemSlice';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 定义系统配置数据类型
interface SystemConfigData {
  id: number;
  key: string;
  value: string;
  description: string;
  group: string;
  type: string;
  createTime: string;
  updateTime: string;
}

// 定义配置组
const CONFIG_GROUPS = [
  { key: 'basic', name: '基础配置' },
  { key: 'payment', name: '支付配置' },
  { key: 'logistics', name: '物流配置' },
  { key: 'points', name: '积分配置' },
  { key: 'notification', name: '通知配置' }
];

// 定义配置类型
const CONFIG_TYPES = [
  { key: 'string', name: '字符串' },
  { key: 'number', name: '数字' },
  { key: 'boolean', name: '布尔值' },
  { key: 'json', name: 'JSON' },
  { key: 'text', name: '文本' }
];

const SystemConfig: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { configList, loading } = useSelector((state: RootState) => state.system);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加配置');
  const [currentConfig, setCurrentConfig] = useState<SystemConfigData | null>(null);
  const [activeGroup, setActiveGroup] = useState('basic');
  
  // 初始加载
  useEffect(() => {
    fetchConfigs();
  }, [dispatch]);
  
  // 获取配置列表
  const fetchConfigs = () => {
    dispatch(fetchSystemConfigs());
  };
  
  // 添加配置
  const handleAdd = () => {
    setModalTitle('添加配置');
    setCurrentConfig(null);
    form.resetFields();
    form.setFieldsValue({
      group: activeGroup,
      type: 'string'
    });
    setModalVisible(true);
  };
  
  // 编辑配置
  const handleEdit = (record: SystemConfigData) => {
    setModalTitle('编辑配置');
    setCurrentConfig(record);
    form.setFieldsValue({
      key: record.key,
      value: record.value,
      description: record.description,
      group: record.group,
      type: record.type
    });
    setModalVisible(true);
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      try {
        if (currentConfig) {
          // 更新
          await dispatch(updateSystemConfig({
            id: currentConfig.id,
            ...values
          }));
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await dispatch(createSystemConfig(values));
          hide();
          message.success('添加成功');
        }
        
        setModalVisible(false);
        fetchConfigs();
      } catch (error) {
        hide();
        message.error('操作失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 验证配置键名
  const validateConfigKey = (rule: any, value: string) => {
    if (!value) {
      return Promise.reject('请输入配置键名');
    }
    
    // 键名格式验证：只允许字母、数字、下划线和点
    const keyRegex = /^[a-zA-Z0-9_.]+$/;
    if (!keyRegex.test(value)) {
      return Promise.reject('键名只能包含字母、数字、下划线和点');
    }
    
    // 如果是新增配置，检查键名是否已存在
    if (!currentConfig) {
      const exists = configList.some(config => config.key === value);
      if (exists) {
        return Promise.reject('键名已存在');
      }
    }
    
    return Promise.resolve();
  };
  
  // 验证配置值
  const validateConfigValue = (rule: any, value: string) => {
    if (!value && value !== '0' && value !== 'false') {
      return Promise.reject('请输入配置值');
    }
    
    const type = form.getFieldValue('type');
    
    // 根据类型验证值
    switch (type) {
      case 'number':
        if (isNaN(Number(value))) {
          return Promise.reject('请输入有效的数字');
        }
        break;
      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          return Promise.reject('布尔值只能为true或false');
        }
        break;
      case 'json':
        try {
          JSON.parse(value);
        } catch (e) {
          return Promise.reject('请输入有效的JSON格式');
        }
        break;
      default:
        break;
    }
    
    return Promise.resolve();
  };
  
  // 根据配置类型渲染不同的表单项
  const renderValueInput = () => {
    const type = form.getFieldValue('type');
    
    switch (type) {
      case 'text':
        return (
          <TextArea 
            rows={4} 
            placeholder="请输入配置值" 
          />
        );
      case 'boolean':
        return (
          <Select placeholder="请选择布尔值">
            <Option value="true">true</Option>
            <Option value="false">false</Option>
          </Select>
        );
      case 'json':
        return (
          <TextArea 
            rows={4} 
            placeholder="请输入JSON格式的配置值" 
          />
        );
      default:
        return (
          <Input placeholder="请输入配置值" />
        );
    }
  };
  
  // 获取配置组名称
  const getGroupName = (group: string) => {
    const foundGroup = CONFIG_GROUPS.find(g => g.key === group);
    return foundGroup ? foundGroup.name : group;
  };
  
  // 获取配置类型名称
  const getTypeName = (type: string) => {
    const foundType = CONFIG_TYPES.find(t => t.key === type);
    return foundType ? foundType.name : type;
  };
  
  // 处理Tab切换
  const handleTabChange = (activeKey: string) => {
    setActiveGroup(activeKey);
  };
  
  // 过滤当前分组的配置
  const getFilteredConfigs = () => {
    return configList.filter(config => config.group === activeGroup);
  };
  
  // 表格列定义
  const columns: ColumnsType<SystemConfigData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '配置键名',
      dataIndex: 'key',
      key: 'key',
      width: 200
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      width: 250,
      render: (value, record) => {
        // 根据类型展示不同的值
        switch (record.type) {
          case 'json':
            return (
              <Tooltip title={value}>
                <div style={{ 
                  maxWidth: 200, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {value}
                </div>
              </Tooltip>
            );
          case 'text':
            return (
              <Tooltip title={value}>
                <div style={{ 
                  maxWidth: 200, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {value}
                </div>
              </Tooltip>
            );
          default:
            return value;
        }
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getTypeName(type)
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
      width: 120,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      )
    }
  ];
  
  return (
    <div className="system-config-container">
      <Title level={2}>系统配置</Title>
      
      <Card>
        <Tabs 
          activeKey={activeGroup} 
          onChange={handleTabChange}
          tabBarExtraContent={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              添加配置
            </Button>
          }
        >
          {CONFIG_GROUPS.map(group => (
            <TabPane tab={group.name} key={group.key}>
              <Table<SystemConfigData>
                columns={columns}
                dataSource={getFilteredConfigs()}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: 1200 }}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>
      
      {/* 添加/编辑配置对话框 */}
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
            name="key"
            label="配置键名"
            rules={[{ validator: validateConfigKey }]}
          >
            <Input 
              placeholder="请输入配置键名" 
              disabled={!!currentConfig} // 编辑时不允许修改键名
            />
          </Form.Item>
          
          <Form.Item
            name="group"
            label="配置分组"
            rules={[{ required: true, message: '请选择配置分组' }]}
          >
            <Select placeholder="请选择配置分组">
              {CONFIG_GROUPS.map(group => (
                <Option key={group.key} value={group.key}>{group.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="配置类型"
            rules={[{ required: true, message: '请选择配置类型' }]}
          >
            <Select 
              placeholder="请选择配置类型"
              disabled={!!currentConfig} // 编辑时不允许修改类型
            >
              {CONFIG_TYPES.map(type => (
                <Option key={type.key} value={type.key}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            dependencies={['type']}
          >
            {() => (
              <Form.Item
                name="value"
                label={
                  <Space>
                    配置值
                    <Tooltip title="根据配置类型输入对应格式的值">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[{ validator: validateConfigValue }]}
              >
                {renderValueInput()}
              </Form.Item>
            )}
          </Form.Item>
          
          <Form.Item
            name="description"
            label="配置描述"
            rules={[
              { required: true, message: '请输入配置描述' },
              { max: 200, message: '描述不能超过200个字符' }
            ]}
          >
            <Input placeholder="请输入配置描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfig; 