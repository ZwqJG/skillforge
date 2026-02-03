# SkillForge

> 安全可信的 Skill 精选平台

SkillForge（技能工坊）是一个 AI Agent Skills 的发现和安装平台，帮助用户找到高质量、安全可信的 Skills。

## 特性

- 🔒 **安全审核** - 所有 Skill 经过安全扫描和审核
- 🔍 **智能搜索** - 关键词搜索 + 分类筛选
- 📦 **一键安装** - CLI 工具支持多平台
- 🌍 **全球用户** - 面向世界用户，中英双语

## 快速开始

### 安装 Skill

```bash
npx skillforge add <skill-name>
```

### CLI 命令

```bash
# 搜索
skillforge search "react"

# 安装
skillforge add react-best-practices

# 列出已安装
skillforge list

# 卸载
skillforge remove <skill-name>
```

## 项目结构

```
skillforge/
├── apps/
│   └── web/              # Next.js 网站
├── packages/
│   └── cli/              # CLI 工具
├── scripts/
│   ├── crawlers/         # 数据爬取脚本
│   └── schema.sql        # 数据库 Schema
└── docs/                 # 项目文档
```

## 本地开发

### 1. 启动网站

```bash
cd apps/web
npm install
npm run dev
```

访问 http://localhost:3000

### 2. 构建 CLI

```bash
cd packages/cli
npm install
npm run build
```

### 3. 爬取数据

```bash
cd scripts
npm install
npx tsx seed.ts crawl
```

## 技术栈

- **前端**: Next.js 16 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: 通义千问
- **部署**: Vercel

## 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 通义千问
DASHSCOPE_API_KEY=

# GitHub
GITHUB_TOKEN=
```

## License

MIT
