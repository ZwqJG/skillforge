/**
 * GitHub Skills 爬取器
 * 从知名仓库获取 Skills
 */

import { config } from 'dotenv';
config();

// 要爬取的 GitHub 仓库列表
export const GITHUB_SOURCES = [
    // 官方和厂商仓库
    { owner: 'anthropics', repo: 'skills', category: 'development', level: 3 },
    { owner: 'vercel-labs', repo: 'agent-skills', category: 'development', level: 3 },
    { owner: 'expo', repo: 'skills', category: 'development', level: 3 },
    { owner: 'remotion-dev', repo: 'skills', category: 'creative', level: 3 },

    // 方法论框架
    { owner: 'obra', repo: 'superpowers', category: 'development', level: 2 },

    // 营销领域
    { owner: 'coreyhaines31', repo: 'marketingskills', category: 'marketing', level: 2 },
];

export interface SkillData {
    name: string;
    slug: string;
    description: string;
    summary: string;
    github_url: string;
    github_stars: number;
    install_count: number;
    category: string;
    tags: string[];
    platforms: string[];
    security_level: number;
    security_report: string;
    skill_md_content: string;
    usage_guide: string;
    author: string;
    license: string;
    version: string;
    source: string;
}

type SkillCategory =
    | 'development'
    | 'operations'
    | 'design'
    | 'office'
    | 'marketing'
    | 'creative';

const CATEGORY_VALUES: SkillCategory[] = [
    'development',
    'operations',
    'design',
    'office',
    'marketing',
    'creative',
];

const CATEGORY_RULES: Array<{ category: SkillCategory; keywords: string[] }> = [
    {
        category: 'development',
        keywords: [
            'mcp', 'sdk', 'api', 'code', 'coding', 'typescript', 'javascript', 'python',
            'node', 'react', 'vue', 'next.js', 'nextjs', 'debug', 'test', 'testing',
            'git', 'workflow', 'database', 'sql', 'postgres',
        ],
    },
    {
        category: 'operations',
        keywords: [
            'deploy', 'deployment', 'devops', 'ci/cd', 'kubernetes', 'docker',
            'monitoring', 'incident', 'sre', 'infra', 'infrastructure',
        ],
    },
    {
        category: 'design',
        keywords: [
            'design system', 'ui', 'ux', 'accessibility', 'a11y', 'figma',
            'interface', 'layout', 'typography', 'frontend design',
        ],
    },
    {
        category: 'office',
        keywords: [
            'document', 'docx', 'word', 'ppt', 'pptx', 'presentation',
            'spreadsheet', 'xlsx', 'excel', 'pdf', 'report',
        ],
    },
    {
        category: 'marketing',
        keywords: [
            'marketing', 'seo', 'analytics', 'conversion', 'a/b', 'ab test',
            'growth', 'campaign', 'copywriting', 'content strategy',
        ],
    },
    {
        category: 'creative',
        keywords: [
            'creative', 'art', 'visual', 'poster', 'video', 'animation',
            'canvas', 'remotion', 'brand', 'generative',
        ],
    },
];

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
    { tag: 'mcp', keywords: ['mcp', 'model context protocol'] },
    { tag: 'api', keywords: ['api', 'rest api', 'graphql', 'openapi'] },
    { tag: 'frontend', keywords: ['frontend', 'ui', 'ux', 'interface'] },
    { tag: 'react', keywords: ['react'] },
    { tag: 'nextjs', keywords: ['next.js', 'nextjs'] },
    { tag: 'vue', keywords: ['vue'] },
    { tag: 'typescript', keywords: ['typescript'] },
    { tag: 'python', keywords: ['python'] },
    { tag: 'testing', keywords: ['test', 'testing', 'tdd', 'e2e', 'unit test'] },
    { tag: 'debugging', keywords: ['debug', 'troubleshoot', 'root cause'] },
    { tag: 'security', keywords: ['security', 'auth', 'permission', 'vulnerability'] },
    { tag: 'database', keywords: ['database', 'sql', 'postgres', 'supabase'] },
    { tag: 'devops', keywords: ['devops', 'deployment', 'ci/cd', 'kubernetes', 'docker'] },
    { tag: 'design', keywords: ['design', 'figma', 'layout', 'typography', 'design system'] },
    { tag: 'accessibility', keywords: ['accessibility', 'a11y'] },
    { tag: 'document', keywords: ['document', 'docx', 'word', 'pdf'] },
    { tag: 'spreadsheet', keywords: ['spreadsheet', 'xlsx', 'excel'] },
    { tag: 'presentation', keywords: ['presentation', 'ppt', 'pptx'] },
    { tag: 'seo', keywords: ['seo', 'search ranking', 'organic traffic'] },
    { tag: 'analytics', keywords: ['analytics', 'tracking', 'attribution'] },
    { tag: 'marketing', keywords: ['marketing', 'campaign', 'conversion', 'growth'] },
    { tag: 'copywriting', keywords: ['copywriting', 'ad copy', 'sales copy'] },
    { tag: 'creative', keywords: ['creative', 'art', 'visual'] },
    { tag: 'video', keywords: ['video', 'remotion'] },
    { tag: 'animation', keywords: ['animation', 'motion'] },
    { tag: 'canvas', keywords: ['canvas', 'poster', 'illustration'] },
    { tag: 'workflow', keywords: ['workflow', 'planning', 'orchestration', 'subagent'] },
    { tag: 'git', keywords: ['git', 'branch', 'worktree'] },
];

