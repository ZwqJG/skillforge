import type { Category, Skill } from '@/types';

type SkillIntroSource = Pick<Skill, 'name' | 'category' | 'tags' | 'description' | 'summary'>;

interface IntroProfile {
    what: string;
    when: string;
    audience: string;
    whatShort?: string;
    whenShort?: string;
    audienceShort?: string;
}

interface IntroRule {
    keywords: string[];
    profile: IntroProfile;
}

const RULES: IntroRule[] = [
    {
        keywords: ['mcp', 'model context protocol', 'tool calling', 'protocol'],
        profile: {
            what: '搭建 MCP 服务并连接外部 API 与工具',
            when: '需要把业务能力开放给 AI 助手调用时',
            audience: 'AI 应用开发者、平台工程师与技术团队',
            whatShort: '搭建 MCP 服务',
            whenShort: '开放 AI 调用能力',
            audienceShort: 'AI 开发与平台团队',
        },
    },
    {
        keywords: ['skill-creator', 'writing-skills', 'find-skills', 'create skills'],
        profile: {
            what: '设计、编写与维护可复用的 AI Skill',
            when: '需要沉淀团队方法论或标准工作流时',
            audience: 'AI 应用开发者、平台维护者与技术负责人',
            whatShort: '创建可复用 Skill',
            whenShort: '沉淀团队方法论',
            audienceShort: 'AI 开发与技术负责人',
        },
    },
    {
        keywords: ['xlsx', 'excel', 'spreadsheet', 'pptx', 'presentation', 'docx', 'word', 'pdf', 'document'],
        profile: {
            what: '处理办公文档与表格自动化任务',
            when: '需要批量生成、修改、转换或分析文件时',
            audience: '运营人员、分析师、产品经理与开发者',
            whatShort: '处理文档与表格',
            whenShort: '批量生成与分析文件',
            audienceShort: '运营、分析与产品团队',
        },
    },
    {
        keywords: ['testing', 'test', 'tdd', 'e2e', 'unit', 'integration test', 'qa', 'verification'],
        profile: {
            what: '建立测试与质量保障流程',
            when: '要在交付前验证功能正确性和稳定性时',
            audience: '开发者、测试工程师与质量负责人',
            whatShort: '建立测试保障流程',
            whenShort: '交付前质量验证',
            audienceShort: '研发与测试团队',
        },
    },
    {
        keywords: ['debug', 'bug', 'root cause', 'tracing', 'diagnose'],
        profile: {
            what: '定位复杂问题并完成根因分析',
            when: '出现异常、性能波动或线上故障时',
            audience: '开发者、SRE 与技术支持团队',
            whatShort: '排查复杂技术问题',
            whenShort: '异常与故障定位',
            audienceShort: '开发、SRE 与支持团队',
        },
    },
    {
        keywords: ['planning', 'plan', 'roadmap', 'review', 'worktree', 'branch', 'workflow', 'subagent'],
        profile: {
            what: '规划和推进多步骤工程任务',
            when: '要拆解需求、协作执行和跟踪进度时',
            audience: '工程师、Tech Lead 与项目负责人',
            whatShort: '推进多步骤工程任务',
            whenShort: '需求拆解与协作执行',
            audienceShort: '工程师与项目负责人',
        },
    },
    {
        keywords: ['marketing', 'seo', 'analytics', 'copy', 'campaign', 'a/b', 'ab test', 'content'],
        profile: {
            what: '制定增长策略并优化营销内容',
            when: '需要提升流量、转化率与内容效果时',
            audience: '市场团队、增长团队与内容运营人员',
            whatShort: '优化增长与营销内容',
            whenShort: '提升流量与转化',
            audienceShort: '市场与增长团队',
        },
    },
    {
        keywords: ['frontend', 'ui', 'component', 'react', 'vue', 'next.js', 'html', 'css', 'artifact', 'web'],
        profile: {
            what: '构建网页组件与交互界面',
            when: '需要快速产出高质量前端页面或组件时',
            audience: '前端开发者、全栈工程师与设计协作团队',
            whatShort: '构建前端页面与组件',
            whenShort: '快速产出高质量界面',
            audienceShort: '前端与全栈团队',
        },
    },
    {
        keywords: ['creative', 'art', 'theme', 'gif', 'video', 'remotion', 'brand', 'design', 'canvas'],
        profile: {
            what: '产出视觉创意与品牌表达内容',
            when: '需要制作设计稿、动态素材或品牌资产时',
            audience: '设计师、内容创作者与品牌团队',
            whatShort: '产出视觉创意内容',
            whenShort: '制作设计与品牌素材',
            audienceShort: '设计与品牌团队',
        },
    },
];

