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
  message
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
  GiftOutlined
} from '@ant-design/icons';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponDetail, clearCouponDetail } from '@/store/slices/couponSlice';
import { deleteCoupon, updateCouponStatus } from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';

const { Title, Text } = Typography;

const CouponDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

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
        {/* 页面头部 */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button icon={<ArrowLeftOutlined />} onClick={goBack} style={{ marginRight: '16px' }}>
                返回
              </Button>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {couponDetail.name}
                </Title>
                <Text type="secondary">优惠券详情</Text>
              </div>
            </div>
            
            <Space>
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

        <Row gutter={24}>
          {/* 基本信息 */}
          <Col span={16}>
            <Card title="基本信息" style={{ marginBottom: '24px' }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="优惠券名称" span={2}>
                  {couponDetail.name}
                </Descriptions.Item>
                <Descriptions.Item label="优惠券类型">
                  {getCouponTypeTag(couponDetail.type)}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  {getCouponStatusTag(couponDetail.status)}
                </Descriptions.Item>
                <Descriptions.Item label="面值/折扣">
                  {couponDetail.type === 'FIXED' 
                    ? `¥${couponDetail.value.toFixed(2)}`
                    : `${couponDetail.value}折`
                  }
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
                  {couponDetail.isStackable ? '可叠加' : '不可叠加'}
                </Descriptions.Item>
                <Descriptions.Item label="每用户限领">
                  {couponDetail.userLimit || 1}张
                </Descriptions.Item>
                <Descriptions.Item label="有效期开始">
                  {formatDateTime(couponDetail.startTime)}
                </Descriptions.Item>
                <Descriptions.Item label="有效期结束">
                  {formatDateTime(couponDetail.endTime)}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDateTime(couponDetail.createTime)}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {formatDateTime(couponDetail.updateTime)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* 统计信息 */}
          <Col span={8}>
            <Card title="使用统计" style={{ marginBottom: '24px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="发行总量"
                    value={couponDetail.totalQuantity || 0}
                    suffix="张"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="已领取"
                    value={couponDetail.receivedQuantity || 0}
                    suffix="张"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12} style={{ marginTop: '16px' }}>
                  <Statistic
                    title="已使用"
                    value={couponDetail.usedQuantity || 0}
                    suffix="张"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col span={12} style={{ marginTop: '16px' }}>
                  <Statistic
                    title="剩余数量"
                    value={(couponDetail.totalQuantity || 0) - (couponDetail.receivedQuantity || 0)}
                    suffix="张"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <div>
                <Text strong>领取进度</Text>
                <Progress 
                  percent={getUsageRate()} 
                  status={getUsageRate() >= 100 ? 'success' : 'active'}
                  style={{ marginTop: '8px' }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
  );
};

export default CouponDetail;