const TAG_ALIAS: Record<string, string> = {
    'next.js': 'nextjs',
    'next-js': 'nextjs',
    'a-b-testing': 'ab-testing',
    'a-b-test': 'ab-testing',
    'a-b': 'ab-testing',
    'a/b': 'ab-testing',
    'ui-ux': 'frontend',
    'ux-ui': 'frontend',
};

/**
 * 从 GitHub API 获取仓库信息
 */
export async function getRepoInfo(owner: string, repo: string): Promise<{
    stars: number;
    description: string;
    license: string;
} | null> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SkillForge-Crawler',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

        if (!response.ok) {
            console.error(`Failed to fetch ${owner}/${repo}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return {
            stars: data.stargazers_count || 0,
            description: data.description || '',
            license: data.license?.spdx_id || 'Unknown',
        };
    } catch (error) {
        console.error(`Error fetching ${owner}/${repo}:`, error);
        return null;
    }
}

/**
 * 通过 GitHub API 获取 README 内容（Base64 解码）
 */
export async function getReadmeContentFromApi(owner: string, repo: string): Promise<string | null> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SkillForge-Crawler',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        if (!data?.content || data?.encoding !== 'base64') {
            return null;
        }
        return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
        return null;
    }
}

/**
 * 获取仓库中的 SKILL.md 文件列表
 */
export async function getSkillFiles(owner: string, repo: string): Promise<string[]> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SkillForge-Crawler',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const skillFiles: string[] = [];

    // 检查根目录的 SKILL.md
    try {
        const rootResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/SKILL.md`,
            { headers }
        );
        if (rootResponse.ok) {
            skillFiles.push('SKILL.md');
        }
    } catch {
        // 根目录没有 SKILL.md
    }

    // 检查 skills/ 目录
    try {
        const skillsDirResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/skills`,
            { headers }
        );

        if (skillsDirResponse.ok) {
            const items = await skillsDirResponse.json();
            for (const item of items) {
                if (item.type === 'dir') {
                    // 检查子目录中的 SKILL.md
                    const subResponse = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/skills/${item.name}/SKILL.md`,
                        { headers }
                    );
                    if (subResponse.ok) {
                        skillFiles.push(`skills/${item.name}/SKILL.md`);
                    }
                }
            }
        }
    } catch {
        // skills/ 目录不存在
    }

    return skillFiles;
}

/**
 * 获取文件内容
 */
