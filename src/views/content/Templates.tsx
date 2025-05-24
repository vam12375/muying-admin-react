import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Tabs, Table, Tag, Button, Space, Input, Modal, Form, Select, message } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  MailOutlined,
  MessageOutlined,
  FileTextOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ContentTemplate } from '@/api/content';
import { contentApi } from '@/api/content';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 模板管理页面
 */
const TemplateManage: React.FC = () => {
  // 状态定义
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [templateType, setTemplateType] = useState<string>('email');
  const [form] = Form.useForm();
  
  // 加载模板数据
  const loadTemplates = async (type?: string) => {
    setLoading(true);
    try {
      const data = await contentApi.getTemplateList(type);
      setTemplates(data);
    } catch (error) {
      console.error('加载模板失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和类型变化时重新加载
  useEffect(() => {
    loadTemplates(templateType);
  }, [templateType]);
  
  // 显示创建模板弹窗
  const showCreateModal = () => {
    setModalTitle('创建模板');
    setEditingTemplate(null);
    form.resetFields();
    
    // 设置默认类型
    form.setFieldsValue({
      type: templateType,
    });
    
    setModalVisible(true);
  };
  
  // 显示编辑模板弹窗
  const showEditModal = (template: ContentTemplate) => {
    setModalTitle('编辑模板');
    setEditingTemplate(template);
    
    form.setFieldsValue({
      name: template.name,
      type: template.type,
      content: template.content,
      description: template.description,
      variables: template.variables ? template.variables.join(', ') : '',
      isDefault: template.isDefault
    });
    
    setModalVisible(true);
  };
  
  // 处理模板保存
  const handleSaveTemplate = () => {
    form.validateFields().then(async values => {
      try {
        // 处理变量，将逗号分隔的字符串转为数组
        const variables = values.variables
          ? values.variables.split(',').map((v: string) => v.trim()).filter(Boolean)
          : [];
        
        const templateData = {
          ...values,
          variables
        };
        
        if (editingTemplate) {
          // 更新模板
          // 在实际应用中，这里会调用API更新模板
          // 这里只是模拟更新本地状态
          const updatedTemplate = {
            ...editingTemplate,
            ...templateData
          };
          
          setTemplates(templates.map(item => 
            item.id === editingTemplate.id ? updatedTemplate : item
          ));
          
          message.success('模板更新成功');
        } else {
          // 创建模板
          // 在实际应用中，这里会调用API创建模板
          // 这里只是模拟添加到本地状态
          const newTemplate: ContentTemplate = {
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...templateData
          };
          
          setTemplates([...templates, newTemplate]);
          
          message.success('模板创建成功');
        }
        
        setModalVisible(false);
      } catch (error) {
        console.error('保存模板失败', error);
        message.error('保存模板失败');
      }
    });
  };
  
  // 处理复制模板
  const handleCopyTemplate = (template: ContentTemplate) => {
    const newTemplate: ContentTemplate = {
      ...template,
      id: `temp-${Date.now()}`,
      name: `${template.name} (复制)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTemplates([...templates, newTemplate]);
    message.success('模板复制成功');
  };
  
  // 处理删除模板
  const handleDeleteTemplate = (template: ContentTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板 "${template.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        // 在实际应用中，这里会调用API删除模板
        // 这里只是模拟从本地状态中删除
        setTemplates(templates.filter(item => item.id !== template.id));
        message.success('模板删除成功');
      }
    });
  };
  
  // 获取模板类型图标
  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailOutlined />;
      case 'sms':
        return <MessageOutlined />;
      case 'page':
        return <FileTextOutlined />;
      case 'product':
        return <ShoppingOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };
  
  // 获取模板类型显示文本
  const getTemplateTypeText = (type: string) => {
    switch (type) {
      case 'email':
        return '邮件';
      case 'sms':
        return '短信';
      case 'page':
        return '页面';
      case 'product':
        return '商品';
      default:
        return type;
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ContentTemplate) => (
        <Space>
          {text}
          {record.isDefault && <Tag color="blue">默认</Tag>}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag icon={getTemplateTypeIcon(type)} color={
          type === 'email' ? 'blue' :
          type === 'sms' ? 'green' :
          type === 'page' ? 'purple' :
          type === 'product' ? 'orange' : 'default'
        }>
          {getTemplateTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '变量',
      dataIndex: 'variables',
      key: 'variables',
      render: (variables: string[]) => (
        <div>
          {variables && variables.map(variable => (
            <Tag key={variable}>{variable}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ContentTemplate) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => handleCopyTemplate(record)}
          >
            复制
          </Button>
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteTemplate(record)}
            disabled={record.isDefault}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="template-manage-container">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex justify-between items-center">
          <Title level={4} className="m-0">模板管理</Title>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            创建模板
          </Button>
        </div>
        
        <Alert
          message="功能开发中"
          description="模板管理功能正在开发中，目前仅展示基础界面和模拟数据，敬请期待完整功能！"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Tabs 
          activeKey={templateType} 
          onChange={setTemplateType}
        >
          <TabPane 
            tab={<span><MailOutlined />邮件模板</span>}
            key="email"
          >
            <Card>
              <Table
                columns={columns}
                dataSource={templates}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><MessageOutlined />短信模板</span>}
            key="sms"
          >
            <Card>
              <Table
                columns={columns}
                dataSource={templates}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><FileTextOutlined />页面模板</span>}
            key="page"
          >
            <Card>
              <Table
                columns={columns}
                dataSource={templates}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><ShoppingOutlined />商品模板</span>}
            key="product"
          >
            <Card>
              <Table
                columns={columns}
                dataSource={templates}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>
        </Tabs>
        
        {/* 创建/编辑模板弹窗 */}
        <Modal
          title={modalTitle}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSaveTemplate}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="请输入模板名称" />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="模板类型"
              rules={[{ required: true, message: '请选择模板类型' }]}
            >
              <Select>
                <Option value="email">邮件模板</Option>
                <Option value="sms">短信模板</Option>
                <Option value="page">页面模板</Option>
                <Option value="product">商品模板</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="description"
              label="描述"
            >
              <Input placeholder="请输入模板描述" />
            </Form.Item>
            
            <Form.Item
              name="content"
              label="模板内容"
              rules={[{ required: true, message: '请输入模板内容' }]}
            >
              <TextArea rows={10} placeholder="请输入模板内容，可以使用{{变量名}}形式插入变量" />
            </Form.Item>
            
            <Form.Item
              name="variables"
              label="支持的变量"
              tooltip="多个变量请用英文逗号分隔"
            >
              <Input placeholder="例如：user_name, content, order_number" />
            </Form.Item>
            
            <Form.Item
              name="isDefault"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>设为默认模板</Option>
                <Option value={false}>普通模板</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
};

export default TemplateManage; 