import { Skill } from '@/types';

// 模拟数据，用于开发和演示
export const mockSkills: Skill[] = [
    {
        id: '1',
        name: 'react-best-practices',
        slug: 'react-best-practices',
        description: 'React 开发最佳实践指南，包含组件设计、状态管理、性能优化等方面的建议。',
        summary: '全面的 React 开发最佳实践集合，涵盖组件架构、Hooks 使用规范、性能优化技巧、测试策略等。适合初中级 React 开发者提升代码质量。',
        github_url: 'https://github.com/vercel-labs/agent-skills',
        github_stars: 83600,
        install_count: 12500,
        category: 'development',
        tags: ['react', 'frontend', 'best-practices', 'vercel'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        security_report: {
            scanned_at: '2026-02-01T10:00:00Z',
            version: '1.0.0',
            level: 3,
            checks: [
                { name: '恶意代码', status: 'passed' },
                { name: '网络请求', status: 'passed' },
                { name: '文件操作', status: 'passed' },
                { name: '命令执行', status: 'passed' },
            ],
            permissions: ['读取项目文件'],
        },
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: `---
name: react-best-practices
description: React 开发最佳实践指南
---

# React Best Practices

## 组件设计原则

1. 保持组件小而专注
2. 使用组合而非继承
3. 提取可复用逻辑到自定义 Hooks

## 状态管理

- 优先使用 useState 和 useReducer
- 复杂状态考虑 Zustand 或 Jotai
- 避免 prop drilling，合理使用 Context

## 性能优化

- 使用 React.memo 避免不必要的重渲染
- useMemo 和 useCallback 的正确使用场景
- 代码分割和懒加载
`,
        usage_guide: `## 如何使用

1. 安装 Skill：
\`\`\`bash
npx @skillforge/cli add react-best-practices
\`\`\`

2. 在 Claude Code 中，当你编写 React 代码时，Claude 会自动参考这些最佳实践给出建议。

3. 你也可以直接询问：
- "检查这个组件是否符合最佳实践"
- "如何优化这个组件的性能？"
`,
        author: 'vercel-labs',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-02-01T10:00:00Z',
    },
    {
        id: '2',
        name: 'systematic-debugging',
        slug: 'systematic-debugging',
        description: '系统化调试方法论，4 阶段根因分析流程，帮助你快速定位和解决问题。',
        summary: '专业的调试方法论 Skill，包含问题识别、假设生成、验证测试、修复确认四个阶段，附带常见问题模式库。',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 5200,
        install_count: 3400,
        category: 'development',
        tags: ['debugging', 'methodology', 'troubleshooting', 'superpowers'],
        platforms: ['claude-code', 'codex', 'universal'],
        security_level: 2,
        security_report: {
            scanned_at: '2026-02-01T10:00:00Z',
            version: '1.2.0',
            level: 2,
            checks: [
                { name: '恶意代码', status: 'passed' },
                { name: '网络请求', status: 'passed' },
                { name: '文件操作', status: 'warning', message: '读取日志文件' },
                { name: '命令执行', status: 'passed' },
            ],
            permissions: ['读取项目文件', '读取日志文件'],
        },
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: `---
name: systematic-debugging
description: 系统化调试方法论
---

# Systematic Debugging

## 4 阶段调试流程

### Phase 1: 问题识别
- 准确描述问题现象
- 收集错误信息和日志
- 确定问题的可复现条件

### Phase 2: 假设生成
- 基于症状生成可能原因列表
- 按可能性排序
- 设计验证方案

### Phase 3: 验证测试
- 逐一验证假设
- 使用最小化测试用例
- 记录排除的假设

### Phase 4: 修复确认
- 实施修复方案
- 验证问题已解决
- 添加防护措施防止复发
`,
        usage_guide: `## 如何使用

遇到 bug 时，告诉 Claude：
- "请使用系统化调试方法帮我分析这个问题"
- "按照调试流程排查这个错误"
`,
        author: 'obra',
        license: 'MIT',
        version: '1.2.0',
        source: 'github',
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
    },
    {
        id: '3',
        name: 'seo-audit',
        slug: 'seo-audit',
        description: 'SEO 审计工具，自动分析网站结构、关键词密度、竞品对比，生成优化建议报告。',
        summary: '全面的 SEO 分析和优化建议，包含技术 SEO、内容优化、外链分析等方面。',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 1800,
        install_count: 2100,
        category: 'marketing',
        tags: ['seo', 'marketing', 'audit', 'optimization'],
        platforms: ['claude-code', 'universal'],
        security_level: 2,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
    },
    {
        id: '4',
        name: 'copywriting',
        slug: 'copywriting',
        description: '专业文案撰写技巧，包含营销心理学、转化率优化、A/B 测试建议等。',
        summary: '营销文案写作专家，从标题到 CTA 全流程优化。',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 1800,
        install_count: 1850,
        category: 'marketing',
        tags: ['copywriting', 'marketing', 'content', 'conversion'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
    },
    {
        id: '5',
        name: 'expo-deployment',
        slug: 'expo-deployment',
        description: 'Expo 应用部署指南，包含 EAS Build、EAS Submit、OTA 更新等完整流程。',
        summary: 'Expo 官方部署最佳实践，从开发到上架的完整指南。',
        github_url: 'https://github.com/expo/skills',
        github_stars: 2400,
        install_count: 1600,
        category: 'development',
        tags: ['expo', 'react-native', 'mobile', 'deployment', 'eas'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'expo',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-29T00:00:00Z',
    },
    {
        id: '6',
        name: 'test-driven-development',
        slug: 'test-driven-development',
        description: 'TDD 开发方法论，RED-GREEN-REFACTOR 循环，包含测试反模式参考。',
        summary: '测试驱动开发完整指南，从理论到实践。',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 5200,
        install_count: 2800,
        category: 'development',
        tags: ['tdd', 'testing', 'methodology', 'superpowers'],
        platforms: ['claude-code', 'codex', 'opencode', 'universal'],
        security_level: 2,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'obra',
        license: 'MIT',
        version: '1.1.0',
        source: 'github',
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
    },
    {
        id: '7',
        name: 'vue-best-practices',
        slug: 'vue-best-practices',
        description: 'Vue 3 开发最佳实践，Composition API、状态管理、性能优化全覆盖。',
        summary: 'Vue 3 开发规范和最佳实践集合。',
        github_url: 'https://github.com/antfu/vue-best-practices',
        github_stars: 3200,
        install_count: 2100,
        category: 'development',
        tags: ['vue', 'frontend', 'best-practices', 'composition-api'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'antfu',
        license: 'MIT',
        version: '1.0.0',
        source: 'skills.sh',
        created_at: '2026-01-12T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
    },
    {
        id: '8',
        name: 'frontend-design',
        slug: 'frontend-design',
        description: '前端设计规范，包含设计系统、响应式布局、无障碍访问等最佳实践。',
        summary: '前端设计与开发规范，打造一致的用户体验。',
        github_url: 'https://github.com/skillforge/frontend-design',
        github_stars: 1500,
        install_count: 1200,
        category: 'design',
        tags: ['design', 'frontend', 'ui', 'accessibility'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'skillforge',
        license: 'MIT',
        version: '1.0.0',
        source: 'skillhub',
        created_at: '2026-01-22T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
    },
    {
        id: '9',
        name: 'remotion-best-practices',
        slug: 'remotion-best-practices',
        description: 'Remotion 视频生成最佳实践，帮助你用代码创建专业视频。',
        summary: 'Remotion 官方最佳实践，从入门到精通。',
        github_url: 'https://github.com/remotion-dev/skills',
        github_stars: 1200,
        install_count: 800,
        category: 'creative',
        tags: ['remotion', 'video', 'animation', 'react'],
        platforms: ['claude-code', 'universal'],
        security_level: 3,
        security_report: null,
        last_scanned_at: '2026-02-01T10:00:00Z',
        skill_md_content: '',
        usage_guide: '',
        author: 'remotion-dev',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
    },
];