const CATEGORY_FALLBACK: Record<Category, IntroProfile> = {
    development: {
        what: '提升开发效率与工程交付质量',
        when: '实现新功能、重构代码或排查问题时',
        audience: '软件工程师、技术负责人与研发团队',
        whatShort: '提升研发交付效率',
        whenShort: '开发与重构场景',
        audienceShort: '研发团队',
    },
    operations: {
        what: '优化运维流程与系统稳定性',
        when: '需要部署、监控或处理运行异常时',
        audience: '运维工程师、SRE 与平台团队',
        whatShort: '优化运维与稳定性',
        whenShort: '部署监控与异常处理',
        audienceShort: '运维与平台团队',
    },
    design: {
        what: '完成界面与体验设计相关任务',
        when: '需要定义视觉规范或实现设计方案时',
        audience: '设计师、前端工程师与产品团队',
        whatShort: '完成界面与体验设计',
        whenShort: '定义规范与实现方案',
        audienceShort: '设计与产品团队',
    },
    office: {
        what: '提升文档与表格处理效率',
        when: '需要标准化生成或编辑办公文件时',
        audience: '运营人员、分析师与业务团队',
        whatShort: '提升文档处理效率',
        whenShort: '标准化办公文件处理',
        audienceShort: '运营与业务团队',
    },
    marketing: {
        what: '支持营销增长与内容策略执行',
        when: '需要策划活动、分析数据和优化转化时',
        audience: '市场人员、增长负责人与内容团队',
        whatShort: '支持营销增长执行',
        whenShort: '活动策划与转化优化',
        audienceShort: '市场与内容团队',
    },
    creative: {
        what: '完成创意内容策划与产出',
        when: '需要快速生成多样化视觉内容时',
        audience: '设计师、创作者与品牌团队',
        whatShort: '完成创意内容产出',
        whenShort: '快速生成视觉内容',
        audienceShort: '创作者与品牌团队',
    },
};

const DEFAULT_PROFILE: IntroProfile = {
    what: '提供可复用的任务执行能力',
    when: '需要把复杂需求拆解并稳定落地时',
    audience: '开发者、产品团队与业务协作人员',
    whatShort: '提供可复用执行能力',
    whenShort: '复杂任务稳定落地',
    audienceShort: '开发与业务协作团队',
};

const CHINESE_CHAR_RE = /[\u3400-\u9FFF]/;

export function buildSkillIntroZh(skill: SkillIntroSource): string {
    const originalDescription = (skill.description || '').trim();
    if (shouldKeepExistingZhDescription(originalDescription)) return originalDescription;
    const profile = resolveIntroProfile(skill);
    return `用于${profile.what}，适合在${profile.when}使用，面向${profile.audience}。`;
}

export function buildSkillIntroZhShort(skill: SkillIntroSource): string {
    const profile = resolveIntroProfile(skill);
    return `做${profile.whatShort || profile.what}，用于${profile.whenShort || profile.when}，适合${profile.audienceShort || profile.audience}。`;
}

function shouldKeepExistingZhDescription(description: string): boolean {
    if (!description || !CHINESE_CHAR_RE.test(description)) {
        return false;
    }

    const hasWhat = /用于|负责|帮助|聚焦|提供/.test(description);
    const hasWhen = /适合|场景|当|在.*时/.test(description);
    const hasAudience = /面向|适用于|适合.*(开发者|团队|人员|人群)/.test(description);

    return hasWhat && hasWhen && hasAudience;
}

function resolveIntroProfile(skill: SkillIntroSource): IntroProfile {
    const lookupText = [
        skill.name,
        skill.category,
        ...skill.tags,
        skill.description || '',
        skill.summary || '',
    ]
        .join(' ')
        .toLowerCase();

    const matchedProfile = RULES.find((rule) =>
        rule.keywords.some((keyword) => lookupText.includes(keyword))
    )?.profile;

    return matchedProfile ?? CATEGORY_FALLBACK[skill.category] ?? DEFAULT_PROFILE;
}
