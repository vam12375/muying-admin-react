import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Collapse, Alert } from 'antd';
import { 
  ReloadOutlined, 
  BugOutlined, 
  HomeOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境下打印错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // 在生产环境下可以发送错误报告到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成错误监控服务，如 Sentry
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误页面
      return (
        <div style={{ padding: '50px 24px' }}>
          <Result
            status="error"
            title="页面出现错误"
            subTitle="抱歉，页面遇到了一些问题。您可以尝试刷新页面或返回首页。"
            extra={[
              <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={this.handleRetry}>
                重试
              </Button>,
              <Button key="reload" icon={<ReloadOutlined />} onClick={this.handleReload}>
                刷新页面
              </Button>,
              <Button key="home" icon={<HomeOutlined />} onClick={this.handleGoHome}>
                返回首页
              </Button>
            ]}
          >
            {/* 开发环境下显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ textAlign: 'left', marginTop: 24 }}>
                <Alert
                  message="开发环境错误详情"
                  type="warning"
                  showIcon
                  icon={<BugOutlined />}
                  style={{ marginBottom: 16 }}
                />
                
                <Collapse>
                  <Panel header="错误详情" key="error-details">
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>错误消息：</Text>
                      <Paragraph code copyable>
                        {this.state.error.message}
                      </Paragraph>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>错误堆栈：</Text>
                      <Paragraph code copyable style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error.stack}
                      </Paragraph>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <Text strong>组件堆栈：</Text>
                        <Paragraph code copyable style={{ whiteSpace: 'pre-wrap' }}>
                          {this.state.errorInfo.componentStack}
                        </Paragraph>
                      </div>
                    )}
                  </Panel>
                </Collapse>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

// 高阶组件版本
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook 版本（用于函数组件）
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    // 在开发环境下打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', error, errorInfo);
    }

    // 在生产环境下发送错误报告
    if (process.env.NODE_ENV === 'production') {
      // 发送到错误监控服务
      // Sentry.captureException(error, { extra: errorInfo });
    }
  };

  return { handleError };
};

export default ErrorBoundary;
