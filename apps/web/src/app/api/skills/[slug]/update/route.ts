import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractSkillMetadata } from '@/lib/skill-metadata';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // 验证用户身份
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

        // 获取 Skill 信息
        const { data: skill, error: fetchError } = await supabase
            .from('skills')
            .select('*')
            .eq('slug', slug)
            .single();

        if (fetchError || !skill) {
            return NextResponse.json({ error: 'Skill 不存在' }, { status: 404 });
        }

        // 验证所有权
        if (skill.submitted_by !== currentUser.id) {
            return NextResponse.json({ error: '你没有权限更新此 Skill' }, { status: 403 });
        }

        // 解析 GitHub URL
        const match = skill.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json({ error: '无效的 GitHub 仓库地址' }, { status: 400 });
        }
        const [, owner, repo] = match;

        // 更新状态为 updating
        await supabase
            .from('skills')
            .update({ status: 'updating' })
            .eq('slug', slug);

        // 重新获取 GitHub 信息
        const repoInfo = await fetchGitHubRepo(owner, repo);
        if (!repoInfo) {
            await supabase.from('skills').update({ status: 'approved' }).eq('slug', slug);
            return NextResponse.json({ error: '无法获取仓库信息' }, { status: 404 });
        }

        // 获取 SKILL.md
        const skillMd = await fetchGitHubFile(owner, repo, 'SKILL.md');
        if (!skillMd) {
            await supabase.from('skills').update({ status: 'approved' }).eq('slug', slug);
            return NextResponse.json({ error: '仓库中未找到 SKILL.md 文件' }, { status: 400 });
        }

        // 获取 README.md
        const readme = await fetchGitHubFile(owner, repo, 'README.md') ||
            await fetchGitHubFile(owner, repo, 'readme.md') || '';

        // 解析 SKILL.md
        const skillInfo = extractSkillMetadata(skillMd, 'development');

        // 更新数据库
        const { error: updateError } = await supabase
            .from('skills')
            .update({
                name: skillInfo.name || skill.name,
                description: skillInfo.description || skill.description,
                summary: skillInfo.description || skill.summary,
                github_stars: repoInfo.stars,
                category: skillInfo.category || skill.category,
                tags: skillInfo.tags.length > 0 ? skillInfo.tags : skill.tags,
                skill_md_content: skillMd,
                usage_guide: readme,
                license: repoInfo.license || skill.license,
                status: 'approved',
                updated_at: new Date().toISOString(),
            })
            .eq('slug', slug);

        if (updateError) {
            console.error('Update error:', updateError);
            await supabase.from('skills').update({ status: 'approved' }).eq('slug', slug);
            return NextResponse.json({ error: '更新失败' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 });
    }
}

// 获取 GitHub 仓库信息
async function fetchGitHubRepo(owner: string, repo: string) {
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
