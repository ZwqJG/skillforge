import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// AI 审核 API（通义千问）
const QIANWEN_API_KEY = process.env.QIANWEN_API_KEY;
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

interface GitHubRepoInfo {
    name: string;
    description: string;
    stars: number;
    license: string | null;
    owner: string;
}

export async function POST(request: NextRequest) {
    try {
        const { github_url } = await request.json();

        if (!github_url) {
            return NextResponse.json({ error: '请提供 GitHub 仓库地址' }, { status: 400 });
        }

        // 1. 验证用户身份
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const accessToken = authHeader.replace('Bearer ', '');
        const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: { user: currentUser }, error: authError } = await anonSupabase.auth.getUser(accessToken);

        if (authError || !currentUser) {
            return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. 检查每日提交限制（10 次/天）
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyCount } = await supabase
            .from('daily_submissions')
            .select('count')
            .eq('user_id', currentUser.id)
            .eq('submission_date', today)
            .single();

        if (dailyCount && dailyCount.count >= 10) {
            return NextResponse.json({ error: '今日提交已达上限（10 个/天）' }, { status: 429 });
        }

        // 3. 解析 GitHub URL
        const match = github_url.match(/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
        if (!match) {
            return NextResponse.json({ error: '无效的 GitHub 仓库地址' }, { status: 400 });
        }
        const [, owner, repo] = match;
        const githubKey = `${owner}/${repo}`.toLowerCase();

        // 4. 检查重复提交
        const { data: existing } = await supabase
            .from('skills')
            .select('id, name')
            .eq('github_key', githubKey)
            .single();

        if (existing) {
            return NextResponse.json({
                error: `该仓库已被提交，Skill 名称：${existing.name}`
            }, { status: 409 });
        }

        // 5. 获取 GitHub 仓库信息
        const repoInfo = await fetchGitHubRepo(owner, repo);
        if (!repoInfo) {
            return NextResponse.json({ error: '无法获取仓库信息，请确认仓库是公开的' }, { status: 404 });
        }

        // 6. 获取 SKILL.md
        const skillMd = await fetchGitHubFile(owner, repo, 'SKILL.md');
        if (!skillMd) {
            return NextResponse.json({ error: '仓库中未找到 SKILL.md 文件' }, { status: 400 });
        }

        // 7. 获取 README.md（可选）
        const readme = await fetchGitHubFile(owner, repo, 'README.md') ||
            await fetchGitHubFile(owner, repo, 'readme.md') || '';

        // 8. AI 审核
        const reviewResult = await aiReview(skillMd, readme, repoInfo);

        if (!reviewResult.passed) {
            return NextResponse.json({
                error: '审核未通过',
                reject_reason: reviewResult.reject_reason,
                suggestions: reviewResult.suggestions,
            }, { status: 400 });
        }

        // 9. 解析 SKILL.md
        const skillInfo = parseSkillMd(skillMd);

        // 10. 生成 slug
        const slug = generateSlug(skillInfo.name || repoInfo.name);

        // 11. 创建安全报告
        const securityReport = {
            scanned_at: new Date().toISOString(),
            version: '1.0.0',
            level: reviewResult.security_level,
            checks: reviewResult.analysis ? Object.entries(reviewResult.analysis).map(([key, val]: [string, any]) => ({
                name: key,
                status: val.score >= 15 ? 'passed' : 'warning',
                message: val.reason,
            })) : [],
            risks: reviewResult.risks || [],
            permissions: [],
        };

        // 12. 插入数据库
        const { data: skill, error: insertError } = await supabase
            .from('skills')
            .insert({
                name: skillInfo.name || repoInfo.name,
                slug,
                description: skillInfo.description || repoInfo.description,
                summary: skillInfo.description || repoInfo.description,
                github_url: github_url,
                github_key: githubKey,
                github_stars: repoInfo.stars,
                install_count: 0,
                category: skillInfo.category || 'development',
                tags: skillInfo.tags || [],
                platforms: ['claude-code', 'cursor', 'universal'],
                security_level: reviewResult.security_level,
                security_report: securityReport,
                last_scanned_at: new Date().toISOString(),
                skill_md_content: skillMd,
                usage_guide: readme,
                author: repoInfo.owner,
                license: repoInfo.license,
                version: '1.0.0',
                source: 'user',
                submitted_by: currentUser.id,
                status: 'approved',
                ai_review_result: reviewResult,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: '保存失败，请稍后重试' }, { status: 500 });
        }

        // 13. 更新每日提交计数
        await supabase.from('daily_submissions').upsert({
            user_id: currentUser.id,
            submission_date: today,
            count: (dailyCount?.count || 0) + 1,
        }, { onConflict: 'user_id,submission_date' });

        return NextResponse.json({
            success: true,
            skill: {
                id: skill.id,
                name: skill.name,
                slug: skill.slug,
                security_level: skill.security_level,
            },
        });

    } catch (error: any) {
        console.error('Submit error:', error);
        return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 });
    }
}

// 获取 GitHub 仓库信息
async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepoInfo | null> {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SkillForge',
                ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
            name: data.name,
            description: data.description || '',
            stars: data.stargazers_count,
            license: data.license?.spdx_id || null,
            owner: data.owner.login,
        };
    } catch {
        return null;
    }
}

// 获取 GitHub 文件内容
async function fetchGitHubFile(owner: string, repo: string, path: string): Promise<string | null> {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SkillForge',
                ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return null;
    } catch {
        return null;
    }
}

