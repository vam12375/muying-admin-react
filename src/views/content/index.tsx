import React, { useState } from 'react';
import { Tabs, Typography, Breadcrumb, Spin } from 'antd';
import { 
  CalendarOutlined,
  FileSearchOutlined,
  PictureOutlined,
  FormOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// 将会导入的子页面组件
const ContentCalendar = React.lazy(() => import('./Calendar'));
const SeoTools = React.lazy(() => import('./SeoTools'));
const MediaLibrary = React.lazy(() => import('./MediaLibrary'));
const TemplateManage = React.lazy(() => import('./Templates'));

const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * 内容管理主页面
 */
const ContentManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('calendar');
  
  // 从路径中提取活动标签
  React.useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'content') {
      setActiveTab(path);
    } else {
      setActiveTab('calendar');
    }
  }, [location]);
  
  // 处理标签切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    navigate(`/content/${key === 'calendar' ? '' : key}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="content-management-container p-6"
    >
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>内容管理</Breadcrumb.Item>
        <Breadcrumb.Item>
          {activeTab === 'calendar' && '内容日历'}
          {activeTab === 'seo' && 'SEO工具'}
          {activeTab === 'media' && '媒体库'}
          {activeTab === 'templates' && '模板管理'}
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">内容管理</Title>
      </div>
      
      {/* 标签导航 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="content-tabs"
        type="card"
      >
        <TabPane 
          tab={<span><CalendarOutlined />内容日历</span>} 
          key="calendar"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <ContentCalendar />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><FileSearchOutlined />SEO工具</span>} 
          key="seo"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <SeoTools />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><PictureOutlined />媒体库</span>} 
          key="media"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <MediaLibrary />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><FormOutlined />模板管理</span>} 
          key="templates"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <TemplateManage />
          </React.Suspense>
        </TabPane>
      </Tabs>
    </motion.div>
  );
};

export default ContentManagement; 