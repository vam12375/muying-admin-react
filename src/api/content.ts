import axios from 'axios';

// 内容类型
export interface Content {
  id: string;
  title: string;
  type: 'article' | 'banner' | 'page' | 'product_description';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  content: string;
  excerpt?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  coverImage?: string;
  tags?: string[];
  categories?: string[];
}

// 内容列表响应
export interface ContentListResponse {
  list: Content[];
  total: number;
  page: number;
  pageSize: number;
}

// 媒体资源类型
export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  folder?: string;
  alt?: string;
  description?: string;
  usageCount?: number;
}

// 媒体列表响应
export interface MediaListResponse {
  list: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
}

// 内容模板类型
export interface ContentTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'page' | 'product';
  content: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  variables?: string[];
  isDefault?: boolean;
}

// SEO分析结果
export interface SeoAnalysisResult {
  score: number;
  title: {
    score: number;
    length: number;
    containsKeyword: boolean;
    suggestions: string[];
  };
  description: {
    score: number;
    length: number;
    containsKeyword: boolean;
    suggestions: string[];
  };
  content: {
    score: number;
    wordCount: number;
    keywordDensity: number;
    readability: number;
    suggestions: string[];
  };
  headings: {
    score: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    containsKeyword: boolean;
    suggestions: string[];
  };
  links: {
    score: number;
    internalCount: number;
    externalCount: number;
    suggestions: string[];
  };
  images: {
    score: number;
    count: number;
    withAlt: number;
    suggestions: string[];
  };
}

