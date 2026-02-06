# SkillForge 实施计划

> 版本：v1.0  
> 日期：2026-02-03  
> 状态：执行中

---

## 一、项目概览

| 项目 | 说明 |
|------|------|
| **项目名称** | SkillForge（技能工坊） |
| **目标** | 安全可信的 Skill 精选平台 |
| **技术栈** | Next.js 14 + Tailwind + Supabase + 通义千问 |
| **部署** | Vercel |
| **预计工时** | 16 天 |

---

## 二、开发阶段

### Phase 1: 项目初始化（Day 1）✅

- [x] 创建 Next.js 项目
- [x] 配置 Tailwind（黑白极简主题）
- [ ] 配置 Supabase
- [x] 项目目录结构规划
- [ ] 环境变量配置

### Phase 2: 数据层（Day 2-3）✅

- [x] 设计数据库 Schema
- [x] 创建 Supabase 配置
- [x] 编写数据爬取脚本
  - [x] GitHub 仓库爬虫
  - [ ] skills.sh 爬虫
  - [ ] SkillHub 爬虫
- [ ] 初始数据导入（需要 Supabase 配置）

### Phase 3: 后端 API（Day 4-5）✅

- [x] Skill 列表 API
- [x] Skill 搜索 API
- [x] Skill 详情 API
- [ ] 安全扫描服务
- [x] 统计服务（安装量）

### Phase 4: 前端页面（Day 6-9）✅

- [x] 首页（热门 Skill 展示）
- [x] 搜索页（筛选 + 排序）
- [x] Skill 详情页
  - [x] 基本信息
  - [x] SKILL.md 渲染
  - [x] 安全报告展示
  - [x] 一键复制安装命令
- [x] 响应式适配

### Phase 5: CLI 工具（Day 10-12）✅

- [x] CLI 项目初始化
- [x] `npx skillforge-tools add` 命令
- [x] `npx skillforge-tools list` 命令
- [x] `npx skillforge-tools remove` 命令
- [x] `npx skillforge-tools search` 命令
- [x] 多平台检测与适配
- [ ] 发布到 npm

### Phase 6: 安全系统（Day 13-14）

- [ ] Semgrep 规则编写
- [ ] 安全扫描流程
- [ ] 安全报告生成
- [ ] 安全等级判定

### Phase 7: 测试与上线（Day 15-16）

- [ ] 功能测试
- [ ] 性能优化
- [ ] Vercel 部署
- [ ] 监控配置
- [ ] 上线发布

---

## 三、技术架构

```
skillforge/
├── apps/
│   └── web/                    # Next.js 网站
│       ├── app/
│       │   ├── page.tsx        # 首页
│       │   ├── search/         # 搜索页
│       │   └── skill/[slug]/   # 详情页
│       ├── components/
│       │   ├── ui/             # 基础组件
│       │   ├── skill-card.tsx
│       │   └── search-bar.tsx
│       └── lib/
│           ├── db.ts           # Supabase 客户端
│           └── api.ts          # API 封装
│
├── packages/
│   └── cli/                    # CLI 工具
│       ├── src/
│       │   ├── index.ts
│       │   ├── commands/
│       │   │   ├── add.ts
│       │   │   ├── list.ts
│       │   │   └── remove.ts
│       │   └── utils/
│       └── package.json
│
├── scripts/
│   ├── crawlers/               # 数据爬取脚本
│   │   ├── skills-sh.ts
│   │   ├── skillhub.ts
│   │   └── github.ts
│   └── security/               # 安全扫描
│       └── scanner.ts
│
└── docs/                       # 文档
```

---

## 四、数据库 Schema

```sql
-- Skills 表
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  summary TEXT,
  github_url VARCHAR(500) NOT NULL,
  github_stars INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  
  -- 分类
  category VARCHAR(50),
  tags TEXT[],
  platforms TEXT[],
  
  -- 安全
  security_level INTEGER DEFAULT 0,
  security_report JSONB,
  last_scanned_at TIMESTAMP,
  
  -- 内容
  skill_md_content TEXT,
  usage_guide TEXT,
  
  -- 元数据
  author VARCHAR(255),
  license VARCHAR(50),
  version VARCHAR(50),
  source VARCHAR(50),  -- 来源：skills.sh, skillhub, github
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_security_level ON skills(security_level);
CREATE INDEX idx_skills_github_stars ON skills(github_stars DESC);
CREATE INDEX idx_skills_install_count ON skills(install_count DESC);

-- 全文搜索索引
CREATE INDEX idx_skills_search ON skills 
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## 五、环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 通义千问
DASHSCOPE_API_KEY=

# GitHub (爬取用)
GITHUB_TOKEN=

# 站点
NEXT_PUBLIC_SITE_URL=
```

---

## 六、立即开始

现在开始 **Phase 1: 项目初始化**
