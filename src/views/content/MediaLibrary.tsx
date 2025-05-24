import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Row, Col, Upload, Button, Input, Select, Space, Empty, Image, Tabs, Tag, Tooltip, Dropdown, Menu, Modal, Form, Radio, message } from 'antd';
import { 
  PlusOutlined, 
  InboxOutlined, 
  SearchOutlined, 
  FolderOutlined, 
  PictureOutlined,
  VideoCameraOutlined,
  FileOutlined,
  SoundOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CloudUploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { MediaAsset } from '@/api/content';
import { contentApi } from '@/api/content';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

/**
 * 媒体库页面
 */
const MediaLibrary: React.FC = () => {
  // 状态定义
  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaAsset | null>(null);
  const [form] = Form.useForm();
  
  // 加载媒体数据
  const loadMediaList = async () => {
    setLoading(true);
    try {
      const response = await contentApi.getMediaList(1, 50, activeTab !== 'all' ? activeTab : undefined);
      setMediaList(response.list);
    } catch (error) {
      console.error('加载媒体资源失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和筛选条件变化时重新加载
  useEffect(() => {
    loadMediaList();
  }, [activeTab, currentFolder]);
  
  // 处理搜索
  const handleSearch = () => {
    loadMediaList();
  };
  
  // 显示编辑弹窗
  const showEditModal = (media: MediaAsset) => {
    setCurrentMedia(media);
    form.setFieldsValue({
      name: media.name,
      alt: media.alt || '',
      description: media.description || '',
      tags: media.tags ? media.tags.join(', ') : ''
    });
    setEditModalVisible(true);
  };
  
  // 显示预览弹窗
  const showPreviewModal = (media: MediaAsset) => {
    setCurrentMedia(media);
    setPreviewVisible(true);
  };
  
  // 保存媒体编辑
  const handleSaveEdit = () => {
    form.validateFields().then(values => {
      if (!currentMedia) return;
      
      const updatedMedia = {
        ...currentMedia,
        name: values.name,
        alt: values.alt,
        description: values.description,
        tags: values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      };
      
      // 在实际应用中，这里会调用API保存更改
      // 这里只是模拟更新本地状态
      setMediaList(mediaList.map(item => item.id === currentMedia.id ? updatedMedia : item));
      message.success('资源更新成功');
      setEditModalVisible(false);
    });
  };
  
  // 过滤当前显示的媒体列表
  const filteredMediaList = mediaList.filter(media => {
    // 文件夹筛选
    if (currentFolder !== 'all' && media.folder !== currentFolder) {
      return false;
    }
    
    // 关键词搜索
    if (searchKeyword && !media.name.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 渲染媒体项（网格视图）
  const renderMediaItem = (media: MediaAsset) => {
    // 根据媒体类型选择图标
    const getTypeIcon = () => {
      switch (media.type) {
        case 'image':
          return <PictureOutlined />;
        case 'video':
          return <VideoCameraOutlined />;
        case 'document':
          return <FileOutlined />;
        case 'audio':
          return <SoundOutlined />;
        default:
          return <FileOutlined />;
      }
    };
    
    // 操作菜单
    const actionMenu = (
      <Menu>
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => showEditModal(media)}>
          编辑
        </Menu.Item>
        <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => showPreviewModal(media)}>
          预览
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
          删除
        </Menu.Item>
      </Menu>
    );
    
    return (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} key={media.id}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            hoverable
            cover={
              media.type === 'image' ? (
                <div 
                  className="media-thumb" 
                  style={{ 
                    height: 150,
                    backgroundImage: `url(${media.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => showPreviewModal(media)}
                />
              ) : (
                <div 
                  className="media-thumb flex justify-center items-center" 
                  style={{ height: 150, background: '#f5f5f5' }}
                >
                  {getTypeIcon()}
                </div>
              )
            }
            bodyStyle={{ padding: '12px' }}
            actions={[
              <Tooltip title="编辑"><EditOutlined key="edit" onClick={() => showEditModal(media)} /></Tooltip>,
              <Tooltip title="预览"><EyeOutlined key="preview" onClick={() => showPreviewModal(media)} /></Tooltip>,
              <Dropdown overlay={actionMenu} trigger={['click']}>
                <MoreOutlined key="more" />
              </Dropdown>
            ]}
          >
            <div className="media-info">
              <Tooltip title={media.name}>
                <div className="media-name text-sm font-medium truncate mb-1">{media.name}</div>
              </Tooltip>
              <div className="media-meta text-xs text-gray-500 flex justify-between">
                <span>{(media.size / 1024).toFixed(1)} KB</span>
                {media.dimensions && (
                  <span>{media.dimensions.width}×{media.dimensions.height}</span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </Col>
    );
  };
  
  return (
    <div className="media-library-container">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex justify-between items-center">
          <Title level={4} className="m-0">媒体库</Title>
          
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={() => message.info('上传功能正在开发中')}
          >
            <Button type="primary" icon={<CloudUploadOutlined />}>
              上传文件
            </Button>
          </Upload>
        </div>
        
        <Alert
          message="功能开发中"
          description="媒体库功能正在开发中，目前仅展示基础界面和模拟数据，敬请期待完整功能！"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="搜索媒体文件"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ maxWidth: 300 }}
            />
            
            <Select
              placeholder="文件夹"
              style={{ width: 120 }}
              value={currentFolder}
              onChange={(value) => setCurrentFolder(value)}
            >
              <Option value="all">全部</Option>
              <Option value="默认">默认</Option>
              <Option value="产品图片">产品图片</Option>
              <Option value="Banner">Banner</Option>
            </Select>
            
            <Select
              placeholder="排序方式"
              style={{ width: 120 }}
              defaultValue="newest"
            >
              <Option value="newest">最新上传</Option>
              <Option value="oldest">最早上传</Option>
              <Option value="name_asc">名称升序</Option>
              <Option value="name_desc">名称降序</Option>
              <Option value="size_asc">大小升序</Option>
              <Option value="size_desc">大小降序</Option>
            </Select>
            
            <div className="flex-1"></div>
            
            <Radio.Group
              defaultValue="grid"
              buttonStyle="solid"
              onChange={(e) => setViewMode(e.target.value)}
            >
              <Radio.Button value="grid">网格视图</Radio.Button>
              <Radio.Button value="list">列表视图</Radio.Button>
            </Radio.Group>
          </div>
        </Card>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="图片" key="image" />
          <TabPane tab="视频" key="video" />
          <TabPane tab="文档" key="document" />
          <TabPane tab="音频" key="audio" />
        </Tabs>
        
        <Card>
          {loading ? (
            <div className="py-12 text-center">
              <Title level={5}>加载中...</Title>
            </div>
          ) : filteredMediaList.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredMediaList.map(renderMediaItem)}
            </Row>
          ) : (
            <Empty description="暂无媒体资源" className="py-12">
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={() => message.info('上传功能正在开发中')}
              >
                <Button type="primary" icon={<CloudUploadOutlined />}>
                  上传文件
                </Button>
              </Upload>
            </Empty>
          )}
        </Card>
        
        {/* 上传区域（示例） */}
        <Card title="批量上传" className="mt-4">
          <Dragger
            showUploadList={false}
            beforeUpload={() => false}
            onChange={() => message.info('上传功能正在开发中')}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传。支持图片、视频、文档、音频等多种文件格式。
            </p>
          </Dragger>
        </Card>
      </motion.div>
      
      {/* 媒体编辑弹窗 */}
      <Modal
        title="编辑媒体信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        width={700}
      >
        {currentMedia && (
          <div className="flex gap-4">
            <div className="media-preview" style={{ width: 200 }}>
              {currentMedia.type === 'image' ? (
                <Image
                  src={currentMedia.url}
                  alt={currentMedia.name}
                  style={{ maxWidth: '100%' }}
                />
              ) : (
                <div className="flex justify-center items-center h-32 bg-gray-100 rounded">
                  {currentMedia.type === 'video' && <VideoCameraOutlined style={{ fontSize: 32 }} />}
                  {currentMedia.type === 'document' && <FileOutlined style={{ fontSize: 32 }} />}
                  {currentMedia.type === 'audio' && <SoundOutlined style={{ fontSize: 32 }} />}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                <div>类型: {currentMedia.mimeType}</div>
                <div>大小: {(currentMedia.size / 1024).toFixed(1)} KB</div>
                {currentMedia.dimensions && (
                  <div>尺寸: {currentMedia.dimensions.width}×{currentMedia.dimensions.height}</div>
                )}
              </div>
            </div>
            
            <div className="media-edit-form flex-1">
              <Form
                form={form}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label="文件名称"
                  rules={[{ required: true, message: '请输入文件名称' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="alt"
                  label="替代文本"
                  tooltip="用于图片无法显示时的替代文本，也有助于SEO"
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="description"
                  label="描述"
                >
                  <TextArea rows={3} />
                </Form.Item>
                
                <Form.Item
                  name="tags"
                  label="标签"
                  tooltip="多个标签用逗号分隔"
                >
                  <Input placeholder="示例: 产品,宣传,首页" />
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 媒体预览弹窗 */}
      <Modal
        title={currentMedia?.name}
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {currentMedia && (
          <div className="media-preview-content">
            {currentMedia.type === 'image' ? (
              <div className="text-center">
                <Image
                  src={currentMedia.url}
                  alt={currentMedia.name}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded">
                {currentMedia.type === 'video' && <VideoCameraOutlined style={{ fontSize: 48 }} />}
                {currentMedia.type === 'document' && <FileOutlined style={{ fontSize: 48 }} />}
                {currentMedia.type === 'audio' && <SoundOutlined style={{ fontSize: 48 }} />}
              </div>
            )}
            
            <div className="media-details mt-4">
              <Paragraph>
                <div className="mb-2"><strong>文件名：</strong> {currentMedia.name}</div>
                <div className="mb-2"><strong>类型：</strong> {currentMedia.mimeType}</div>
                <div className="mb-2"><strong>大小：</strong> {(currentMedia.size / 1024).toFixed(1)} KB</div>
                {currentMedia.dimensions && (
                  <div className="mb-2"><strong>尺寸：</strong> {currentMedia.dimensions.width}×{currentMedia.dimensions.height}</div>
                )}
                {currentMedia.description && (
                  <div className="mb-2"><strong>描述：</strong> {currentMedia.description}</div>
                )}
                {currentMedia.tags && currentMedia.tags.length > 0 && (
                  <div className="mb-2">
                    <strong>标签：</strong>
                    <div className="mt-1">
                      {currentMedia.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MediaLibrary; 