// AI 审核（通义千问）
async function aiReview(skillMd: string, readme: string, repoInfo: GitHubRepoInfo) {
    // 如果没有配置 AI API，使用规则扫描
    if (!QIANWEN_API_KEY) {
        return ruleBasedReview(skillMd, readme, repoInfo);
    }

    const prompt = `你是一个 Skill 安全审核专家。请分析以下 SKILL.md 内容，评估其安全性和质量。

【仓库信息】
名称：${repoInfo.name}
作者：${repoInfo.owner}
Stars：${repoInfo.stars}
描述：${repoInfo.description}

【SKILL.md 内容】
${skillMd.substring(0, 5000)}

【README 内容（部分）】
${readme.substring(0, 2000)}

请从以下维度打分（0-100）并提供分析：

1. **functionality**（20分）：Skill 的功能是否描述清晰？
2. **security**（40分）：是否存在潜在安全风险？（命令执行、网络请求、文件操作等）
3. **usefulness**（20分）：该 Skill 是否对用户有实际价值？
4. **standard**（20分）：格式是否规范，是否包含必要字段？

危险模式检测：
- 危险命令：rm -rf、curl | sh、wget -O - | sh 等
- 敏感路径：~/.ssh、/etc/passwd、/etc/shadow 等
- 如果发现这些模式，security 分数应该很低

请返回 JSON 格式（只返回 JSON，不要其他内容）：
{
  "total_score": 85,
  "passed": true,
  "security_level": 2,
  "analysis": {
    "functionality": { "score": 18, "reason": "..." },
    "security": { "score": 35, "reason": "..." },
    "usefulness": { "score": 17, "reason": "..." },
    "standard": { "score": 15, "reason": "..." }
  },
  "risks": ["风险1", "风险2"],
  "suggestions": ["建议1", "建议2"],
  "reject_reason": null
}`;

    try {
        const response = await fetch(QIANWEN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${QIANWEN_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                messages: [
                    { role: 'system', content: '你是一个专业的代码安全审核专家。请严格按照 JSON 格式返回审核结果。' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            console.error('AI review failed:', await response.text());
            return ruleBasedReview(skillMd, readme, repoInfo);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // 尝试解析 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            // 确保有必要字段
            return {
                total_score: result.total_score || 0,
                passed: result.passed ?? result.total_score >= 60,
                security_level: result.security_level ?? (result.total_score >= 85 ? 2 : 1),
                analysis: result.analysis || {},
                risks: result.risks || [],
                suggestions: result.suggestions || [],
                reject_reason: result.passed ? null : (result.reject_reason || '安全评分未达标'),
            };
        }
    } catch (e) {
        console.error('AI review error:', e);
    }

    return ruleBasedReview(skillMd, readme, repoInfo);
}

// 规则扫描（备用）
function ruleBasedReview(skillMd: string, readme: string, repoInfo: GitHubRepoInfo) {
    const content = skillMd + '\n' + readme;
    let score = 70;
    const risks: string[] = [];
    const suggestions: string[] = [];

    // 检查危险命令
    if (/rm\s+-rf|sudo\s+rm|curl.*\|.*sh|wget.*\|.*bash/i.test(content)) {
        score -= 40;
        risks.push('检测到危险命令模式（如 rm -rf, curl | sh）');
    }

    // 检查敏感路径
    if (/~\/\.ssh|\/etc\/passwd|\/etc\/shadow|\.env\b/i.test(content)) {
        score -= 30;
        risks.push('检测到敏感路径访问');
    }

    // 检查外部网络调用
    if (/fetch\(|axios\.|http:\/\/|https:\/\/(?!github\.com)/i.test(content)) {
        score -= 10;
        risks.push('包含外部网络调用');
    }

    // 加分项
    if (repoInfo.stars > 100) score += 5;
    if (repoInfo.stars > 1000) score += 5;
    if (repoInfo.license) score += 5;

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    const passed = score >= 60;
    const security_level = score >= 85 ? 2 : score >= 60 ? 1 : 0;

    if (!passed) {
        suggestions.push('请移除危险命令或敏感路径访问');
        suggestions.push('确保 Skill 不会执行破坏性操作');
    }

    return {
        total_score: score,
        passed,
        security_level,
        analysis: {
            security: { score: score, reason: risks.length > 0 ? risks.join('; ') : '未发现明显安全风险' },
        },
        risks,
        suggestions,
        reject_reason: passed ? null : '安全扫描未通过：' + risks.join(', '),
    };
}

// 解析 SKILL.md
function parseSkillMd(content: string) {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    let name = '';
    let description = '';
    let category = '';
    let tags: string[] = [];

    if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        name = yaml.match(/name:\s*(.+)/)?.[1]?.trim() || '';
        description = yaml.match(/description:\s*(.+)/)?.[1]?.trim() || '';
        category = yaml.match(/category:\s*(.+)/)?.[1]?.trim() || '';
        const tagsMatch = yaml.match(/tags:\s*\[(.*?)\]/);
        if (tagsMatch) {
            tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
        }
    }

    // 如果没有 frontmatter，尝试从 H1 标题获取名称
    if (!name) {
        const h1Match = content.match(/^#\s+(.+)/m);
        name = h1Match?.[1]?.trim() || 'Untitled Skill';
    }

    return { name, description, category, tags };
}

// 生成 slug
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) + '-' + Date.now().toString(36);
}
