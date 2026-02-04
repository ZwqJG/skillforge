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

/**
 * 从 GitHub API 获取仓库信息
 */
async function getRepoInfo(owner: string, repo: string): Promise<{
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
 * 获取仓库中的 SKILL.md 文件列表
 */
async function getSkillFiles(owner: string, repo: string): Promise<string[]> {
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
async function getFileContent(owner: string, repo: string, path: string, branch = 'main'): Promise<string | null> {
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
function parseSkillMd(content: string): { name: string; description: string; tags: string[] } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
        // 尝试从内容中提取信息
        const titleMatch = content.match(/^#\s+(.+)/m);
        return {
            name: titleMatch?.[1] || 'Unknown',
            description: '',
            tags: [],
        };
    }

    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/);
    const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);

    return {
        name: nameMatch?.[1]?.trim() || 'Unknown',
        description: descMatch?.[1]?.trim() || '',
        tags: tagsMatch?.[1]?.split(',').map(t => t.trim().replace(/["']/g, '')) || [],
    };
}

/**
 * 生成 slug
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
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

        const parsed = parseSkillMd(content);
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
            category: source.category,
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
function generateSecurityReport(content: string, level: number): string {
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
