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
  Tooltip,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchLogisticsCompanies, 
  setCompanyPagination 
} from '@/store/slices/logisticsSlice';
import { 
  addLogisticsCompany, 
  updateLogisticsCompany, 
  deleteLogisticsCompany,
  type LogisticsCompany
} from '@/api/logistics';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;

const LogisticsCompanyManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { companies, pagination, loading } = useSelector((state: RootState) => ({
    companies: state.logistics.companies,
    pagination: state.logistics.companyPagination,
    loading: state.logistics.loading.companies || state.logistics.loading.action
  }));
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加物流公司');
  const [currentCompany, setCurrentCompany] = useState<LogisticsCompany | null>(null);
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchCompanies();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取物流公司列表
  const fetchCompanies = () => {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize
    };
    dispatch(fetchLogisticsCompanies(params));
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setCompanyPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setCompanyPagination({ current: 1, pageSize: size }));
  };
  
  // 添加物流公司
  const handleAdd = () => {
    setModalTitle('添加物流公司');
    setCurrentCompany(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1 // 默认启用
    });
    setModalVisible(true);
  };
  
  // 编辑物流公司
  const handleEdit = (record: LogisticsCompany) => {
    setModalTitle('编辑物流公司');
    setCurrentCompany(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      contact: record.contact || '',
      phone: record.phone || '',
      address: record.address || '',
      status: record.status,
      logo: record.logo || '',
      sortOrder: record.sortOrder
    });
    setModalVisible(true);
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      try {
        if (currentCompany) {
          // 更新
          await updateLogisticsCompany(currentCompany.id, values);
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await addLogisticsCompany(values);
          hide();
          message.success('添加成功');
        }
        
        setModalVisible(false);
        fetchCompanies();
      } catch (error) {
        hide();
        message.error('操作失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 删除物流公司
  const handleDelete = (record: LogisticsCompany) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除物流公司 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除...', 0);
        try {
          await deleteLogisticsCompany(record.id);
          hide();
          message.success('删除成功');
          fetchCompanies();
        } catch (error) {
          hide();
          message.error('删除失败');
        }
      }
    });
  };
  
  // 切换启用状态
  const toggleStatus = async (record: LogisticsCompany) => {
    const hide = message.loading('正在更新...', 0);
    try {
      await updateLogisticsCompany(record.id, {
        status: record.status === 1 ? 0 : 1
      });
      hide();
      message.success('状态更新成功');
      fetchCompanies();
    } catch (error) {
      hide();
      message.error('状态更新失败');
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<LogisticsCompany> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '公司代码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '公司名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 120,
      render: (contact) => contact || '-'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => phone || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Switch 
          checked={status === 1} 
          onChange={() => toggleStatus(record)} 
        />
      )
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80
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
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="logistics-company-container">
      <Title level={2}>物流公司管理</Title>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加物流公司
          </Button>
        </div>
        
        <Table<LogisticsCompany>
          columns={columns}
          dataSource={companies}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label={
              <span>
                公司代码 
                <Tooltip title="用于生成物流单号前缀，不可重复">
                  <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: '请输入公司代码' },
              { max: 10, message: '公司代码最多10个字符' }
            ]}
          >
            <Input placeholder="输入公司代码" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="公司名称"
            rules={[
              { required: true, message: '请输入公司名称' },
              { max: 50, message: '公司名称最多50个字符' }
            ]}
          >
            <Input placeholder="输入公司名称" />
          </Form.Item>
          
          <Form.Item
            name="contact"
            label="联系人"
          >
            <Input placeholder="输入联系人姓名" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="联系电话"
          >
            <Input placeholder="输入联系电话" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="公司地址"
          >
            <Input placeholder="输入公司地址" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Switch 
              checkedChildren="启用" 
              unCheckedChildren="禁用" 
              checked={form.getFieldValue('status') === 1}
              onChange={(checked) => form.setFieldsValue({ status: checked ? 1 : 0 })}
            />
          </Form.Item>
          
          <Form.Item
            name="logo"
            label="Logo地址"
          >
            <Input placeholder="输入Logo图片地址" />
          </Form.Item>
          
          <Form.Item
            name="sortOrder"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
            initialValue={0}
          >
            <Input type="number" placeholder="输入排序值，数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsCompanyManagement; 