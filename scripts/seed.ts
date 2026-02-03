/**
 * Skills 数据导入脚本
 * 将爬取的数据导入 Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { crawlAll, SkillData } from './crawlers/github.js';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.log('Running in dry-run mode (will not save to database)');
}

const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/**
 * 导入 Skills 到数据库
 */
async function importSkills(skills: SkillData[]) {
    if (!supabase) {
        console.log('\n--- Dry Run Results ---');
        skills.forEach((s, i) => {
            console.log(`${i + 1}. ${s.name}`);
            console.log(`   Slug: ${s.slug}`);
            console.log(`   Stars: ${s.github_stars}`);
            console.log(`   Category: ${s.category}`);
            console.log(`   Security: Level ${s.security_level}`);
            console.log('');
        });
        return;
    }

    console.log('\nImporting to Supabase...');

    for (const skill of skills) {
        try {
            // 使用 upsert 避免重复
            const { error } = await supabase
                .from('skills')
                .upsert({
                    name: skill.name,
                    slug: skill.slug,
                    description: skill.description,
                    summary: skill.summary,
                    github_url: skill.github_url,
                    github_stars: skill.github_stars,
                    install_count: skill.install_count,
                    category: skill.category,
                    tags: skill.tags,
                    platforms: skill.platforms,
                    security_level: skill.security_level,
                    skill_md_content: skill.skill_md_content,
                    usage_guide: skill.usage_guide,
                    author: skill.author,
                    license: skill.license,
                    version: skill.version,
                    source: skill.source,
                }, {
                    onConflict: 'slug',
                });

            if (error) {
                console.error(`  Failed to import ${skill.name}:`, error.message);
            } else {
                console.log(`  ✓ ${skill.name}`);
            }
        } catch (error) {
            console.error(`  Error importing ${skill.name}:`, error);
        }
    }

    console.log('\nImport complete!');
}

/**
 * 更新统计数据（每日任务）
 */
async function updateStats() {
    if (!supabase) {
        console.log('Supabase not configured, skipping stats update');
        return;
    }

    console.log('Updating GitHub stars...');

    // 获取所有 skills
    const { data: skills, error } = await supabase
        .from('skills')
        .select('id, slug, github_url');

    if (error || !skills) {
        console.error('Failed to fetch skills:', error);
        return;
    }

    for (const skill of skills) {
        const match = skill.github_url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;

        const [, owner, repo] = match;

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'SkillForge-Crawler',
                    ...(process.env.GITHUB_TOKEN && {
                        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    }),
                },
            });

            if (response.ok) {
                const data = await response.json();
                await supabase
                    .from('skills')
                    .update({ github_stars: data.stargazers_count })
                    .eq('id', skill.id);

                console.log(`  Updated ${skill.slug}: ${data.stargazers_count} stars`);
            }
        } catch {
            console.error(`  Failed to update ${skill.slug}`);
        }

        // 避免 rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// 主函数
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'crawl':
            const skills = await crawlAll();
            await importSkills(skills);
            break;

        case 'update':
            await updateStats();
            break;

        default:
            console.log('Usage:');
            console.log('  npx tsx seed.ts crawl   - Crawl and import skills');
            console.log('  npx tsx seed.ts update  - Update stats (GitHub stars)');
    }
}

main().catch(console.error);
