// SkillForge API 配置
// 开发时使用本地地址，生产环境使用 Vercel 部署地址
export const API_BASE_URL = process.env.SKILLFORGE_API_URL || 'https://skillforge.vercel.app';

export interface SkillInfo {
    id: string;
    name: string;
    slug: string;
    description: string;
    github_url: string;
    github_stars: number;
    install_count: number;
    category: string;
    tags: string[];
    platforms: string[];
    security_level: number;
    author: string;
    license: string;
    version: string;
    skill_md_content: string;
}

export interface SearchResult {
    skills: SkillInfo[];
    total: number;
}

/**
 * 从 SkillForge API 获取 Skill 信息
 */
export async function getSkillInfo(slug: string): Promise<SkillInfo | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/skills/${slug}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        // 如果 API 不可用，使用 GitHub 直接获取
        console.warn('API unavailable, trying GitHub fallback...');
        return null;
    }
}

/**
 * 搜索 Skills
 */
export async function searchSkills(query: string, options?: {
    category?: string;
    limit?: number;
}): Promise<SearchResult> {
    const params = new URLSearchParams({
        q: query,
        ...(options?.category && { category: options.category }),
        page_size: String(options?.limit || 10),
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/skills?${params}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('Search API unavailable');
        return { skills: [], total: 0 };
    }
}

/**
 * 从 GitHub 获取 SKILL.md 内容
 */
export async function getSkillFromGitHub(githubUrl: string): Promise<string | null> {
    // 解析 GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
        return null;
    }

    const [, owner, repo] = match;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/SKILL.md`;

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            // 尝试 master 分支
            const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/SKILL.md`;
            const masterResponse = await fetch(masterUrl);
            if (!masterResponse.ok) {
                return null;
            }
            return await masterResponse.text();
        }
        return await response.text();
    } catch (error) {
        return null;
    }
}

/**
 * 记录安装统计
 */
export async function logInstall(skillId: string, platform: string): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/api/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_id: skillId, platform }),
        });
    } catch {
        // 静默失败，不影响安装
    }
}
