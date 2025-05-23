import React from 'react';
import { Breadcrumb, Button, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { cn } from '@/lib/utils';
import MotionWrapper from '../animations/MotionWrapper';

export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

export interface ActionButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'text' | 'link' | 'dashed';
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  danger?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ActionButton[];
  extra?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  showAnimation?: boolean;
}

/**
 * 页面标题组件
 * 用于展示页面标题、面包屑导航和操作按钮
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  extra,
  className,
  titleClassName,
  showAnimation = true,
}) => {
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <Breadcrumb className="mb-2">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        {breadcrumbs.map((item, index) => (
          <Breadcrumb.Item key={index}>
            {item.path ? (
              <Link to={item.path}>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.title}
              </Link>
            ) : (
              <>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.title}
              </>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  const renderActions = () => {
    if (actions.length === 0 && !extra) return null;

    return (
      <div className="flex items-center gap-2">
        <Space>
          {actions.map((action) => (
            <Tooltip key={action.key} title={action.tooltip}>
              <Button
                type={action.type || 'default'}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                danger={action.danger}
              >
                {action.label}
              </Button>
            </Tooltip>
          ))}
        </Space>
        {extra && <div className="ml-2">{extra}</div>}
      </div>
    );
  };

  const content = (
    <div className={cn('mb-6', className)}>
      {renderBreadcrumbs()}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={cn('text-2xl font-bold text-gray-800 dark:text-gray-100', titleClassName)}>
            {title}
          </h1>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {renderActions()}
      </div>
    </div>
  );

  if (showAnimation) {
    return (
      <MotionWrapper animation="slideDown" delay={0.1}>
        {content}
      </MotionWrapper>
    );
  }

  return content;
};

export default PageHeader; 