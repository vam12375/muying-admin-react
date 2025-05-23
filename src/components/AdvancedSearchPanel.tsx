import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  Divider,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DownOutlined, 
  UpOutlined 
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import type { FormInstance } from 'antd';

const StyledCard = styled(Card)`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
  
  .header-title {
    font-weight: 500;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-content {
    background-color: rgba(0, 0, 0, 0.01);
    padding: 24px;
    overflow: hidden;
  }
  
  .search-button-group {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
`;

// 组件属性接口
interface AdvancedSearchPanelProps {
  title?: string;
  defaultExpanded?: boolean;
  onSearch?: (values: any) => void;
  onReset?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  extra?: React.ReactNode;
  form?: FormInstance;
}

/**
 * 高级搜索面板组件
 * 提供可折叠的搜索表单面板，包含搜索和重置按钮
 */
const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  title = '高级搜索',
  defaultExpanded = true,
  onSearch,
  onReset,
  children,
  loading = false,
  extra,
  form: externalForm
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  // 切换展开/收起状态
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // 处理搜索提交
  const handleSearch = () => {
    form.validateFields().then(values => {
      if (onSearch) {
        onSearch(values);
      }
    }).catch(errorInfo => {
      console.log('表单验证失败:', errorInfo);
    });
  };
  
  // 处理重置
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <StyledCard bordered={undefined} className="advanced-search-panel">
      <motion.div
        className="search-header"
        onClick={toggleExpanded}
        whileTap={{ scale: 0.98 }}
      >
        <div className="header-title">
          <SearchOutlined />
          {title}
        </div>
        
        <Space>
          {extra}
          <Button 
            type="text" 
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          />
        </Space>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider style={{ margin: 0 }} />
            
            <div className="search-content">
              <Form
                form={form}
                layout="vertical"
                name="advanced_search"
              >
                <Row gutter={[16, 0]}>
                  {children}
                </Row>
                
                <div className="search-button-group">
                  <Space>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleReset}
                    >
                      重置
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />} 
                      onClick={handleSearch}
                      loading={loading}
                    >
                      搜索
                    </Button>
                  </Space>
                </div>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledCard>
  );
};

export default AdvancedSearchPanel; 