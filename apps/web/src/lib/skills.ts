import { Skill, Category, Platform, SecurityLevel } from '@/types';

export const CLI_NPX_NAME = process.env.NEXT_PUBLIC_SKILLFORGE_CLI_NAME ?? 'skillforge-tools';

export function buildInstallCommand(slugOrRepo: string): string {
    return `npx ${CLI_NPX_NAME} add ${slugOrRepo}`;
}

// 真实爬取的 Skills 数据
const MOCK_SKILLS: Skill[] = [
    // === Anthropic 官方 (Level 3) ===
    {
        id: '1',
        name: 'algorithmic-art',
        slug: 'algorithmic-art',
        description: 'Create beautiful algorithmic art and generative designs using code.',
        summary: 'Generate stunning algorithmic art pieces with customizable parameters.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 8500,
        category: 'creative',
        tags: ['art', 'generative', 'creative'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        security_report: null,
        last_scanned_at: null,
        skill_md_content: '# Algorithmic Art\n\nCreate beautiful generative art...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-15',
        updated_at: '2026-01-20',
    },
    {
        id: '2',
        name: 'brand-guidelines',
        slug: 'brand-guidelines',
        description: 'Generate comprehensive brand guidelines and style guides.',
        summary: 'Create professional brand identity documents.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 12000,
        category: 'design',
        tags: ['branding', 'design', 'guidelines'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Brand Guidelines\n\nCreate brand style guides...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-10',
        updated_at: '2026-01-18',
    },
    {
        id: '3',
        name: 'canvas-design',
        slug: 'canvas-design',
        description: 'Design and create visual content using HTML Canvas.',
        summary: 'Build interactive canvas-based designs and animations.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 9200,
        category: 'design',
        tags: ['canvas', 'design', 'animation'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Canvas Design\n\nCreate visual content with Canvas...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-01',
        updated_at: '2026-01-22',
    },
    {
        id: '4',
        name: 'doc-coauthoring',
        slug: 'doc-coauthoring',
        description: 'Collaborate on documents with AI-powered suggestions and edits.',
        summary: 'Real-time document collaboration with intelligent assistance.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 15600,
        category: 'office',
        tags: ['document', 'collaboration', 'writing'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Document Co-authoring\n\nCollaborate on documents...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-05',
        updated_at: '2026-01-25',
    },
    {
        id: '5',
        name: 'frontend-design',
        slug: 'frontend-design',
        description: 'Design and build modern frontend interfaces with best practices.',
        summary: 'Create beautiful, accessible, and performant web interfaces.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 22000,
        category: 'development',
        tags: ['frontend', 'design', 'ui', 'web'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Frontend Design\n\nBuild modern frontend interfaces...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-01',
        updated_at: '2026-01-28',
    },
    {
        id: '6',
        name: 'mcp-builder',
        slug: 'mcp-builder',
        description: 'Build Model Context Protocol servers and integrations.',
        summary: 'Create MCP servers to extend AI capabilities.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 18500,
        category: 'development',
        tags: ['mcp', 'protocol', 'integration'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# MCP Builder\n\nBuild MCP servers...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-10',
        updated_at: '2026-01-30',
    },
    {
        id: '7',
        name: 'skill-creator',
        slug: 'skill-creator',
        description: 'Create new Skills for AI agents with best practices.',
        summary: 'Build and distribute your own Skills.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 14200,
        category: 'development',
        tags: ['skill', 'creator', 'agent'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Skill Creator\n\nCreate new Skills...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-20',
        updated_at: '2026-01-15',
    },
    {
        id: '8',
        name: 'web-artifacts-builder',
        slug: 'web-artifacts-builder',
        description: 'Build interactive web artifacts and components.',
        summary: 'Create standalone web components and widgets.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 11800,
        category: 'development',
        tags: ['web', 'artifacts', 'components'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Web Artifacts Builder\n\nBuild web artifacts...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-05',
        updated_at: '2026-01-22',
    },
    {
        id: '9',
        name: 'webapp-testing',
        slug: 'webapp-testing',
        description: 'Comprehensive testing strategies for web applications.',
        summary: 'Test web apps with unit, integration, and e2e tests.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 16500,
        category: 'development',
        tags: ['testing', 'webapp', 'quality'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Webapp Testing\n\nTest web applications...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-25',
        updated_at: '2026-01-20',
    },
    {
        id: '10',
        name: 'pdf',
        slug: 'pdf',
        description: 'Generate and manipulate PDF documents.',
        summary: 'Create, edit, and convert PDF files.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 19800,
        category: 'office',
        tags: ['pdf', 'document', 'office'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# PDF\n\nWork with PDF documents...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-08',
        updated_at: '2026-01-18',
    },
    {
        id: '11',
        name: 'pptx',
        slug: 'pptx',
        description: 'Create professional PowerPoint presentations.',
        summary: 'Build and edit PPTX presentations.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 17200,
        category: 'office',
        tags: ['pptx', 'presentation', 'office'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# PPTX\n\nCreate presentations...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-12',
        updated_at: '2026-01-16',
    },
    {
        id: '12',
        name: 'xlsx',
        slug: 'xlsx',
        description: 'Work with Excel spreadsheets and data.',
        summary: 'Create, edit, and analyze Excel files.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 21500,
        category: 'office',
        tags: ['xlsx', 'excel', 'spreadsheet'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# XLSX\n\nWork with Excel files...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-06',
        updated_at: '2026-01-24',
    },
    {
        id: '13',
        name: 'docx',
        slug: 'docx',
        description: 'Create and edit Word documents.',
        summary: 'Build professional DOCX documents.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 20100,
        category: 'office',
        tags: ['docx', 'word', 'document'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# DOCX\n\nCreate Word documents...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-04',
        updated_at: '2026-01-26',
    },
    // === Vercel Labs (Level 3) ===
    {
        id: '14',
        name: 'vercel-react-best-practices',
        slug: 'vercel-react-best-practices',
        description: 'React development best practices from Vercel.',
        summary: 'Comprehensive React patterns and optimization techniques.',
        github_url: 'https://github.com/vercel-labs/agent-skills',
        github_stars: 18653,
        install_count: 15800,
        category: 'development',
        tags: ['react', 'vercel', 'best-practices'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Vercel React Best Practices\n\nReact patterns...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'vercel-labs',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-01',
        updated_at: '2026-01-28',
    },
    {
        id: '15',
        name: 'vercel-composition-patterns',
        slug: 'vercel-composition-patterns',
        description: 'Component composition patterns for scalable React apps.',
        summary: 'Learn advanced component composition techniques.',
        github_url: 'https://github.com/vercel-labs/agent-skills',
        github_stars: 18653,
        install_count: 12400,
        category: 'development',
        tags: ['react', 'composition', 'patterns'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Composition Patterns\n\nComponent patterns...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'vercel-labs',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-05',
        updated_at: '2026-01-25',
    },
    {
        id: '16',
        name: 'web-design-guidelines',
        slug: 'web-design-guidelines',
        description: 'Modern web design principles and guidelines.',
        summary: 'Create beautiful and accessible web designs.',
        github_url: 'https://github.com/vercel-labs/agent-skills',
        github_stars: 18653,
        install_count: 13600,
        category: 'design',
        tags: ['design', 'web', 'guidelines'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Web Design Guidelines\n\nModern design principles...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'vercel-labs',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-28',
        updated_at: '2026-01-22',
    },
    {
        id: '17',
        name: 'vercel-react-native-skills',
        slug: 'vercel-react-native-skills',
        description: 'React Native development skills and patterns.',
        summary: 'Build mobile apps with React Native best practices.',
        github_url: 'https://github.com/vercel-labs/agent-skills',
        github_stars: 18653,
        install_count: 9800,
        category: 'development',
        tags: ['react-native', 'mobile', 'vercel'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# React Native Skills\n\nMobile development...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'vercel-labs',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-08',
        updated_at: '2026-01-20',
    },
    // === Superpowers 方法论 (Level 2) ===
    {
        id: '18',
        name: 'test-driven-development',
        slug: 'test-driven-development',
        description: 'TDD methodology for AI-assisted development.',
        summary: 'Write tests first, then implement features.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 18200,
        category: 'development',
        tags: ['tdd', 'testing', 'methodology'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Test Driven Development\n\nTDD methodology...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-15',
        updated_at: '2026-01-30',
    },
    {
        id: '19',
        name: 'systematic-debugging',
        slug: 'systematic-debugging',
        description: 'Systematic approach to debugging complex issues.',
        summary: 'Debug effectively with structured methodology.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 16800,
        category: 'development',
        tags: ['debugging', 'methodology', 'quality'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Systematic Debugging\n\nDebugging methodology...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-18',
        updated_at: '2026-01-28',
    },
    {
        id: '20',
        name: 'subagent-driven-development',
        slug: 'subagent-driven-development',
        description: 'Coordinate multiple AI agents for complex tasks.',
        summary: 'Orchestrate subagents effectively.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 14500,
        category: 'development',
        tags: ['subagent', 'orchestration', 'ai'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Subagent Driven Development\n\nOrchestrate agents...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-01',
        updated_at: '2026-01-26',
    },
    {
        id: '21',
        name: 'writing-plans',
        slug: 'writing-plans',
        description: 'Write effective implementation plans for projects.',
        summary: 'Create clear, actionable project plans.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 13200,
        category: 'development',
        tags: ['planning', 'documentation', 'methodology'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Writing Plans\n\nCreate implementation plans...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-20',
        updated_at: '2026-01-24',
    },
    {
        id: '22',
        name: 'verification-before-completion',
        slug: 'verification-before-completion',
        description: 'Verify work before marking tasks complete.',
        summary: 'Ensure quality through systematic verification.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 15100,
        category: 'development',
        tags: ['verification', 'quality', 'methodology'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Verification Before Completion\n\nVerify work...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-22',
        updated_at: '2026-01-22',
    },
    {
        id: '23',
        name: 'brainstorming',
        slug: 'brainstorming',
        description: 'Structured brainstorming techniques for problem solving.',
        summary: 'Generate creative solutions systematically.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 11800,
        category: 'development',
        tags: ['brainstorming', 'creativity', 'problem-solving'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Brainstorming\n\nStructured brainstorming...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-25',
        updated_at: '2026-01-20',
    },
    {
        id: '24',
        name: 'executing-plans',
        slug: 'executing-plans',
        description: 'Execute implementation plans effectively.',
        summary: 'Follow through on planned work systematically.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 12500,
        category: 'development',
        tags: ['execution', 'planning', 'methodology'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Executing Plans\n\nExecute plans effectively...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-28',
        updated_at: '2026-01-18',
    },
    {
        id: '25',
        name: 'using-git-worktrees',
        slug: 'using-git-worktrees',
        description: 'Leverage Git worktrees for parallel development.',
        summary: 'Work on multiple branches simultaneously.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 9600,
        category: 'development',
        tags: ['git', 'worktrees', 'version-control'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Using Git Worktrees\n\nParallel development...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-05',
        updated_at: '2026-01-16',
    },
    {
        id: '26',
        name: 'requesting-code-review',
        slug: 'requesting-code-review',
        description: 'Request effective code reviews from peers.',
        summary: 'Get valuable feedback on your code.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 10200,
        category: 'development',
        tags: ['code-review', 'collaboration', 'quality'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Requesting Code Review\n\nGet effective reviews...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-08',
        updated_at: '2026-01-14',
    },
    {
        id: '27',
        name: 'receiving-code-review',
        slug: 'receiving-code-review',
        description: 'Receive and act on code review feedback effectively.',
        summary: 'Process and implement review suggestions.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 9800,
        category: 'development',
        tags: ['code-review', 'feedback', 'improvement'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Receiving Code Review\n\nProcess feedback...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-10',
        updated_at: '2026-01-12',
    },
    // === Marketing Skills (Level 2) ===
    {
        id: '28',
        name: 'ab-test-setup',
        slug: 'ab-test-setup',
        description: 'Set up effective A/B tests for marketing campaigns.',
        summary: 'Design and implement A/B testing strategies.',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 5646,
        install_count: 6500,
        category: 'marketing',
        tags: ['ab-testing', 'marketing', 'optimization'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# A/B Test Setup\n\nSet up A/B tests...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-30',
        updated_at: '2026-01-28',
    },
    {
        id: '29',
        name: 'analytics-tracking',
        slug: 'analytics-tracking',
        description: 'Implement comprehensive analytics tracking.',
        summary: 'Track user behavior and conversions effectively.',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 5646,
        install_count: 7200,
        category: 'marketing',
        tags: ['analytics', 'tracking', 'data'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Analytics Tracking\n\nImplement analytics...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-02',
        updated_at: '2026-01-26',
    },
    {
        id: '30',
        name: 'competitor-alternatives',
        slug: 'competitor-alternatives',
        description: 'Analyze competitors and create alternative comparisons.',
        summary: 'Research and document competitive landscape.',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 5646,
        install_count: 5800,
        category: 'marketing',
        tags: ['competitor', 'analysis', 'research'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Competitor Alternatives\n\nAnalyze competitors...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-05',
        updated_at: '2026-01-24',
    },
    {
        id: '31',
        name: 'content-strategy',
        slug: 'content-strategy',
        description: 'Develop effective content marketing strategies.',
        summary: 'Plan and execute content marketing campaigns.',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 5646,
        install_count: 6100,
        category: 'marketing',
        tags: ['content', 'strategy', 'marketing'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Content Strategy\n\nDevelop content strategies...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-08',
        updated_at: '2026-01-22',
    },
    // === Remotion (Level 3) ===
    {
        id: '32',
        name: 'remotion-best-practices',
        slug: 'remotion-best-practices',
        description: 'Best practices for creating videos with Remotion.',
        summary: 'Create programmatic videos with React.',
        github_url: 'https://github.com/remotion-dev/skills',
        github_stars: 1251,
        install_count: 4200,
        category: 'creative',
        tags: ['remotion', 'video', 'react'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Remotion Best Practices\n\nCreate videos with Remotion...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'remotion-dev',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-10',
        updated_at: '2026-01-30',
    },
    // === 补充更多 Superpowers ===
    {
        id: '33',
        name: 'dispatching-parallel-agents',
        slug: 'dispatching-parallel-agents',
        description: 'Dispatch and coordinate parallel agent workflows.',
        summary: 'Run multiple agents simultaneously for efficiency.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 8500,
        category: 'development',
        tags: ['parallel', 'agents', 'orchestration'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Dispatching Parallel Agents\n\nCoordinate agents...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-12',
        updated_at: '2026-01-28',
    },
    {
        id: '34',
        name: 'finishing-a-development-branch',
        slug: 'finishing-a-development-branch',
        description: 'Complete and merge development branches properly.',
        summary: 'Clean up and finalize feature branches.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 7800,
        category: 'development',
        tags: ['git', 'branching', 'workflow'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Finishing Development Branch\n\nComplete branches...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-15',
        updated_at: '2026-01-26',
    },
    {
        id: '35',
        name: 'using-superpowers',
        slug: 'using-superpowers',
        description: 'Master the Superpowers methodology for AI development.',
        summary: 'Learn the complete Superpowers framework.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 11200,
        category: 'development',
        tags: ['superpowers', 'methodology', 'framework'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Using Superpowers\n\nMaster the methodology...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-10',
        updated_at: '2026-01-30',
    },
    {
        id: '36',
        name: 'writing-skills',
        slug: 'writing-skills',
        description: 'Create effective Skills for AI agents.',
        summary: 'Learn to write well-structured Skills.',
        github_url: 'https://github.com/obra/superpowers',
        github_stars: 43045,
        install_count: 9400,
        category: 'development',
        tags: ['skills', 'writing', 'documentation'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Writing Skills\n\nCreate effective Skills...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'obra',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-12',
        updated_at: '2026-01-28',
    },
    // === Anthropic 补充 ===
    {
        id: '37',
        name: 'internal-comms',
        slug: 'internal-comms',
        description: 'Write effective internal communications.',
        summary: 'Create clear team updates and announcements.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 8900,
        category: 'office',
        tags: ['communication', 'internal', 'writing'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Internal Communications\n\nWrite team updates...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-14',
        updated_at: '2026-01-22',
    },
    {
        id: '38',
        name: 'slack-gif-creator',
        slug: 'slack-gif-creator',
        description: 'Create animated GIFs for Slack communication.',
        summary: 'Generate fun GIFs for team chat.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 7600,
        category: 'creative',
        tags: ['slack', 'gif', 'animation'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Slack GIF Creator\n\nCreate GIFs for Slack...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-16',
        updated_at: '2026-01-20',
    },
    {
        id: '39',
        name: 'theme-factory',
        slug: 'theme-factory',
        description: 'Generate consistent design themes and color palettes.',
        summary: 'Create cohesive visual themes for applications.',
        github_url: 'https://github.com/anthropics/skills',
        github_stars: 61671,
        install_count: 10500,
        category: 'design',
        tags: ['theme', 'design', 'colors'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 3,
        skill_md_content: '# Theme Factory\n\nGenerate design themes...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'anthropics',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-01-18',
        updated_at: '2026-01-18',
    },
    {
        id: '40',
        name: 'copy-editing',
        slug: 'copy-editing',
        description: 'Professional copy editing for marketing content.',
        summary: 'Polish and improve marketing copy.',
        github_url: 'https://github.com/coreyhaines31/marketingskills',
        github_stars: 5646,
        install_count: 5400,
        category: 'marketing',
        tags: ['copywriting', 'editing', 'content'],
        platforms: ['claude-code', 'cursor', 'universal'],
        security_level: 2,
        skill_md_content: '# Copy Editing\n\nEdit marketing copy...',
        usage_guide: '## Usage\n\nInstall and use with your agent.',
        author: 'coreyhaines31',
        license: 'MIT',
        version: '1.0.0',
        source: 'github',
        created_at: '2025-02-10',
        updated_at: '2026-01-16',
    },
];

interface GetSkillsParams {
    q?: string;
    category?: Category;
    security_level?: SecurityLevel;
    platform?: Platform;
    sort?: 'stars' | 'installs' | 'recent';
    page?: number;
    page_size?: number;
}

interface GetSkillsResult {
    skills: Skill[];
    total: number;
    page: number;
    page_size: number;
}

export async function getSkills(params: GetSkillsParams = {}): Promise<GetSkillsResult> {
    const {
        q,
        category,
        security_level,
        platform,
        sort = 'stars',
        page = 1,
        page_size = 12,
    } = params;

    // 尝试从 Supabase 读取
    const { supabase } = await import('./supabase');

    if (supabase) {
        try {
            let query = supabase.from('skills').select('*', { count: 'exact' });

            // 搜索过滤
            if (q) {
                query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
            }

            // 分类过滤
            if (category) {
                query = query.eq('category', category);
            }

            // 安全等级过滤
            if (security_level !== undefined) {
                query = query.eq('security_level', security_level);
            }

            // 排序
            switch (sort) {
                case 'stars':
                    query = query.order('github_stars', { ascending: false });
                    break;
                case 'installs':
                    query = query.order('install_count', { ascending: false });
                    break;
                case 'recent':
                    query = query.order('updated_at', { ascending: false });
                    break;
            }

            // 分页
            const start = (page - 1) * page_size;
            query = query.range(start, start + page_size - 1);

            const { data, error, count } = await query;

            if (!error && data) {
                const skills: Skill[] = data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    slug: d.slug,
                    description: d.description || '',
                    summary: d.summary || '',
                    github_url: d.github_url || '',
                    github_stars: d.github_stars || 0,
                    install_count: d.install_count || 0,
                    category: d.category as Category,
                    tags: d.tags || [],
                    platforms: (d.platforms || ['universal']) as Platform[],
                    security_level: (d.security_level || 0) as SecurityLevel,
                    security_report: d.security_report || null,
                    last_scanned_at: d.last_scanned_at || null,
                    skill_md_content: d.skill_md_content || '',
                    usage_guide: d.usage_guide || '',
                    author: d.author || '',
                    license: d.license || '',
                    version: d.version || '1.0.0',
                    source: (d.source || 'github') as Skill['source'],
                    created_at: d.created_at || new Date().toISOString(),
                    updated_at: d.updated_at || new Date().toISOString(),
                }));

                // 平台过滤（Supabase 不支持数组包含查询，在客户端过滤）
                let filteredSkills = skills;
                if (platform) {
                    filteredSkills = skills.filter(s => s.platforms.includes(platform));
                }

                return {
                    skills: filteredSkills,
                    total: count || filteredSkills.length,
                    page,
                    page_size,
                };
            }
        } catch (e) {
            console.error('Supabase getSkills failed:', e);
        }
    }

    // 回退到 Mock 数据
    console.log('[getSkills] Falling back to mock data');
    let filtered = [...MOCK_SKILLS];

    // 搜索过滤
    if (q) {
        const query = q.toLowerCase();
        filtered = filtered.filter(
            skill =>
                skill.name.toLowerCase().includes(query) ||
                skill.description.toLowerCase().includes(query) ||
                skill.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    // 分类过滤
    if (category) {
        filtered = filtered.filter(skill => skill.category === category);
    }

    // 安全等级过滤
    if (security_level !== undefined) {
        filtered = filtered.filter(skill => skill.security_level === security_level);
    }

    // 平台过滤
    if (platform) {
        filtered = filtered.filter(skill => skill.platforms.includes(platform));
    }

    // 排序
    switch (sort) {
        case 'stars':
            filtered.sort((a, b) => b.github_stars - a.github_stars);
            break;
        case 'installs':
            filtered.sort((a, b) => b.install_count - a.install_count);
            break;
        case 'recent':
            filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            break;
    }

    const total = filtered.length;
    const start = (page - 1) * page_size;
    const paginated = filtered.slice(start, start + page_size);

    return {
        skills: paginated,
        total,
        page,
        page_size,
    };
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
    // 尝试从 Supabase 读取
    const { supabase } = await import('./supabase');

    console.log('[getSkillBySlug] slug:', slug, 'supabase:', !!supabase);

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('slug', slug)
                .single();

            console.log('[getSkillBySlug] Supabase response:', { hasData: !!data, error: error?.message });

            if (!error && data) {
                console.log('[getSkillBySlug] Using Supabase data, usage_guide length:', data.usage_guide?.length || 0);
                // 转换数据格式
                return {
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    summary: data.summary || '',
                    github_url: data.github_url || '',
                    github_stars: data.github_stars || 0,
                    install_count: data.install_count || 0,
                    category: data.category as Category,
                    tags: data.tags || [],
                    platforms: (data.platforms || ['universal']) as Platform[],
                    security_level: (data.security_level || 0) as SecurityLevel,
                    security_report: data.security_report || null,
                    last_scanned_at: data.last_scanned_at || null,
                    skill_md_content: data.skill_md_content || '',
                    usage_guide: data.usage_guide || '',
                    author: data.author || '',
                    license: data.license || '',
                    version: data.version || '1.0.0',
                    source: (data.source || 'github') as Skill['source'],
                    created_at: data.created_at || new Date().toISOString(),
                    updated_at: data.updated_at || new Date().toISOString(),
                };
            }
        } catch (e) {
            console.error('Supabase query failed:', e);
        }
    }

    // 回退到 Mock 数据
    console.log('[getSkillBySlug] Falling back to mock data');
    const skill = MOCK_SKILLS.find(s => s.slug === slug);
    return skill || null;
}

export async function getHotSkills(limit = 6): Promise<Skill[]> {
    const { supabase } = await import('./supabase');

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .order('github_stars', { ascending: false })
                .limit(limit);

            if (!error && data) {
                return data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    slug: d.slug,
                    description: d.description || '',
                    summary: d.summary || '',
                    github_url: d.github_url || '',
                    github_stars: d.github_stars || 0,
                    install_count: d.install_count || 0,
                    category: d.category as Category,
                    tags: d.tags || [],
                    platforms: (d.platforms || ['universal']) as Platform[],
                    security_level: (d.security_level || 0) as SecurityLevel,
                    security_report: d.security_report || null,
                    last_scanned_at: d.last_scanned_at || null,
                    skill_md_content: d.skill_md_content || '',
                    usage_guide: d.usage_guide || '',
                    author: d.author || '',
                    license: d.license || '',
                    version: d.version || '1.0.0',
                    source: (d.source || 'github') as Skill['source'],
                    created_at: d.created_at || new Date().toISOString(),
                    updated_at: d.updated_at || new Date().toISOString(),
                }));
            }
        } catch (e) {
            console.error('Supabase getHotSkills failed:', e);
        }
    }

    return [...MOCK_SKILLS]
        .sort((a, b) => b.github_stars - a.github_stars)
        .slice(0, limit);
}

export async function getSkillsByCategory(category: Category, limit = 6): Promise<Skill[]> {
    const { supabase } = await import('./supabase');

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .eq('category', category)
                .order('github_stars', { ascending: false })
                .limit(limit);

            if (!error && data) {
                return data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    slug: d.slug,
                    description: d.description || '',
                    summary: d.summary || '',
                    github_url: d.github_url || '',
                    github_stars: d.github_stars || 0,
                    install_count: d.install_count || 0,
                    category: d.category as Category,
                    tags: d.tags || [],
                    platforms: (d.platforms || ['universal']) as Platform[],
                    security_level: (d.security_level || 0) as SecurityLevel,
                    security_report: d.security_report || null,
                    last_scanned_at: d.last_scanned_at || null,
                    skill_md_content: d.skill_md_content || '',
                    usage_guide: d.usage_guide || '',
                    author: d.author || '',
                    license: d.license || '',
                    version: d.version || '1.0.0',
                    source: (d.source || 'github') as Skill['source'],
                    created_at: d.created_at || new Date().toISOString(),
                    updated_at: d.updated_at || new Date().toISOString(),
                }));
            }
        } catch (e) {
            console.error('Supabase getSkillsByCategory failed:', e);
        }
    }

    return MOCK_SKILLS
        .filter(s => s.category === category)
        .sort((a, b) => b.github_stars - a.github_stars)
        .slice(0, limit);
}
