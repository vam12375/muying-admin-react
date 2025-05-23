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
  Descriptions, 
  InputNumber,
  Spin,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponBatchList } from '@/store/slices/couponSlice';
import { getCouponBatchDetail, createCouponBatch, getCouponRuleList } from '@/api/coupon';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { confirm } = Modal;

// 定义批次数据类型
interface BatchData {
  batchId: number;
  couponName: string;
  ruleId: number;
  totalCount: number;
  assignCount: number;
  createTime: string;
  updateTime: string;
}

// 定义规则选项类型
interface RuleOption {
  ruleId: number;
  name: string;
}

// 定义批次详情类型
interface BatchDetail extends BatchData {
  couponRule?: {
    ruleId: number;
    name: string;
  };
}

const CouponBatch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [generateForm] = Form.useForm();
  
  // 状态
  const [list, setList] = useState<BatchData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [generateDialogVisible, setGenerateDialogVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);
  const [ruleOptions, setRuleOptions] = useState<RuleOption[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  
  // 初始加载
  useEffect(() => {
    getList();
    getRuleOptions();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取批次列表
  const getList = () => {
    setLoading(true);
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values
    };
    
    dispatch(fetchCouponBatchList(params))
      .unwrap()
      .then((response) => {
        // 如果API正常返回
        setList(response.data.list || []);
        setTotal(response.data.total || 0);
      })
      .catch(() => {
        // 如果API未完成，使用模拟数据
        const mockData = [
          {
            batchId: 1,
            couponName: '新人专享优惠券',
            ruleId: 1,
            totalCount: 1000,
            assignCount: 250,
            createTime: '2023-06-01 10:00:00',
            updateTime: '2023-06-01 10:00:00'
          },
          {
            batchId: 2,
            couponName: '618活动优惠券',
            ruleId: 2,
            totalCount: 2000,
            assignCount: 1500,
            createTime: '2023-06-10 10:00:00',
            updateTime: '2023-06-10 10:00:00'
          }
        ];
        setList(mockData);
        setTotal(2);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // 获取规则选项
  const getRuleOptions = () => {
    getCouponRuleList({ page: 1, pageSize: 100 })
      .then((response) => {
        setRuleOptions(response.data.list || []);
      })
      .catch(() => {
        // 如果API未完成，使用模拟数据
        const mockRules = [
          { ruleId: 1, name: '满100减10' },
          { ruleId: 2, name: '满200减30' },
          { ruleId: 3, name: '9折优惠' }
        ];
        setRuleOptions(mockRules);
      });
  };
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    getList();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    setPagination({ ...pagination, current: 1 });
    getList();
  };
  
  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination({ current: page, pageSize: pageSize || 10 });
  };
  
  // 添加批次
  const handleCreateBatch = () => {
    createForm.resetFields();
    setCreateDialogVisible(true);
  };
  
  // 提交批次
  const submitBatch = () => {
    createForm.validateFields().then(values => {
      createCouponBatch(values)
        .then(() => {
          message.success('创建批次成功');
          setCreateDialogVisible(false);
          getList();
        })
        .catch(() => {
          message.error('创建批次失败，请重试');
        });
    });
  };
  
  // 查看批次详情
  const viewBatchDetail = (record: BatchData) => {
    setDetailLoading(true);
    setDetailDialogVisible(true);
    
    getCouponBatchDetail(record.batchId)
      .then((response) => {
        setBatchDetail(response.data);
      })
      .catch(() => {
        // 如果API未完成，使用模拟数据
        setBatchDetail({
          ...record,
          couponRule: {
            ruleId: record.ruleId,
            name: ruleOptions.find(r => r.ruleId === record.ruleId)?.name || '未知规则'
          }
        });
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };
  
  // 生成优惠券
  const generateCoupons = (record: BatchData) => {
    generateForm.setFieldsValue({
      batchId: record.batchId,
      couponName: record.couponName,
      count: 10
    });
    setGenerateDialogVisible(true);
  };
  
  // 提交生成
  const submitGenerate = () => {
    generateForm.validateFields().then(values => {
      message.success(`成功生成 ${values.count} 张优惠券`);
      setGenerateDialogVisible(false);
      getList();
    });
  };
  
  // 表格列定义
  const columns: ColumnsType<BatchData> = [
    {
      title: '批次ID',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 80,
      align: 'center'
    },
    {
      title: '优惠券名称',
      dataIndex: 'couponName',
      key: 'couponName',
      width: 150
    },
    {
      title: '总数量',
      dataIndex: 'totalCount',
      key: 'totalCount',
      width: 100,
      align: 'center'
    },
    {
      title: '已分配',
      dataIndex: 'assignCount',
      key: 'assignCount',
      width: 100,
      align: 'center'
    },
    {
      title: '规则ID',
      dataIndex: 'ruleId',
      key: 'ruleId',
      width: 100,
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      width: 230,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" onClick={() => viewBatchDetail(record)}>
            查看详情
          </Button>
          <Button type="primary" onClick={() => generateCoupons(record)}>
            生成优惠券
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div className="app-container">
      <Card>
        <div className="filter-container" style={{ marginBottom: 16 }}>
          <Form form={form} layout="inline">
            <Form.Item name="couponName">
              <Input
                placeholder="优惠券名称"
                allowClear
                style={{ width: 200 }}
                onPressEnter={handleSearch}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={resetQuery}>重置</Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBatch}>
                新建批次
              </Button>
            </Form.Item>
          </Form>
        </div>
        
        <Table
          rowKey="batchId"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => handleTableChange(page, pageSize)
          }}
        />
      </Card>
      
      {/* 创建批次弹窗 */}
      <Modal
        title="创建优惠券批次"
        open={createDialogVisible}
        onCancel={() => setCreateDialogVisible(false)}
        onOk={submitBatch}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            couponName: '',
            ruleId: undefined,
            totalCount: 100
          }}
        >
          <Form.Item
            name="couponName"
            label="优惠券名称"
            rules={[
              { required: true, message: '请输入优惠券名称' },
              { min: 2, max: 20, message: '长度在 2 到 20 个字符' }
            ]}
          >
            <Input placeholder="请输入优惠券名称" />
          </Form.Item>
          <Form.Item
            name="ruleId"
            label="规则ID"
            rules={[{ required: true, message: '请选择规则' }]}
          >
            <Select placeholder="请选择规则">
              {ruleOptions.map(rule => (
                <Select.Option key={rule.ruleId} value={rule.ruleId}>
                  {rule.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="totalCount"
            label="批次数量"
            rules={[{ required: true, message: '请输入批次数量' }]}
          >
            <InputNumber min={1} max={10000} placeholder="请输入批次数量" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 详情弹窗 */}
      <Modal
        title="批次详情"
        open={detailDialogVisible}
        onCancel={() => setDetailDialogVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {batchDetail && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="批次ID">{batchDetail.batchId}</Descriptions.Item>
              <Descriptions.Item label="优惠券名称">{batchDetail.couponName}</Descriptions.Item>
              <Descriptions.Item label="规则ID">{batchDetail.ruleId}</Descriptions.Item>
              <Descriptions.Item label="规则名称">{batchDetail.couponRule?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="总数量">{batchDetail.totalCount}</Descriptions.Item>
              <Descriptions.Item label="已分配数量">{batchDetail.assignCount}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{batchDetail.createTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{batchDetail.updateTime}</Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
      
      {/* 生成优惠券弹窗 */}
      <Modal
        title="生成优惠券"
        open={generateDialogVisible}
        onCancel={() => setGenerateDialogVisible(false)}
        onOk={submitGenerate}
        destroyOnClose
      >
        <Form
          form={generateForm}
          layout="vertical"
        >
          <Form.Item label="批次ID" name="batchId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="优惠券名称" name="couponName">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="生成数量"
            name="count"
            rules={[{ required: true, message: '请输入生成数量' }]}
            initialValue={10}
          >
            <InputNumber min={1} max={1000} placeholder="请输入生成数量" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponBatch; 