export async function getFileContent(owner: string, repo: string, path: string, branch = 'main'): Promise<string | null> {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            // 尝试 master 分支
            const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`;
            const masterResponse = await fetch(masterUrl);
            if (!masterResponse.ok) {
                return null;
            }
            return await masterResponse.text();
        }
        return await response.text();
    } catch {
        return null;
    }
}

/**
 * 解析 SKILL.md frontmatter
 */
export function parseSkillMd(
    content: string,
    options: { fallbackCategory?: string } = {}
): { name: string; description: string; tags: string[]; category: string } {
    const frontmatter = extractFrontmatter(content);
    const metadataBlock = extractYamlBlock(frontmatter, 'metadata');
    const h1Title = content.match(/^#\s+(.+)/m)?.[1]?.trim() || 'Unknown';

    const name = parseYamlScalar(frontmatter, 'name') || h1Title;
    const descriptionFromYaml = parseYamlScalar(frontmatter, 'description');

    const explicitCategory = normalizeCategory(
        parseYamlScalar(frontmatter, 'category') || parseYamlScalar(metadataBlock, 'category')
    );

    const explicitTags = dedupeTags([
        ...parseYamlList(frontmatter, 'tags'),
        ...parseYamlList(metadataBlock, 'tags'),
    ]);

    const inferenceText = buildInferenceText(name, descriptionFromYaml, content);
    const inferredCategory = inferCategory(inferenceText, explicitCategory || options.fallbackCategory);
    const inferredTags = inferTags(inferenceText, inferredCategory);

    const category = explicitCategory || inferredCategory;
    const tags = dedupeTags([...explicitTags, ...inferredTags]);
    if (tags.length === 0) {
        tags.push(category);
    }

    const description = descriptionFromYaml || buildDescriptionFallback(content, name, category, tags);

    return {
        name,
        description,
        tags: tags.slice(0, 8),
        category,
    };
}

/**
 * 生成 slug
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function extractFrontmatter(content: string): string {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    return frontmatterMatch?.[1] || '';
}

function extractYamlBlock(frontmatter: string, key: string): string {
    if (!frontmatter) return '';
    const lines = frontmatter.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed.startsWith(`${key}:`)) continue;

        const keyIndent = raw.length - raw.trimStart().length;
        const inline = trimmed.slice(key.length + 1).trim();
        if (inline) return inline;

        const blockLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
            const nextRaw = lines[j];
            const nextTrimmed = nextRaw.trim();
            if (!nextTrimmed) {
                blockLines.push('');
                continue;
            }
            const nextIndent = nextRaw.length - nextRaw.trimStart().length;
            if (nextIndent <= keyIndent) break;
            blockLines.push(nextRaw.slice(keyIndent + 2));
        }
        return blockLines.join('\n').trim();
    }
    return '';
}

function parseYamlScalar(frontmatter: string, key: string): string {
    if (!frontmatter) return '';
    const lines = frontmatter.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed.startsWith(`${key}:`)) continue;

        const keyIndent = raw.length - raw.trimStart().length;
        const inlineValue = trimmed.slice(key.length + 1).trim();
        if (inlineValue && !['|', '>', '|-', '>-'].includes(inlineValue)) {
            return cleanYamlToken(inlineValue);
        }

        const valueLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
            const nextRaw = lines[j];
            const nextTrimmed = nextRaw.trim();
            if (!nextTrimmed) continue;
            const nextIndent = nextRaw.length - nextRaw.trimStart().length;
            if (nextIndent <= keyIndent && /^[A-Za-z0-9_-]+:\s*/.test(nextTrimmed)) break;
            if (nextIndent <= keyIndent) break;
            valueLines.push(nextTrimmed);
        }

        if (valueLines.length > 0) {
            return cleanYamlToken(valueLines.join(' ').replace(/\s+/g, ' ').trim());
        }
    }
    return '';
}

function parseYamlList(frontmatter: string, key: string): string[] {
    if (!frontmatter) return [];
    const lines = frontmatter.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed.startsWith(`${key}:`)) continue;

        const keyIndent = raw.length - raw.trimStart().length;
        const inlineValue = trimmed.slice(key.length + 1).trim();
        if (inlineValue.startsWith('[') && inlineValue.endsWith(']')) {
            return splitTagLikeValue(inlineValue.slice(1, -1));
        }
        if (inlineValue) {
            return splitTagLikeValue(inlineValue);
        }

        const listValues: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
            const nextRaw = lines[j];
            const nextTrimmed = nextRaw.trim();
            if (!nextTrimmed) continue;
            const nextIndent = nextRaw.length - nextRaw.trimStart().length;
            if (nextIndent <= keyIndent && /^[A-Za-z0-9_-]+:\s*/.test(nextTrimmed)) break;
            if (nextIndent <= keyIndent) break;

            const itemMatch = nextTrimmed.match(/^-\s+(.+)$/);
            if (itemMatch) listValues.push(itemMatch[1]);
        }
        return splitTagLikeValue(listValues.join(','));
    }
    return [];
}

function splitTagLikeValue(value: string): string[] {
    return value
        .split(',')
        .map(cleanYamlToken)
        .filter(Boolean);
}

function cleanYamlToken(value: string): string {
    return value.trim().replace(/^['"]|['"]$/g, '');
}

function normalizeCategory(category: string): SkillCategory | '' {
    const normalized = category.trim().toLowerCase();
    return CATEGORY_VALUES.includes(normalized as SkillCategory)
        ? (normalized as SkillCategory)
        : '';
}

function inferCategory(text: string, fallbackCategory?: string): SkillCategory {
    let best: SkillCategory | '' = '';
    let bestScore = -1;
    for (const rule of CATEGORY_RULES) {
        const score = rule.keywords.reduce((acc, keyword) => (
            acc + (keywordHit(text, keyword) ? (keyword.includes(' ') ? 2 : 1) : 0)
        ), 0);
        if (score > bestScore) {
            best = rule.category;
            bestScore = score;
        }
    }
    if (best && bestScore > 0) return best;
    return normalizeCategory(fallbackCategory || '') || 'development';
}

function inferTags(text: string, category: SkillCategory): string[] {
    const scored: Array<{ tag: string; score: number }> = [];
    for (const rule of TAG_RULES) {
        const score = rule.keywords.reduce((acc, keyword) => (
            acc + (keywordHit(text, keyword) ? 1 : 0)
        ), 0);
        if (score > 0) scored.push({ tag: rule.tag, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const inferred = scored.map(s => s.tag);
    if (!inferred.includes(category)) inferred.push(category);
    return dedupeTags(inferred).slice(0, 8);
}

function normalizeTag(tag: string): string {
    const normalized = cleanYamlToken(tag)
        .toLowerCase()
        .replace(/^#/, '')
        .replace(/[_\s/]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '');
    return TAG_ALIAS[normalized] || normalized;
}

function dedupeTags(tags: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const rawTag of tags) {
        const tag = normalizeTag(rawTag);
        if (!tag || seen.has(tag)) continue;
        seen.add(tag);
        result.push(tag);
    }
    return result;
}

function buildDescriptionFallback(
    content: string,
    name: string,
    category: SkillCategory,
    tags: string[]
): string {
    const body = content
        .replace(/^---\s*\n[\s\S]*?\n---/m, '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/[#>*-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (body.length > 0) {
        return body.slice(0, 220);
    }

    const topTags = tags.slice(0, 3).join(', ');
    return `${name} skill focused on ${topTags || category} tasks.`;
}

function buildInferenceText(name: string, description: string, content: string): string {
    const head = content
        .replace(/^---\s*\n[\s\S]*?\n---/m, '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 1600);
    return `${name}\n${description}\n${head}`.toLowerCase();
}

function keywordHit(text: string, keyword: string): boolean {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return false;
    if (normalizedKeyword.includes(' ')) {
        return text.includes(normalizedKeyword);
    }
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
    return pattern.test(text);
}

/**
 * 爬取单个仓库
 */
export async function crawlRepository(source: typeof GITHUB_SOURCES[0]): Promise<SkillData[]> {
    console.log(`Crawling ${source.owner}/${source.repo}...`);

    const repoInfo = await getRepoInfo(source.owner, source.repo);
    if (!repoInfo) {
        console.error(`  Failed to get repo info`);
        return [];
    }

    // 获取 README 作为 usage_guide
    const readme = await getFileContent(source.owner, source.repo, 'README.md') ||
        await getFileContent(source.owner, source.repo, 'readme.md') || '';

    const skillFiles = await getSkillFiles(source.owner, source.repo);
    console.log(`  Found ${skillFiles.length} SKILL.md files`);

    const skills: SkillData[] = [];

    for (const filePath of skillFiles) {
        const content = await getFileContent(source.owner, source.repo, filePath);
        if (!content) {
            console.log(`  Failed to get content: ${filePath}`);
            continue;
        }

        const parsed = parseSkillMd(content, { fallbackCategory: source.category });
        const slug = generateSlug(parsed.name);

        // 生成安全报告
        const securityReport = generateSecurityReport(content, source.level);

        skills.push({
            name: parsed.name,
            slug,
            description: parsed.description || repoInfo.description,
            summary: parsed.description || repoInfo.description,
            github_url: `https://github.com/${source.owner}/${source.repo}`,
            github_stars: repoInfo.stars,
            install_count: 0,
            category: parsed.category || source.category,
            tags: parsed.tags.length > 0 ? parsed.tags : [source.category],
            platforms: ['claude-code', 'cursor', 'universal'],
            security_level: source.level,
            security_report: securityReport,
            skill_md_content: content,
            usage_guide: readme,
            author: source.owner,
            license: repoInfo.license,
            version: '1.0.0',
            source: 'github',
        });

        console.log(`  Parsed: ${parsed.name}`);
    }

    return skills;
}