// 内容管理API
export const contentApi = {
  // 获取内容列表
  getContentList: async (
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    status?: string,
    keyword?: string
  ): Promise<ContentListResponse> => {
    try {
      const params = { page, pageSize, type, status, keyword };
      const response = await axios.get('/admin/content', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取内容列表失败', error);
      // 返回模拟数据
      return {
        list: Array(5).fill(null).map((_, index) => ({
          id: `content-${index + 1}`,
          title: `示例内容 ${index + 1}`,
          type: index % 2 ? 'article' : 'page',
          status: ['draft', 'published', 'scheduled'][index % 3],
          content: `这是示例内容 ${index + 1} 的正文内容...`,
          author: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['示例', '测试'],
          categories: ['未分类']
        })) as Content[],
        total: 100,
        page,
        pageSize
      };
    }
  },
  
  // 获取内容详情
  getContentDetail: async (id: string): Promise<Content> => {
    try {
      const response = await axios.get(`/admin/content/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取内容详情失败', error);
      throw error;
    }
  },
  
  // 创建内容
  createContent: async (content: Partial<Content>): Promise<Content> => {
    try {
      const response = await axios.post('/admin/content', content);
      return response.data.data;
    } catch (error) {
      console.error('创建内容失败', error);
      throw error;
    }
  },
  
  // 更新内容
  updateContent: async (id: string, content: Partial<Content>): Promise<Content> => {
    try {
      const response = await axios.put(`/admin/content/${id}`, content);
      return response.data.data;
    } catch (error) {
      console.error('更新内容失败', error);
      throw error;
    }
  },
  
  // 删除内容
  deleteContent: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/content/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除内容失败', error);
      throw error;
    }
  },
  
  // 媒体管理
  // 获取媒体资源列表
  getMediaList: async (
    page: number = 1,
    pageSize: number = 20,
    type?: string,
    folder?: string,
    keyword?: string
  ): Promise<MediaListResponse> => {
    try {
      const params = { page, pageSize, type, folder, keyword };
      const response = await axios.get('/admin/content/media', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取媒体列表失败', error);
      // 返回模拟数据
      return {
        list: Array(12).fill(null).map((_, index) => ({
          id: `media-${index + 1}`,
          name: `image-${index + 1}.jpg`,
          url: `https://picsum.photos/id/${(index + 1) * 10}/200/200`,
          type: 'image',
          mimeType: 'image/jpeg',
          size: 1024 * (index + 1),
          dimensions: {
            width: 200,
            height: 200
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['示例'],
          folder: '默认'
        })) as MediaAsset[],
        total: 100,
        page,
        pageSize
      };
    }
  },
  
  // 上传媒体资源
  uploadMedia: async (file: File, folder?: string, tags?: string[]): Promise<MediaAsset> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      if (tags) formData.append('tags', JSON.stringify(tags));
      
      const response = await axios.post('/admin/content/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('上传媒体资源失败', error);
      throw error;
    }
  },
  
  // 更新媒体资源
  updateMedia: async (id: string, data: Partial<MediaAsset>): Promise<MediaAsset> => {
    try {
      const response = await axios.put(`/admin/content/media/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('更新媒体资源失败', error);
      throw error;
    }
  },
  
  // 删除媒体资源
  deleteMedia: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/content/media/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除媒体资源失败', error);
      throw error;
    }
  },
  
  // 模板管理
  // 获取模板列表
  getTemplateList: async (type?: string): Promise<ContentTemplate[]> => {
    try {
      const params = { type };
      const response = await axios.get('/admin/content/templates', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取模板列表失败', error);
      // 返回模拟数据
      return [
        {
          id: 'tpl-1',
          name: '默认邮件模板',
          type: 'email',
          content: '<div>{{content}}</div>',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '默认邮件模板',
          variables: ['content', 'user_name'],
          isDefault: true
        },
        {
          id: 'tpl-2',
          name: '默认短信模板',
          type: 'sms',
          content: '{{content}}',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '默认短信模板',
          variables: ['content'],
          isDefault: true
        },
        {
          id: 'tpl-3',
          name: '默认页面模板',
          type: 'page',
          content: '<div class="page">{{content}}</div>',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '默认页面模板',
          variables: ['content', 'title'],
          isDefault: true
        }
      ];
    }
  },
  
  // 获取模板详情
  getTemplateDetail: async (id: string): Promise<ContentTemplate> => {
    try {
      const response = await axios.get(`/admin/content/templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取模板详情失败', error);
      throw error;
    }
  },
  
  // 创建模板
  createTemplate: async (template: Partial<ContentTemplate>): Promise<ContentTemplate> => {
    try {
      const response = await axios.post('/admin/content/templates', template);
      return response.data.data;
    } catch (error) {
      console.error('创建模板失败', error);
      throw error;
    }
  },
  
  // 更新模板
  updateTemplate: async (id: string, template: Partial<ContentTemplate>): Promise<ContentTemplate> => {
    try {
      const response = await axios.put(`/admin/content/templates/${id}`, template);
      return response.data.data;
    } catch (error) {
      console.error('更新模板失败', error);
      throw error;
    }
  },
  
  // 删除模板
  deleteTemplate: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/content/templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除模板失败', error);
      throw error;
    }
  },
  
  // SEO工具
  // 分析内容SEO
  analyzeSeo: async (content: Partial<Content>, keyword: string): Promise<SeoAnalysisResult> => {
    try {
      const response = await axios.post('/admin/content/seo/analyze', { content, keyword });
      return response.data.data;
    } catch (error) {
      console.error('SEO分析失败', error);
      // 返回模拟数据
      return {
        score: 75,
        title: {
          score: 80,
          length: content.title?.length || 0,
          containsKeyword: content.title?.includes(keyword) || false,
          suggestions: ['尝试在标题中包含关键词']
        },
        description: {
          score: 70,
          length: content.seoDescription?.length || 0,
          containsKeyword: content.seoDescription?.includes(keyword) || false,
          suggestions: ['描述长度应在50-160字符之间']
        },
        content: {
          score: 65,
          wordCount: content.content?.length || 0,
          keywordDensity: 1.5,
          readability: 70,
          suggestions: ['增加内容长度', '适当增加关键词密度']
        },
        headings: {
          score: 60,
          h1Count: 1,
          h2Count: 3,
          h3Count: 5,
          containsKeyword: true,
          suggestions: ['确保H1标签包含关键词']
        },
        links: {
          score: 50,
          internalCount: 2,
          externalCount: 1,
          suggestions: ['增加内部链接数量']
        },
        images: {
          score: 90,
          count: 5,
          withAlt: 5,
          suggestions: []
        }
      };
    }
  },
  
  // 获取关键词建议
  getKeywordSuggestions: async (keyword: string): Promise<string[]> => {
    try {
      const response = await axios.get('/admin/content/seo/keyword-suggestions', { params: { keyword } });
      return response.data.data;
    } catch (error) {
      console.error('获取关键词建议失败', error);
      // 返回模拟数据
      return [
        `${keyword} 优惠`,
        `${keyword} 推荐`,
        `${keyword} 价格`,
        `${keyword} 品牌`,
        `${keyword} 评测`
      ];
    }
  }
}; 