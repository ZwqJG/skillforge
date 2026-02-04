# SkillForge Web

安全可信的 Skill 精选平台 - Web 应用

## 开发

```bash
npm install
npm run dev
```

## 部署

### Vercel 部署

1. 在 Vercel 导入此项目
2. 设置根目录为 `apps/web`
3. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DASHSCOPE_API_KEY`

### 环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

## 项目结构

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # API 路由
│   ├── search/           # 搜索页
│   └── skill/[slug]/     # 详情页
├── components/
│   ├── skill/            # Skill 相关组件
│   └── ui/               # 通用 UI 组件
├── lib/                  # 工具函数
└── types/                # TypeScript 类型
```
