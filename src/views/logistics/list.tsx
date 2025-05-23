import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Select, 
  Modal, 
  message, 
  Typography,
  Tag
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchLogisticsList, 
  fetchLogisticsCompanies, 
  setPagination,
  updateLogisticsStatusAction
} from '@/store/slices/logisticsSlice';
import type { Logistics } from '@/api/logistics';
import { LogisticsStatus } from '@/api/logistics';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;

const LogisticsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { logisticsList, companies, pagination, loading } = useSelector((state: RootState) => ({
    logisticsList: state.logistics.logisticsList,
    companies: state.logistics.companies,
    pagination: state.logistics.pagination,
    loading: state.logistics.loading.list || state.logistics.loading.action
  }));
  
  // 本地状态
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [currentLogistics, setCurrentLogistics] = useState<Logistics | null>(null);
  const [updateForm] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchLogisticsData();
    dispatch(fetchLogisticsCompanies());
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取物流列表
  const fetchLogisticsData = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values
    };
    dispatch(fetchLogisticsList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchLogisticsData();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchLogisticsData();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看物流详情
  const handleDetail = (record: Logistics) => {
    navigate(`/logistics/detail/${record.id}`);
  };
  
  // 处理更新物流状态
  const handleUpdate = (record: Logistics) => {
    setCurrentLogistics(record);
    updateForm.resetFields();
    updateForm.setFieldsValue({
      status: record.status
    });
    setUpdateDialogVisible(true);
  };
  
  // 确认更新物流状态
  const confirmUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      if (!currentLogistics) return;
      
      await dispatch(updateLogisticsStatusAction({
        id: currentLogistics.id,
        status: values.status,
        remark: values.remark
      })).unwrap();
      
      setUpdateDialogVisible(false);
      fetchLogisticsData();
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 获取物流状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case LogisticsStatus.CREATED:
        return <Tag color="orange">已创建</Tag>;
      case LogisticsStatus.SHIPPING:
        return <Tag color="blue">运输中</Tag>;
      case LogisticsStatus.DELIVERED:
        return <Tag color="green">已送达</Tag>;
      case LogisticsStatus.EXCEPTION:
        return <Tag color="red">异常</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 获取物流公司名称
  const getCompanyName = (companyId: number) => {
    const company = companies.find(item => item.id === companyId);
    return company ? company.name : '-';
  };
  
  // 表格列定义
  const columns: ColumnsType<Logistics> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100
    },
    {
      title: '物流单号',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      width: 180
    },
    {
      title: '物流公司',
      dataIndex: 'companyId',
      key: 'companyId',
      width: 150,
      render: (companyId, record) => record.company ? record.company.name : getCompanyName(companyId)
    },
    {
      title: '物流状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: '收件人',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 120
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
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDetail(record)}>详情</Button>
          <Button 
            type="link" 
            style={{ color: '#52c41a' }}
            onClick={() => handleUpdate(record)}
          >
            更新状态
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="logistics-list-container">
      <Title level={2}>物流管理</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="orderId" label="订单ID">
            <Input placeholder="订单ID" allowClear />
          </Form.Item>
          <Form.Item name="trackingNo" label="物流单号">
            <Input placeholder="物流单号" allowClear />
          </Form.Item>
          <Form.Item name="status" label="物流状态">
            <Select placeholder="物流状态" style={{ width: 150 }} allowClear>
              <Option value={LogisticsStatus.CREATED}>已创建</Option>
              <Option value={LogisticsStatus.SHIPPING}>运输中</Option>
              <Option value={LogisticsStatus.DELIVERED}>已送达</Option>
              <Option value={LogisticsStatus.EXCEPTION}>异常</Option>
            </Select>
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="收件人/发件人/地址" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button 
                onClick={resetQuery}
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card>
        <Table
          columns={columns}
          dataSource={logisticsList}
          rowKey="id"
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
          scroll={{ x: 1300 }}
          loading={loading}
        />
      </Card>
      
      <Modal
        title="更新物流状态"
        open={updateDialogVisible}
        onOk={confirmUpdate}
        onCancel={() => setUpdateDialogVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={updateForm}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="物流状态"
            rules={[{ required: true, message: '请选择物流状态' }]}
          >
            <Select placeholder="物流状态">
              <Option value={LogisticsStatus.CREATED}>已创建</Option>
              <Option value={LogisticsStatus.SHIPPING}>运输中</Option>
              <Option value={LogisticsStatus.DELIVERED}>已送达</Option>
              <Option value={LogisticsStatus.EXCEPTION}>异常</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsList; 