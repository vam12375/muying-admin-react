import React, { useState, useEffect } from 'react';
import { message, notification, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

export interface ActionFeedbackOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title?: string;
  content?: string;
  duration?: number;
  showNotification?: boolean;
  showModal?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

class ActionFeedback {
  private static loadingMessage: any = null;

  // 显示成功消息
  static success(content: string, options?: Partial<ActionFeedbackOptions>) {
    const { showNotification = false, duration = 3 } = options || {};
    
    if (showNotification) {
      notification.success({
        message: '操作成功',
        description: content,
        duration,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } else {
      message.success(content, duration);
    }
  }

  // 显示错误消息
  static error(content: string, options?: Partial<ActionFeedbackOptions>) {
    const { showNotification = false, showModal = false, duration = 3 } = options || {};
    
    if (showModal) {
      Modal.error({
        title: '操作失败',
        content,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } else if (showNotification) {
      notification.error({
        message: '操作失败',
        description: content,
        duration,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } else {
      message.error(content, duration);
    }
  }

  // 显示警告消息
  static warning(content: string, options?: Partial<ActionFeedbackOptions>) {
    const { showNotification = false, duration = 3 } = options || {};
    
    if (showNotification) {
      notification.warning({
        message: '警告',
        description: content,
        duration,
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      });
    } else {
      message.warning(content, duration);
    }
  }

  // 显示信息消息
  static info(content: string, options?: Partial<ActionFeedbackOptions>) {
    const { showNotification = false, duration = 3 } = options || {};
    
    if (showNotification) {
      notification.info({
        message: '提示',
        description: content,
        duration,
        icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
      });
    } else {
      message.info(content, duration);
    }
  }

  // 显示加载消息
  static loading(content: string = '处理中...', duration: number = 0) {
    this.hideLoading(); // 先隐藏之前的loading
    this.loadingMessage = message.loading(content, duration);
    return this.loadingMessage;
  }

  // 隐藏加载消息
  static hideLoading() {
    if (this.loadingMessage) {
      this.loadingMessage();
      this.loadingMessage = null;
    }
  }

  // 确认对话框
  static confirm(options: {
    title: string;
    content: string;
    onOk: () => void | Promise<void>;
    onCancel?: () => void;
    okText?: string;
    cancelText?: string;
    type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
  }) {
    const { title, content, onOk, onCancel, okText = '确定', cancelText = '取消', type = 'confirm' } = options;
    
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      icon: type === 'error' ? <CloseCircleOutlined /> : 
            type === 'warning' ? <ExclamationCircleOutlined /> :
            type === 'success' ? <CheckCircleOutlined /> :
            type === 'info' ? <InfoCircleOutlined /> : <ExclamationCircleOutlined />,
      onOk,
      onCancel
    });
  }

  // 异步操作包装器
  static async withLoading<T>(
    asyncFn: () => Promise<T>,
    options?: {
      loadingText?: string;
      successText?: string;
      errorText?: string;
      showSuccessNotification?: boolean;
      showErrorModal?: boolean;
    }
  ): Promise<T> {
    const {
      loadingText = '处理中...',
      successText = '操作成功',
      errorText = '操作失败',
      showSuccessNotification = false,
      showErrorModal = false
    } = options || {};

    const hide = this.loading(loadingText);
    
    try {
      const result = await asyncFn();
      hide();
      
      if (successText) {
        this.success(successText, { showNotification: showSuccessNotification });
      }
      
      return result;
    } catch (error: any) {
      hide();
      
      const errorMessage = error?.message || error?.toString() || errorText;
      this.error(errorMessage, { showModal: showErrorModal });
      
      throw error;
    }
  }
}

// React Hook 版本
export const useActionFeedback = () => {
  const [loading, setLoading] = useState(false);

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    options?: {
      successText?: string;
      errorText?: string;
      showSuccessNotification?: boolean;
      showErrorModal?: boolean;
    }
  ): Promise<T | undefined> => {
    const {
      successText = '操作成功',
      errorText = '操作失败',
      showSuccessNotification = false,
      showErrorModal = false
    } = options || {};

    setLoading(true);
    
    try {
      const result = await asyncFn();
      
      if (successText) {
        ActionFeedback.success(successText, { showNotification: showSuccessNotification });
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || errorText;
      ActionFeedback.error(errorMessage, { showModal: showErrorModal });
      
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    withLoading,
    success: ActionFeedback.success,
    error: ActionFeedback.error,
    warning: ActionFeedback.warning,
    info: ActionFeedback.info,
    confirm: ActionFeedback.confirm
  };
};

export default ActionFeedback;
