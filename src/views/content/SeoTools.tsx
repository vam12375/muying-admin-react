import React, { useState } from 'react';
import { Card, Typography, Alert, Tabs, Input, Button, Form, Progress, Row, Col, List, Tag, Space, Divider } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { SeoAnalysisResult } from '@/api/content';
import { contentApi } from '@/api/content';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * SEO工具页面
 */
const SeoTools: React.FC = () => {
  // 状态定义
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [analysis, setAnalysis] = useState<SeoAnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [form] = Form.useForm();
  
  // 获取关键词建议
  const fetchKeywordSuggestions = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    try {
      const results = await contentApi.getKeywordSuggestions(keyword);
      setSuggestions(results);
    } catch (error) {
      console.error('获取关键词建议失败', error);
    }
  };
  
  // 分析SEO
  const analyzeSeo = async () => {
    try {
      setLoading(true);
      
      // 获取表单值
      const values = await form.validateFields();
      
      // 调用API分析SEO
      const result = await contentApi.analyzeSeo({
        title: values.title,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        content: values.content
      }, values.keyword);
      
      setAnalysis(result);
      setKeyword(values.keyword);
      
      // 获取关键词建议
      fetchKeywordSuggestions(values.keyword);
    } catch (error) {
      console.error('SEO分析失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };
  
  return (
    <div className="seo-tools-container">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <Title level={4}>SEO工具</Title>
        </div>
        
        <Alert
          message="功能开发中"
          description="SEO工具功能正在开发中，目前仅展示基础界面和模拟分析功能，敬请期待完整功能！"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Tabs defaultActiveKey="analyzer">
          <TabPane
            tab={<span><SearchOutlined />SEO分析器</span>}
            key="analyzer"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card title="内容信息" className="mb-4">
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      title: '夏季母婴护理指南：让宝宝远离暑热的全方位攻略',
                      keyword: '夏季母婴护理',
                      seoTitle: '夏季母婴护理指南 | 婴儿防暑 | 母婴健康',
                      seoDescription: '了解夏季母婴护理的全方位知识，包括防暑降温、皮肤护理、饮食调理等方面的专业建议，帮助宝宝安全度过炎热夏季。',
                      content: '夏季是宝宝容易不适的季节，高温环境下宝宝更容易出现皮肤问题、食欲下降等情况。本文将为新手父母提供夏季母婴护理的专业建议，帮助宝宝安全舒适地度过炎热夏季。\n\n## 夏季宝宝皮肤护理\n\n夏季宝宝容易出汗，因此皮肤护理尤为重要。以下是几点建议：\n\n1. 勤换衣服，保持皮肤干爽\n2. 选择透气棉质衣物\n3. 避免使用刺激性护肤品\n4. 洗澡水温不宜过高\n\n## 夏季宝宝饮食调理\n\n炎热天气可能导致宝宝食欲下降，家长应注意以下几点：\n\n1. 保证足够水分摄入\n2. 选择易消化食物\n3. 避免过冷食物刺激胃肠\n4. 少量多餐，维持营养均衡\n\n## 夏季防暑降温措施\n\n为宝宝创造凉爽环境非常重要：\n\n1. 合理使用空调，温度不宜过低\n2. 避免阳光直射\n3. 出门做好防晒准备\n4. 观察宝宝是否有中暑迹象\n\n夏季是宝宝健康的挑战期，但只要家长掌握正确的护理知识，就能帮助宝宝安全度过炎热夏季。'
                    }}
                  >
                    <Form.Item
                      name="title"
                      label="内容标题"
                      rules={[{ required: true, message: '请输入内容标题' }]}
                    >
                      <Input placeholder="请输入内容标题" />
                    </Form.Item>
                    
                    <Form.Item
                      name="keyword"
                      label="目标关键词"
                      rules={[{ required: true, message: '请输入目标关键词' }]}
                    >
                      <Input placeholder="请输入目标关键词" />
                    </Form.Item>
                    
                    <Form.Item
                      name="seoTitle"
                      label="SEO标题"
                      tooltip="建议60个字符以内，包含关键词"
                    >
                      <Input placeholder="请输入SEO标题" />
                    </Form.Item>
                    
                    <Form.Item
                      name="seoDescription"
                      label="Meta描述"
                      tooltip="建议160个字符以内，包含关键词"
                    >
                      <TextArea rows={3} placeholder="请输入Meta描述" />
                    </Form.Item>
                    
                    <Form.Item
                      name="content"
                      label="内容正文"
                    >
                      <TextArea rows={8} placeholder="请输入内容正文" />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" onClick={analyzeSeo} loading={loading}>
                        分析SEO
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                {/* SEO分析结果 */}
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card title="SEO分析结果" className="mb-4">
                      <div className="text-center mb-4">
                        <Progress
                          type="dashboard"
                          percent={analysis.score}
                          format={percent => `${percent} 分`}
                          strokeColor={getScoreColor(analysis.score)}
                        />
                        <Title level={5} className="mt-2">总体评分</Title>
                      </div>
                      
                      <Divider />
                      
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          {
                            title: 'SEO标题',
                            score: analysis.title.score,
                            description: [
                              `长度: ${analysis.title.length} 字符`,
                              `包含关键词: ${analysis.title.containsKeyword ? '是' : '否'}`
                            ],
                            suggestions: analysis.title.suggestions
                          },
                          {
                            title: 'Meta描述',
                            score: analysis.description.score,
                            description: [
                              `长度: ${analysis.description.length} 字符`,
                              `包含关键词: ${analysis.description.containsKeyword ? '是' : '否'}`
                            ],
                            suggestions: analysis.description.suggestions
                          },
                          {
                            title: '内容分析',
                            score: analysis.content.score,
                            description: [
                              `词数: ${analysis.content.wordCount}`,
                              `关键词密度: ${analysis.content.keywordDensity}%`,
                              `可读性得分: ${analysis.content.readability}`
                            ],
                            suggestions: analysis.content.suggestions
                          },
                          {
                            title: '标题结构',
                            score: analysis.headings.score,
                            description: [
                              `H1标签数: ${analysis.headings.h1Count}`,
                              `H2标签数: ${analysis.headings.h2Count}`,
                              `H3标签数: ${analysis.headings.h3Count}`,
                              `标题包含关键词: ${analysis.headings.containsKeyword ? '是' : '否'}`
                            ],
                            suggestions: analysis.headings.suggestions
                          },
                          {
                            title: '链接分析',
                            score: analysis.links.score,
                            description: [
                              `内部链接数: ${analysis.links.internalCount}`,
                              `外部链接数: ${analysis.links.externalCount}`
                            ],
                            suggestions: analysis.links.suggestions
                          },
                          {
                            title: '图片分析',
                            score: analysis.images.score,
                            description: [
                              `图片数量: ${analysis.images.count}`,
                              `带Alt属性的图片: ${analysis.images.withAlt}`
                            ],
                            suggestions: analysis.images.suggestions
                          }
                        ]}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Progress
                                  type="circle"
                                  percent={item.score}
                                  width={50}
                                  strokeColor={getScoreColor(item.score)}
                                />
                              }
                              title={
                                <Space>
                                  {item.title}
                                  <Tag color={
                                    item.score >= 80 ? 'success' :
                                    item.score >= 60 ? 'warning' : 'error'
                                  }>
                                    {item.score}分
                                  </Tag>
                                </Space>
                              }
                              description={
                                <div>
                                  {item.description.map((desc, i) => (
                                    <div key={i}>{desc}</div>
                                  ))}
                                  {item.suggestions.length > 0 && (
                                    <div className="mt-2">
                                      <Text strong>建议改进：</Text>
                                      <ul className="pl-5 mt-1 mb-0">
                                        {item.suggestions.map((suggestion, i) => (
                                          <li key={i}>{suggestion}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                    
                    {/* 关键词建议 */}
                    {suggestions.length > 0 && (
                      <Card title="关键词建议">
                        <Paragraph>
                          基于您的关键词 <Text strong>"{keyword}"</Text> 的相关搜索建议：
                        </Paragraph>
                        <div className="mt-3">
                          {suggestions.map((suggestion, index) => (
                            <Tag 
                              key={index} 
                              color="blue" 
                              className="mb-2 mr-2"
                              style={{ fontSize: '14px', padding: '4px 8px' }}
                            >
                              {suggestion}
                            </Tag>
                          ))}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}
                
                {/* 未分析状态的提示 */}
                {!analysis && (
                  <Card>
                    <div className="text-center py-12">
                      <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                      <Title level={4}>填写内容并点击"分析SEO"</Title>
                      <Paragraph>
                        SEO分析工具将帮助您优化内容，提高搜索引擎排名和点击率。
                      </Paragraph>
                    </div>
                  </Card>
                )}
              </Col>
            </Row>
          </TabPane>
          
          <TabPane
            tab={<span><InfoCircleOutlined />SEO指南</span>}
            key="guide"
          >
            <Card>
              <Title level={4}>电商SEO优化指南</Title>
              <Paragraph>
                优化您的产品内容和描述，让潜在客户更容易找到您的产品。
              </Paragraph>
              
              <Title level={5}>标题优化</Title>
              <Paragraph>
                <ul>
                  <li>在标题中包含主要关键词，最好放在开头位置</li>
                  <li>保持标题在60个字符以内，避免在搜索结果中被截断</li>
                  <li>使用数字、问号等增加点击率</li>
                  <li>突出产品的独特卖点或解决的问题</li>
                </ul>
              </Paragraph>
              
              <Title level={5}>Meta描述优化</Title>
              <Paragraph>
                <ul>
                  <li>包含目标关键词，自然融入描述中</li>
                  <li>控制在160个字符以内</li>
                  <li>提供明确的价值主张和行动号召</li>
                  <li>避免重复标题中的内容</li>
                </ul>
              </Paragraph>
              
              <Title level={5}>内容优化</Title>
              <Paragraph>
                <ul>
                  <li>创建至少300字的高质量内容</li>
                  <li>使用H1、H2、H3等标题层级结构组织内容</li>
                  <li>在标题和正文中自然融入关键词</li>
                  <li>避免关键词堆砌，保持自然阅读体验</li>
                  <li>使用项目符号和短段落提高可读性</li>
                </ul>
              </Paragraph>
              
              <Title level={5}>图片优化</Title>
              <Paragraph>
                <ul>
                  <li>为所有图片添加ALT标签，包含关键词</li>
                  <li>使用描述性的文件名，用连字符分隔单词</li>
                  <li>压缩图片大小，提高加载速度</li>
                  <li>提供高质量、原创的产品图片</li>
                </ul>
              </Paragraph>
            </Card>
          </TabPane>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SeoTools; 