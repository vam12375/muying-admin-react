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
  Tag,
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Statistic,
  App,
  Checkbox,
  Dropdown,
  Progress,
  Tooltip,
  Badge,
  Alert,
  Empty
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  StopOutlined,
  DownOutlined,
  ExportOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  CopyOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCouponList,
  setPagination,
  fetchCouponStats
} from '@/store/slices/couponSlice';
import { deleteCoupon, updateCouponStatus, CouponData } from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';
import BatchOperations from './batch-operations';
import LoadingWrapper from '@/components/LoadingWrapper';
import ActionFeedback, { useActionFeedback } from '@/components/ActionFeedback';
import ErrorBoundary from '@/components/ErrorBoundary';
import './list.css';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { message: contextMessage } = App.useApp(); // 使用App上下文中的message
  const { loading: actionLoading, withLoading, confirm } = useActionFeedback();

  // 本地状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  // 从Redux获取状态
  const { couponList, pagination, loading, stats } = useSelector((state: RootState) => state.coupon);
  
  // 初始加载
  useEffect(() => {
    fetchCoupons();
    dispatch(fetchCouponStats());
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取优惠券列表
  const fetchCoupons = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...values,
      // 处理日期范围
      startTime: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined
    };
    
    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }
    
    dispatch(fetchCouponList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchCoupons();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchCoupons();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 添加优惠券
  const handleAdd = () => {
    navigate('/coupon/create');
  };
  
  // 编辑优惠券
  const handleEdit = (record: CouponData) => {
    navigate(`/coupon/edit/${record.id}`);
  };
  
  // 删除优惠券
  const handleDelete = async (id: number) => {
    await withLoading(
      async () => {
        await deleteCoupon(id);
        fetchCoupons();
      },
      {
        successText: '删除成功',
        errorText: '删除失败，请重试',
        showErrorModal: true
      }
    );
  };
  
  // 更新优惠券状态
  const handleUpdateStatus = async (id: number, status: string) => {
    const statusText = status === 'ACTIVE' ? '启用' : '禁用';

    confirm({
      title: `确认${statusText}`,
      content: `确定要${statusText}此优惠券吗？`,
      onOk: async () => {
        await withLoading(
          async () => {
            await updateCouponStatus(id, status);
            fetchCoupons();
          },
          {
            successText: `${statusText}成功`,
            errorText: `${statusText}失败，请重试`,
            showSuccessNotification: true
          }
        );
      }
    });
  };
  
  // 确认删除
  const confirmDelete = (record: CouponData) => {
    confirm({
      title: '确认删除',
      content: `确定要删除优惠券 "${record.name}" 吗？此操作不可恢复。`,
      type: 'error',
      onOk: () => handleDelete(record.id)
    });
  };
  
  // 查看详情
  const viewDetail = (record: CouponData) => {
    navigate(`/coupon/detail/${record.id}`);
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      contextMessage.warning('请选择要删除的优惠券');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个优惠券吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setBatchLoading(true);
        try {
          // 这里应该调用批量删除API，暂时用循环删除模拟
          for (const id of selectedRowKeys) {
            await deleteCoupon(id as number);
          }
          contextMessage.success(`成功删除 ${selectedRowKeys.length} 个优惠券`);
          setSelectedRowKeys([]);
          fetchCoupons();
        } catch (error) {
          contextMessage.error('批量删除失败');
        } finally {
          setBatchLoading(false);
        }
      }
    });
  };

  // 批量更新状态
  const handleBatchUpdateStatus = async (status: string) => {
    if (selectedRowKeys.length === 0) {
      contextMessage.warning('请选择要操作的优惠券');
      return;
    }

    const statusText = status === 'ACTIVE' ? '启用' : '禁用';
    Modal.confirm({
      title: `批量${statusText}确认`,
      icon: <ExclamationCircleOutlined />,
      content: `确定要${statusText}选中的 ${selectedRowKeys.length} 个优惠券吗？`,
      okText: `确认${statusText}`,
      cancelText: '取消',
      onOk: async () => {
        setBatchLoading(true);
        try {
          // 这里应该调用批量更新状态API，暂时用循环更新模拟
          for (const id of selectedRowKeys) {
            await updateCouponStatus(id as number, status);
          }
          contextMessage.success(`成功${statusText} ${selectedRowKeys.length} 个优惠券`);
          setSelectedRowKeys([]);
          fetchCoupons();
        } catch (error) {
          contextMessage.error(`批量${statusText}失败`);
        } finally {
          setBatchLoading(false);
        }
      }
    });
  };

  // 导出优惠券数据
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // 这里应该调用导出API
      const params = form.getFieldsValue();
      // 模拟导出
      await new Promise(resolve => setTimeout(resolve, 2000));
      contextMessage.success('导出成功');
    } catch (error) {
      contextMessage.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 复制优惠券
  const handleCopy = (record: CouponData) => {
    navigate('/coupon/create', {
      state: {
        copyFrom: record,
        name: `${record.name}_副本`
      }
    });
  };

  // 发送优惠券
  const handleSend = (record: CouponData) => {
    // 这里可以打开发送优惠券的弹窗
    Modal.info({
      title: '发送优惠券',
      content: '发送优惠券功能开发中...',
    });
  };

  // 打开批量操作弹窗
  const handleBatchOperations = () => {
    if (selectedRowKeys.length === 0) {
      contextMessage.warning('请选择要操作的优惠券');
      return;
    }
    setBatchModalVisible(true);
  };

  // 批量操作成功回调
  const handleBatchSuccess = () => {
    setSelectedRowKeys([]);
    fetchCoupons();
    setBatchModalVisible(false);
  };

  // 获取选中的优惠券数据
  const getSelectedCoupons = (): CouponData[] => {
    return couponList.filter(coupon => selectedRowKeys.includes(coupon.id));
  };
  
  // 获取优惠券类型标签
  const getCouponTypeTag = (type: string) => {
    switch (type) {
      case 'FIXED':
        return <Tag color="blue">固定金额</Tag>;
      case 'PERCENTAGE':
        return <Tag color="green">折扣比例</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };
  
  // 获取优惠券状态标签
  const getCouponStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="success">生效中</Tag>;
      case 'INACTIVE':
        return <Tag color="default">未生效</Tag>;
      case 'EXPIRED':
        return <Tag color="error">已过期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<CouponData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      fixed: 'left' as const
    },
    {
      title: '优惠券信息',
      key: 'couponInfo',
      width: 280,
      fixed: 'left' as const,
      render: (_, record) => {
        const total = record.totalQuantity || 0;
        const received = record.receivedQuantity || 0;
        const remaining = total > 0 ? total - received : 0;
        
        return (
          <div>
            <div className="font-medium text-sm mb-1">
              <a onClick={() => viewDetail(record)} className="hover:text-blue-600">
                {record.name}
              </a>
            </div>
            <div className="flex items-center gap-2 mb-1">
              {getCouponTypeTag(record.type)}
              {record.type === 'FIXED' ? (
                <span className="text-red-600 font-bold">¥{record.value.toFixed(2)}</span>
              ) : (
                <span className="text-red-600 font-bold">{record.value}折</span>
              )}
              <span className="text-xs text-gray-500">
                {record.minSpend ? `满¥${record.minSpend.toFixed(2)}` : '无门槛'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {record.isStackable === 1 && (
                <Tag color="orange">可叠加</Tag>
              )}
              {total > 0 && (
                <span className="text-gray-500">剩余: {remaining}/{total}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => getCouponStatusTag(status)
    },
    {
      title: '使用情况',
      key: 'usage',
      width: 140,
      render: (_, record) => {
        const received = record.receivedQuantity || 0;
        const used = record.usedQuantity || 0;
        const usageRate = received > 0 ? (used / received * 100) : 0;

        return (
          <div className="text-xs">
            <div className="flex justify-between mb-1">
              <span>已领: {received}</span>
              <span>已用: {used}</span>
            </div>
            <Progress
              percent={Math.round(usageRate)}
              size="small"
              strokeColor="#52c41a"
              format={(percent) => `${percent}%`}
            />
          </div>
        );
      }
    },
    {
      title: '有效期',
      key: 'validPeriod',
      width: 160,
      render: (_, record) => {
        const now = new Date();
        const startTime = record.startTime ? new Date(record.startTime) : null;
        const endTime = record.endTime ? new Date(record.endTime) : null;

        let status = 'normal';
        if (startTime && now < startTime) {
          status = 'waiting';
        } else if (endTime && now > endTime) {
          status = 'expired';
        }

        return (
          <div className="text-xs">
            <div className="mb-1">
              {endTime ? formatDateTime(record.endTime!, 'YYYY-MM-DD') : '永久有效'}
            </div>
            {status === 'waiting' && (
              <Badge status="processing" text="未开始" />
            )}
            {status === 'expired' && (
              <Badge status="error" text="已过期" />
            )}
            {status === 'normal' && startTime && endTime && (
              <Badge status="success" text="进行中" />
            )}
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'copy',
            label: '复制',
            icon: <CopyOutlined />,
            onClick: () => handleCopy(record)
          },
          {
            key: 'send',
            label: '发送',
            icon: <SendOutlined />,
            onClick: () => handleSend(record)
          },
          {
            type: 'divider' as const
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => confirmDelete(record)
          }
        ];

        // 处理菜单点击
        const handleMenuClick = ({ key }: { key: string }) => {
          const item = menuItems.find(item => item.key === key);
          if (item && 'onClick' in item) {
            item.onClick();
          }
        };

        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewDetail(record)}
              className="action-btn"
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="action-btn"
            >
              编辑
            </Button>
            <Dropdown
              menu={{
                items: [
                  ...(record.status === 'ACTIVE' ? [
                    {
                      key: 'disable',
                      icon: <StopOutlined />,
                      label: '停用',
                      danger: true,
                      onClick: () => handleUpdateStatus(record.id, 'INACTIVE')
                    }
                  ] : [
                    {
                      key: 'enable',
                      icon: <CheckCircleOutlined />,
                      label: '启用',
                      onClick: () => handleUpdateStatus(record.id, 'ACTIVE')
                    }
                  ]),
                  {
                    type: 'divider' as const
                  },
                  ...menuItems
                ],
                onClick: handleMenuClick
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="action-more-btn"
              />
            </Dropdown>
          </Space>
        );
      }
    }
  ];
  
  return (
    <ErrorBoundary>
      <App> {/* 使用App组件作为上下文提供者 */}
        <div className="coupon-list-container" style={{ padding: '24px' }}>
          <LoadingWrapper
            loading={loading && couponList.length === 0}
            empty={!loading && couponList.length === 0}
            emptyDescription="暂无优惠券数据，点击添加优惠券开始创建"
            onRetry={fetchCoupons}
          >
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title="优惠券总数"
                value={stats?.totalCoupons || 0}
                suffix="张"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已领取优惠券"
                value={stats?.receivedCount || 0}
                suffix="张"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已使用优惠券"
                value={stats?.usedCoupons || 0}
                suffix="张"
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已过期优惠券"
                value={stats?.expiredCoupons || 0}
                suffix="张"
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        </Card>
        
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>优惠券列表</Title>
            <Space>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                loading={exportLoading}
              >
                导出
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterVisible(!filterVisible)}
              >
                {filterVisible ? '收起筛选' : '展开筛选'}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加优惠券
              </Button>
            </Space>
          </div>

          {/* 批量操作工具栏 */}
          {selectedRowKeys.length > 0 && (
            <Alert
              message={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      icon={<MoreOutlined />}
                      onClick={handleBatchOperations}
                    >
                      批量操作
                    </Button>
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleBatchUpdateStatus('ACTIVE')}
                      loading={batchLoading}
                    >
                      批量启用
                    </Button>
                    <Button
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleBatchUpdateStatus('INACTIVE')}
                      loading={batchLoading}
                    >
                      批量禁用
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                      loading={batchLoading}
                    >
                      批量删除
                    </Button>
                    <Button
                      size="small"
                      icon={<ExportOutlined />}
                      onClick={handleExport}
                      loading={exportLoading}
                    >
                      导出选中
                    </Button>
                    <Button
                      size="small"
                      icon={<ClearOutlined />}
                      onClick={() => setSelectedRowKeys([])}
                    >
                      取消选择
                    </Button>
                  </Space>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 筛选表单 */}
          {filterVisible && (
            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}>
              <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
              >
                <Row gutter={[16, 16]} style={{ width: '100%' }}>
                  <Col span={6}>
                    <Form.Item name="name" label="优惠券名称">
                      <Input placeholder="请输入优惠券名称" allowClear />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item name="type" label="优惠券类型">
                      <Select placeholder="请选择类型" allowClear>
                        <Option value="FIXED">固定金额</Option>
                        <Option value="PERCENTAGE">折扣比例</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item name="status" label="状态">
                      <Select placeholder="请选择状态" allowClear>
                        <Option value="ACTIVE">生效中</Option>
                        <Option value="INACTIVE">未生效</Option>
                        <Option value="EXPIRED">已过期</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item name="timeRange" label="有效期">
                      <RangePicker placeholder={['开始日期', '结束日期']} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          搜索
                        </Button>
                        <Button onClick={resetQuery} icon={<ClearOutlined />}>
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          )}
          
          <Table
            rowKey="id"
            columns={columns}
            dataSource={couponList}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: false, // 可以根据需要禁用某些行的选择
              }),
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条记录`,
              onChange: handlePageChange,
              onShowSizeChange: handleSizeChange,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            loading={loading || actionLoading}
            scroll={{ x: 900 }}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无优惠券数据"
                >
                  <Button type="primary" onClick={handleAdd}>
                    立即创建
                  </Button>
                </Empty>
              )
            }}
            size="middle"
          />
        </Card>
          </LoadingWrapper>

        {/* 批量操作弹窗 */}
        <BatchOperations
          visible={batchModalVisible}
          onCancel={() => setBatchModalVisible(false)}
          selectedCoupons={getSelectedCoupons()}
          onSuccess={handleBatchSuccess}
        />
        </div>
      </App>
    </ErrorBoundary>
  );
};

export default CouponList; 