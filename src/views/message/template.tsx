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
  Tooltip,
  Popconfirm,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchMessageTemplates, 
  fetchTemplateDetail,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  setPagination 
} from '@/store/slices/messageSlice';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 定义消息模板数据类型
interface MessageTemplateData {
  id: number;
  name: string;
  code: string;
  type: string;
  content: string;
  variables: string[];
  createTime: string;
  updateTime: string;
}

const MessageTemplate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();
  
  // 从Redux获取状态
  const { templateList, templateDetail, pagination, loading } = useSelector((state: RootState) => state.message);
  
  // 本地状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加模板');
  const [currentTemplate, setCurrentTemplate] = useState<MessageTemplateData | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  
  // 初始加载
  useEffect(() => {
    fetchTemplates();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取模板列表
  const fetchTemplates = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values
    };
    dispatch(fetchMessageTemplates(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchTemplates();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchTemplates();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看模板详情
  const viewTemplateDetail = async (id: number) => {
    try {
      await dispatch(fetchTemplateDetail(id));
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取模板详情失败');
    }
  };
  
  // 添加模板
  const handleAdd = () => {
    setModalTitle('添加模板');
    setCurrentTemplate(null);
    templateForm.resetFields();
    setFormModalVisible(true);
    setActiveTab('content');
    setPreviewContent('');
  };
  
  // 编辑模板
  const handleEdit = async (id: number) => {
    try {
      await dispatch(fetchTemplateDetail(id));
      setModalTitle('编辑模板');
      setCurrentTemplate(templateDetail);
      
      templateForm.setFieldsValue({
        name: templateDetail.name,
        code: templateDetail.code,
        type: templateDetail.type,
        content: templateDetail.content,
        variables: templateDetail.variables ? templateDetail.variables.join(',') : ''
      });
      
      setFormModalVisible(true);
      setActiveTab('content');
      setPreviewContent('');
    } catch (error) {
      message.error('获取模板详情失败');
    }
  };
  
  // 删除模板
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteMessageTemplate(id));
      message.success('删除成功');
      fetchTemplates();
    } catch (error) {
      message.error('删除失败');
    }
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await templateForm.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      // 处理变量
      const variables = values.variables ? 
        values.variables.split(',').map((item: string) => item.trim()) : 
        [];
      
      const submitData = {
        ...values,
        variables
      };
      
      try {
        if (currentTemplate) {
          // 更新
          await dispatch(updateMessageTemplate({
            id: currentTemplate.id,
            ...submitData
          }));
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await dispatch(createMessageTemplate(submitData));
          hide();
          message.success('添加成功');
        }
        
        setFormModalVisible(false);
        fetchTemplates();
      } catch (error) {
        hide();
        message.error('操作失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 生成预览内容
  const generatePreview = () => {
    const content = templateForm.getFieldValue('content');
    const variables = templateForm.getFieldValue('variables');
    
    if (!content) {
      setPreviewContent('请先填写模板内容');
      return;
    }
    
    let previewContent = content;
    
    // 替换变量
    if (variables) {
      const variableArray = variables.split(',').map((item: string) => item.trim());
      variableArray.forEach((variable: string) => {
        const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
        previewContent = previewContent.replace(regex, `<span style="color: #1890ff;">[${variable}]</span>`);
      });
    }
    
    setPreviewContent(previewContent);
    setActiveTab('preview');
  };
  
  // 处理Tab切换
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    
    if (activeKey === 'preview') {
      generatePreview();
    }
  };
  
  // 获取模板类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'system':
        return '系统通知';
      case 'order':
        return '订单通知';
      case 'promotion':
        return '促销通知';
      case 'user':
        return '用户通知';
      default:
        return type;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<MessageTemplateData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '模板编码',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeText(type)
    },
    {
      title: '模板内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (content) => (
        <Tooltip title={content}>
          <div style={{ 
            maxWidth: 300, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {content}
          </div>
        </Tooltip>
      )
    },
    {
      title: '变量',
      dataIndex: 'variables',
      key: 'variables',
      width: 150,
      render: (variables) => variables ? variables.join(', ') : '-'
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
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => viewTemplateDetail(record.id)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return (
    <div className="message-template-container">
      <Title level={2}>消息模板管理</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="模板名称">
            <Input placeholder="模板名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="模板编码">
            <Input placeholder="模板编码" allowClear />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="模板类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="system">系统通知</Option>
              <Option value="order">订单通知</Option>
              <Option value="promotion">促销通知</Option>
              <Option value="user">用户通知</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button onClick={resetQuery}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加模板
          </Button>
        </div>
        
        <Table<MessageTemplateData>
          columns={columns}
          dataSource={templateList}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* 模板详情对话框 */}
      <Modal
        title="模板详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button 
            key="copy" 
            icon={<CopyOutlined />} 
            onClick={() => {
              if (templateDetail) {
                const content = templateDetail.content;
                navigator.clipboard.writeText(content);
                message.success('模板内容已复制到剪贴板');
              }
            }}
          >
            复制内容
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {templateDetail ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>ID:</strong> {templateDetail.id}</p>
              <p><strong>模板名称:</strong> {templateDetail.name}</p>
              <p><strong>模板编码:</strong> {templateDetail.code}</p>
              <p><strong>类型:</strong> {getTypeText(templateDetail.type)}</p>
              <p><strong>变量:</strong> {templateDetail.variables ? templateDetail.variables.join(', ') : '-'}</p>
              <p><strong>创建时间:</strong> {formatDateTime(templateDetail.createTime)}</p>
              <p><strong>更新时间:</strong> {formatDateTime(templateDetail.updateTime)}</p>
            </div>
            
            <div>
              <p><strong>模板内容:</strong></p>
              <div 
                style={{ 
                  border: '1px solid #d9d9d9', 
                  padding: 16, 
                  borderRadius: 4,
                  background: '#f5f5f5',
                  minHeight: 100,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {templateDetail.content}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>加载中...</div>
        )}
      </Modal>
      
      {/* 添加/编辑模板对话框 */}
      <Modal
        title={modalTitle}
        open={formModalVisible}
        onOk={handleSubmit}
        onCancel={() => setFormModalVisible(false)}
        width={700}
      >
        <Form
          form={templateForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[
              { required: true, message: '请输入模板名称' },
              { max: 50, message: '模板名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="模板编码"
            rules={[
              { required: true, message: '请输入模板编码' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '模板编码只能包含字母、数字和下划线' },
              { max: 50, message: '模板编码不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入模板编码，如: order_confirm" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="模板类型"
            rules={[{ required: true, message: '请选择模板类型' }]}
          >
            <Select placeholder="请选择模板类型">
              <Option value="system">系统通知</Option>
              <Option value="order">订单通知</Option>
              <Option value="promotion">促销通知</Option>
              <Option value="user">用户通知</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="variables"
            label="模板变量"
            tooltip="多个变量用英文逗号分隔，如: userName,orderId"
          >
            <Input placeholder="请输入模板变量，如: userName,orderId" />
          </Form.Item>
          
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="模板内容" key="content">
              <Form.Item
                name="content"
                rules={[
                  { required: true, message: '请输入模板内容' },
                  { max: 2000, message: '模板内容不能超过2000个字符' }
                ]}
              >
                <TextArea 
                  rows={10} 
                  placeholder="请输入模板内容，使用{{变量名}}表示变量，如: 尊敬的{{userName}}，您的订单{{orderId}}已确认" 
                />
              </Form.Item>
              
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={generatePreview}>
                  预览
                </Button>
              </div>
            </TabPane>
            <TabPane tab="预览效果" key="preview">
              <div 
                style={{ 
                  border: '1px solid #d9d9d9', 
                  padding: 16, 
                  borderRadius: 4,
                  minHeight: 200,
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default MessageTemplate; 