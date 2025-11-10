import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Tag,
  Divider,
  Spin,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  message,
  Modal,
  Table,
  Tabs,
  Image,
  Alert,
  Badge,
  Tooltip,
  Empty,
  QRCode,
  Chart
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  TagOutlined,
  GiftOutlined,
  ShareAltOutlined,
  CopyOutlined,
  SendOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponDetail, clearCouponDetail } from '@/store/slices/couponSlice';
import { deleteCoupon, updateCouponStatus } from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CouponDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);

  const { couponDetail } = useSelector((state: RootState) => state.coupon);

  useEffect(() => {
    if (id) {
      dispatch(fetchCouponDetail(id));
    }
    
    return () => {
      dispatch(clearCouponDetail());
    };
  }, [id, dispatch]);

  // 返回列表
  const goBack = () => {
    navigate('/coupon/list');
  };

  // 编辑优惠券
  const handleEdit = () => {
    navigate(`/coupon/edit/${id}`);
  };

  // 删除优惠券
  const handleDelete = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      await deleteCoupon(id);
      message.success('删除成功');
      navigate('/coupon/list');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新状态
  const handleUpdateStatus = async (status: string) => {
    if (!id) return;

    Modal.confirm({
      title: '确认操作',
      icon: <ExclamationCircleOutlined />,
      content: `确定要${status === 'ACTIVE' ? '启用' : '禁用'}此优惠券吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await updateCouponStatus(id, status);
          message.success('状态更新成功');
          dispatch(fetchCouponDetail(id));
        } catch (error) {
          message.error('状态更新失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 复制优惠券
  const handleCopy = () => {
    if (couponDetail) {
      navigate('/coupon/create', {
        state: {
          copyFrom: couponDetail,
          name: `${couponDetail.name}_副本`
        }
      });
    }
  };

  // 分享优惠券
  const handleShare = () => {
    setShareModalVisible(true);
  };

  // 导出数据
  const handleExport = () => {
    // 这里应该调用导出API
    message.success('导出功能开发中...');
  };

  // 发送优惠券
  const handleSend = () => {
    Modal.info({
      title: '发送优惠券',
      content: '发送优惠券功能开发中...',
    });
  };

  // 获取优惠券类型标签
  const getCouponTypeTag = (type: string) => {
    switch (type) {
      case 'FIXED':
        return <Tag color="blue" icon={<GiftOutlined />}>固定金额</Tag>;
      case 'PERCENTAGE':
        return <Tag color="green" icon={<TagOutlined />}>折扣比例</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  // 获取优惠券状态标签
  const getCouponStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="success" icon={<PlayCircleOutlined />}>生效中</Tag>;
      case 'INACTIVE':
        return <Tag color="default" icon={<StopOutlined />}>未生效</Tag>;
      case 'EXPIRED':
        return <Tag color="error" icon={<CalendarOutlined />}>已过期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // 计算使用率
  const getUsageRate = () => {
    if (!couponDetail || !couponDetail.totalQuantity) return 0;
    return Math.round((couponDetail.receivedQuantity || 0) / couponDetail.totalQuantity * 100);
  };

  if (!couponDetail) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={!couponDetail}>
        {couponDetail && (
          <>
            {/* 页面头部 */}
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={goBack} style={{ marginRight: '16px' }}>
                    返回
                  </Button>
                  <div>
                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                      {couponDetail.name}
                      <div style={{ marginLeft: '12px' }}>
                        {getCouponStatusTag(couponDetail.status)}
                      </div>
                    </Title>
                    <Text type="secondary">优惠券详情 · ID: {couponDetail.id}</Text>
                  </div>
                </div>

                <Space>
                  <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                    分享
                  </Button>
                  <Button icon={<CopyOutlined />} onClick={handleCopy}>
                    复制
                  </Button>
                  <Button icon={<SendOutlined />} onClick={handleSend}>
                    发送
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    编辑
                  </Button>
                  {couponDetail.status === 'ACTIVE' ? (
                    <Button
                      danger
                      icon={<StopOutlined />}
                      onClick={() => handleUpdateStatus('INACTIVE')}
                      loading={loading}
                    >
                      停用
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      loading={loading}
                    >
                      启用
                    </Button>
                  )}
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    loading={loading}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </Card>

            {/* 统计概览 */}
            <Row gutter={24} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="发行总量"
                    value={couponDetail.totalQuantity || 0}
                    suffix="张"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="已领取"
                    value={couponDetail.receivedQuantity || 0}
                    suffix="张"
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<UserOutlined />}
                  />
                  {couponDetail.totalQuantity > 0 && (
                    <Progress
                      percent={Math.round(((couponDetail.receivedQuantity || 0) / couponDetail.totalQuantity) * 100)}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="已使用"
                    value={couponDetail.usedQuantity || 0}
                    suffix="张"
                    valueStyle={{ color: '#faad14' }}
                    prefix={<CheckCircleOutlined />}
                  />
                  {couponDetail.receivedQuantity > 0 && (
                    <Progress
                      percent={Math.round(((couponDetail.usedQuantity || 0) / couponDetail.receivedQuantity) * 100)}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="使用率"
                    value={couponDetail.receivedQuantity > 0 ?
                      Math.round(((couponDetail.usedQuantity || 0) / couponDetail.receivedQuantity) * 100) : 0}
                    suffix="%"
                    valueStyle={{
                      color: couponDetail.receivedQuantity > 0 &&
                        ((couponDetail.usedQuantity || 0) / couponDetail.receivedQuantity) > 0.5 ?
                        '#52c41a' : '#faad14'
                    }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* 详细信息标签页 */}
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="基本信息" key="basic" icon={<TagOutlined />}>
                <Card>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="优惠券名称" span={2}>
                      <Text strong>{couponDetail.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="描述信息" span={2}>
                      <Paragraph>{couponDetail.description || '暂无描述'}</Paragraph>
                    </Descriptions.Item>
                    <Descriptions.Item label="优惠券类型">
                      {getCouponTypeTag(couponDetail.type)}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {getCouponStatusTag(couponDetail.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="面值/折扣">
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {couponDetail.type === 'FIXED'
                          ? `¥${couponDetail.value.toFixed(2)}`
                          : `${couponDetail.value}折`
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="最低消费">
                      {couponDetail.minSpend > 0
                        ? `¥${couponDetail.minSpend.toFixed(2)}`
                        : '无限制'
                      }
                    </Descriptions.Item>
                    {couponDetail.type === 'PERCENTAGE' && couponDetail.maxDiscount && (
                      <Descriptions.Item label="最大折扣" span={2}>
                        ¥{couponDetail.maxDiscount.toFixed(2)}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="是否可叠加">
                      <Badge
                        status={couponDetail.isStackable ? 'success' : 'default'}
                        text={couponDetail.isStackable ? '可叠加' : '不可叠加'}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="每用户限领">
                      {couponDetail.userLimit || 1}张
                    </Descriptions.Item>
                    <Descriptions.Item label="优先级">
                      {couponDetail.priority || 1}
                    </Descriptions.Item>
                    <Descriptions.Item label="自动发放">
                      <Badge
                        status={couponDetail.autoReceive ? 'processing' : 'default'}
                        text={couponDetail.autoReceive ? '是' : '否'}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="有效期开始">
                      <Text>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {formatDateTime(couponDetail.startTime)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="有效期结束">
                      <Text>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {formatDateTime(couponDetail.endTime)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {formatDateTime(couponDetail.createTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="更新时间">
                      {formatDateTime(couponDetail.updateTime)}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </TabPane>

              <TabPane tab="使用规则" key="rules" icon={<ExclamationCircleOutlined />}>
                <Card>
                  <Alert
                    message="使用规则"
                    description="以下是该优惠券的详细使用规则和限制条件"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="适用范围">
                      {couponDetail.categoryIds || couponDetail.brandIds || couponDetail.productIds ?
                        '指定商品/分类/品牌' : '全场通用'}
                    </Descriptions.Item>
                    <Descriptions.Item label="使用条件">
                      {couponDetail.minSpend > 0 ?
                        `订单满 ¥${couponDetail.minSpend.toFixed(2)} 可用` :
                        '无最低消费限制'}
                    </Descriptions.Item>
                    <Descriptions.Item label="叠加规则">
                      {couponDetail.isStackable ? '可与其他优惠券叠加使用' : '不可与其他优惠券叠加'}
                    </Descriptions.Item>
                    <Descriptions.Item label="领取限制">
                      每个用户最多可领取 {couponDetail.userLimit || 1} 张
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </TabPane>

              <TabPane tab="使用记录" key="usage" icon={<BarChartOutlined />}>
                <Card>
                  <Empty description="使用记录功能开发中..." />
                </Card>
              </TabPane>

              <TabPane tab="分享设置" key="share" icon={<ShareAltOutlined />}>
                <Card>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Title level={5}>二维码分享</Title>
                      <div style={{ textAlign: 'center', padding: 24, border: '1px dashed #d9d9d9' }}>
                        <QRCode
                          value={`https://example.com/coupon/${couponDetail.id}`}
                          size={200}
                        />
                        <div style={{ marginTop: 16 }}>
                          <Text type="secondary">扫码领取优惠券</Text>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Title level={5}>分享链接</Title>
                      <div style={{ marginBottom: 16 }}>
                        <Text code copyable>
                          https://example.com/coupon/{couponDetail.id}
                        </Text>
                      </div>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button block icon={<CopyOutlined />}>
                          复制链接
                        </Button>
                        <Button block icon={<SendOutlined />}>
                          发送给用户
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </TabPane>
            </Tabs>

            {/* 分享弹窗 */}
            <Modal
              title="分享优惠券"
              visible={shareModalVisible}
              onCancel={() => setShareModalVisible(false)}
              footer={null}
              width={600}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <QRCode
                      value={`https://example.com/coupon/${couponDetail.id}`}
                      size={200}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text>扫码领取优惠券</Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block type="primary" icon={<CopyOutlined />}>
                      复制分享链接
                    </Button>
                    <Button block icon={<SendOutlined />}>
                      发送给指定用户
                    </Button>
                    <Button block icon={<DownloadOutlined />}>
                      下载二维码
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Modal>
          </>
        )}
      </Spin>
    </div>
  );
};

export default CouponDetail;
