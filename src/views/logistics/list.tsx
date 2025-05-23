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
import { AppDispatch, RootState } from '@/store';
import { 
  fetchLogisticsList, 
  fetchLogisticsCompanies, 
  setPagination 
} from '@/store/slices/logisticsSlice';
import { updateLogistics } from '@/api/logistics';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;

// 定义物流数据类型
interface LogisticsData {
  id: number;
  orderNo: string;
  trackingNo: string;
  shippingCompany: string;
  shippingCompanyName: string;
  status: string;
  createTime: string;
  updateTime: string;
}

const LogisticsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { logisticsList, companies, pagination, loading } = useSelector((state: RootState) => state.logistics);
  
  // 本地状态
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [currentLogistics, setCurrentLogistics] = useState<LogisticsData | null>(null);
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
  const handleDetail = (record: LogisticsData) => {
    navigate(`/logistics/detail/${record.id}`);
  };
  
  // 处理更新物流状态
  const handleUpdate = (record: LogisticsData) => {
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
      
      const hide = message.loading('正在更新...', 0);
      try {
        await updateLogistics(currentLogistics.id, values);
        hide();
        message.success('更新成功');
        setUpdateDialogVisible(false);
        fetchLogisticsData();
      } catch (error) {
        hide();
        message.error('更新失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 获取物流状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="warning">待处理</Tag>;
      case 'shipping':
        return <Tag color="processing">运输中</Tag>;
      case 'delivered':
        return <Tag color="success">已送达</Tag>;
      case 'exception':
        return <Tag color="error">异常</Tag>;
      case 'returned':
        return <Tag color="orange">已退回</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 获取物流公司名称
  const getCompanyName = (code: string) => {
    const company = companies.find(item => item.code === code);
    return company ? company.name : code;
  };
  
  // 表格列定义
  const columns: ColumnsType<LogisticsData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180
    },
    {
      title: '物流单号',
      dataIndex: 'trackingNo',
      key: 'trackingNo',
      width: 180
    },
    {
      title: '物流公司',
      dataIndex: 'shippingCompany',
      key: 'shippingCompany',
      width: 150,
      render: (code, record) => record.shippingCompanyName || getCompanyName(code)
    },
    {
      title: '物流状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
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
            更新
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
          <Form.Item name="orderNo" label="订单编号">
            <Input placeholder="订单编号" allowClear />
          </Form.Item>
          <Form.Item name="trackingNo" label="物流单号">
            <Input placeholder="物流单号" allowClear />
          </Form.Item>
          <Form.Item name="status" label="物流状态">
            <Select placeholder="物流状态" style={{ width: 150 }} allowClear>
              <Option value="">全部</Option>
              <Option value="pending">待处理</Option>
              <Option value="shipping">运输中</Option>
              <Option value="delivered">已送达</Option>
              <Option value="exception">异常</Option>
              <Option value="returned">已退回</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      {/* 物流列表表格 */}
      <Card>
        <Table<LogisticsData>
          columns={columns}
          dataSource={logisticsList}
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
      
      {/* 更新物流状态对话框 */}
      <Modal
        title="更新物流状态"
        open={updateDialogVisible}
        onOk={confirmUpdate}
        onCancel={() => setUpdateDialogVisible(false)}
        width={500}
      >
        <Form
          form={updateForm}
          layout="vertical"
        >
          <Form.Item label="订单编号">
            <span>{currentLogistics?.orderNo}</span>
          </Form.Item>
          <Form.Item label="物流单号">
            <span>{currentLogistics?.trackingNo}</span>
          </Form.Item>
          <Form.Item
            name="status"
            label="物流状态"
            rules={[{ required: true, message: '请选择物流状态' }]}
          >
            <Select placeholder="请选择物流状态">
              <Option value="pending">待处理</Option>
              <Option value="shipping">运输中</Option>
              <Option value="delivered">已送达</Option>
              <Option value="exception">异常</Option>
              <Option value="returned">已退回</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsList; 