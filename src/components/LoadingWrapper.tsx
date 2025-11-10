import React from 'react';
import { Spin, Result, Button, Empty } from 'antd';
import { LoadingOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface LoadingWrapperProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyDescription?: string;
  children: React.ReactNode;
  onRetry?: () => void;
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyDescription = '暂无数据',
  children,
  onRetry,
  size = 'default',
  tip = '加载中...'
}) => {
  // 错误状态
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={
          onRetry && (
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
              重新加载
            </Button>
          )
        }
      />
    );
  }

  // 空数据状态
  if (empty && !loading) {
    return (
      <Empty
        description={emptyDescription}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {onRetry && (
          <Button type="primary" onClick={onRetry}>
            刷新数据
          </Button>
        )}
      </Empty>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        flexDirection: 'column'
      }}>
        <Spin 
          size={size} 
          tip={tip}
          indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />}
        />
      </div>
    );
  }

  // 正常内容
  return <>{children}</>;
};

export default LoadingWrapper;