/**
 * 生成安全报告
 */
export function generateSecurityReport(content: string, level: number): string {
    const checks = [];
    const now = new Date().toISOString();

    // 检查是否有危险命令
    const hasDangerousCommands = /rm\s+-rf|sudo|curl.*\|.*sh|wget.*\|.*bash/i.test(content);
    checks.push({
        name: '危险命令检查',
        status: hasDangerousCommands ? 'warning' : 'passed',
        message: hasDangerousCommands ? '发现潜在危险命令' : '未发现危险命令',
    });

    // 检查是否有网络请求
    const hasNetworkCalls = /fetch|axios|http|https:\/\/|api\./i.test(content);
    checks.push({
        name: '网络请求检查',
        status: hasNetworkCalls ? 'warning' : 'passed',
        message: hasNetworkCalls ? '包含网络请求相关代码' : '未发现外部网络请求',
    });

    // 检查是否有文件操作
    const hasFileOps = /fs\.|writeFile|readFile|unlink|mkdir|rmdir/i.test(content);
    checks.push({
        name: '文件操作检查',
        status: hasFileOps ? 'warning' : 'passed',
        message: hasFileOps ? '包含文件系统操作' : '未发现文件系统操作',
    });

    // 检查是否有敏感信息模式
    const hasSensitivePatterns = /password|secret|token|api_key|private_key/i.test(content);
    checks.push({
        name: '敏感信息检查',
        status: hasSensitivePatterns ? 'warning' : 'passed',
        message: hasSensitivePatterns ? '包含敏感信息相关词汇' : '未发现敏感信息模式',
    });

    // 根据检查结果和预设等级确定最终等级
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const finalLevel = warningCount > 2 ? Math.min(level, 1) : level;

    const report = {
        scanned_at: now,
        version: '1.0.0',
        level: finalLevel,
        checks,
        permissions: [],
    };

    return JSON.stringify(report);
}

/**
 * 爬取所有仓库
 */
export async function crawlAll(): Promise<SkillData[]> {
    const allSkills: SkillData[] = [];

    for (const source of GITHUB_SOURCES) {
        const skills = await crawlRepository(source);
        allSkills.push(...skills);

        // 避免触发 GitHub rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nTotal: ${allSkills.length} skills crawled`);
    return allSkills;
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    crawlAll().then(skills => {
        console.log('\nResults:');
        skills.forEach(s => console.log(`  - ${s.name} (${s.github_stars} stars)`));
    });
}
