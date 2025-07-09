# 开发环境搭建

## 🛠️ 系统要求

### 操作系统
- **Windows**: Windows 10/11
- **macOS**: macOS 10.15+
- **Linux**: Ubuntu 18.04+ / CentOS 7+

### 软件要求
| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| Node.js | 18.0.0 | 20.x LTS | JavaScript 运行时 |
| npm | 8.0.0 | 最新版本 | 包管理器 |
| Git | 2.20.0 | 最新版本 | 版本控制 |

## 📦 环境安装

### 1. 安装 Node.js

#### Windows
```bash
# 使用 Chocolatey
choco install nodejs

# 或下载官方安装包
# https://nodejs.org/
```

#### macOS
```bash
# 使用 Homebrew
brew install node

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### 2. 验证安装
```bash
node --version  # 应显示 v18.0.0 或更高版本
npm --version   # 应显示 8.0.0 或更高版本
```

### 3. 配置 npm
```bash
# 设置 npm 镜像源（可选，提高下载速度）
npm config set registry https://registry.npmmirror.com

# 查看配置
npm config list
```

## 🔧 IDE 配置

### VS Code 推荐配置

#### 必装插件
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### 工作区设置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### 代码片段
```json
// .vscode/snippets.json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react'",
      "",
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ($3) => {",
      "  return (",
      "    <div>",
      "      $4",
      "    </div>",
      "  )",
      "}",
      "",
      "export default ${1:ComponentName}"
    ],
    "description": "Create a React functional component with TypeScript"
  }
}
```

## 🚀 项目初始化

### 1. 克隆项目
```bash
# 克隆仓库
git clone <repository-url>
cd muying-admin-react

# 查看分支
git branch -a

# 切换到开发分支（如果有）
git checkout develop
```

### 2. 安装依赖
```bash
# 清理缓存（可选）
npm cache clean --force

# 安装依赖
npm install

# 或使用 yarn（如果偏好）
yarn install
```

### 3. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env.development
cp .env.example .env.production

# 编辑环境变量
vim .env.development
```

#### 环境变量说明
```bash
# .env.development
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 应用标题
VITE_APP_TITLE=母婴商城管理后台（开发）

# 是否启用 Mock 数据
VITE_USE_MOCK=true

# 上传文件地址
VITE_UPLOAD_URL=http://localhost:8080/upload

# WebSocket 地址
VITE_WS_URL=ws://localhost:8080/ws
```

### 4. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 或指定端口
npm run dev -- --port 3001
```

### 5. 验证安装
访问 [http://localhost:3000](http://localhost:3000)，应该能看到登录页面。

## 🔍 开发工具

### 浏览器插件

#### Chrome 插件
- **React Developer Tools**: 调试 React 组件
- **Redux DevTools**: 调试 Redux 状态
- **Vue.js devtools**: 如果项目中有 Vue 组件

#### 安装方法
```bash
# Chrome 应用商店搜索并安装
# 或访问以下链接：
# React DevTools: https://chrome.google.com/webstore/detail/react-developer-tools/
# Redux DevTools: https://chrome.google.com/webstore/detail/redux-devtools/
```

### 命令行工具

#### 全局工具安装
```bash
# TypeScript 编译器
npm install -g typescript

# 代码格式化工具
npm install -g prettier

# 项目脚手架工具
npm install -g create-react-app

# 包分析工具
npm install -g webpack-bundle-analyzer
```

## 🐛 常见问题

### Node.js 版本问题
```bash
# 问题：Node.js 版本过低
# 解决：使用 nvm 管理 Node.js 版本

# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装最新 LTS 版本
nvm install --lts
nvm use --lts
```

### 依赖安装失败
```bash
# 问题：npm install 失败
# 解决方案：

# 1. 清理缓存
npm cache clean --force

# 2. 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 3. 重新安装
npm install

# 4. 如果仍然失败，尝试使用 yarn
npm install -g yarn
yarn install
```

### 端口占用问题
```bash
# 问题：端口 3000 被占用
# 解决方案：

# 1. 查找占用端口的进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 2. 杀死进程
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# 3. 或使用其他端口
npm run dev -- --port 3001
```

### 权限问题
```bash
# 问题：npm 权限错误
# 解决方案：

# 1. 修改 npm 默认目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 2. 添加到环境变量
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 3. 或使用 nvm 管理 Node.js
```

## 📋 开发流程

### 1. 创建功能分支
```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-management
```

### 2. 开发和测试
```bash
# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 代码检查
npm run lint
```

### 3. 提交代码
```bash
# 添加文件
git add .

# 提交代码
git commit -m "feat: 添加用户管理功能"

# 推送到远程
git push origin feature/user-management
```

### 4. 创建合并请求
在 Git 平台（如 GitLab、GitHub）创建 Merge Request 或 Pull Request。

---

*本文档详细说明了开发环境的搭建过程，确保所有开发者都能快速启动项目开发。*
