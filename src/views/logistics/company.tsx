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
  Switch
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchLogisticsCompanies, 
  setPagination 
} from '@/store/slices/logisticsSlice';
import { 
  addLogisticsCompany, 
  updateLogisticsCompany, 
  deleteLogisticsCompany 
} from '@/api/logistics';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;

// 定义物流公司数据类型
interface LogisticsCompanyData {
  id: number;
  code: string;
  name: string;
  logo: string;
  website: string;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

const LogisticsCompany: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux获取状态
  const { companies, pagination, loading } = useSelector((state: RootState) => state.logistics);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加物流公司');
  const [currentCompany, setCurrentCompany] = useState<LogisticsCompanyData | null>(null);
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
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 添加物流公司
  const handleAdd = () => {
    setModalTitle('添加物流公司');
    setCurrentCompany(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // 编辑物流公司
  const handleEdit = (record: LogisticsCompanyData) => {
    setModalTitle('编辑物流公司');
    setCurrentCompany(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      website: record.website,
      enabled: record.enabled
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
  const handleDelete = (record: LogisticsCompanyData) => {
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
  const toggleEnabled = async (record: LogisticsCompanyData) => {
    const hide = message.loading('正在更新...', 0);
    try {
      await updateLogisticsCompany(record.id, {
        enabled: !record.enabled
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
  const columns: ColumnsType<LogisticsCompanyData> = [
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
      title: '官网',
      dataIndex: 'website',
      key: 'website',
      width: 200,
      render: (website) => website ? (
        <a href={website} target="_blank" rel="noopener noreferrer">{website}</a>
      ) : '-'
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
        
        <Table<LogisticsCompanyData>
          columns={columns}
          dataSource={companies}
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
      
      {/* 添加/编辑物流公司对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="公司代码"
            rules={[
              { required: true, message: '请输入公司代码' },
              { max: 20, message: '公司代码不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入公司代码，如SF、ZTO等" />
          </Form.Item>
          <Form.Item
            name="name"
            label="公司名称"
            rules={[
              { required: true, message: '请输入公司名称' },
              { max: 50, message: '公司名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>
          <Form.Item
            name="website"
            label="官网"
            rules={[
              { type: 'url', message: '请输入有效的网址' }
            ]}
          >
            <Input placeholder="请输入官网地址" />
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

export default LogisticsCompany; 