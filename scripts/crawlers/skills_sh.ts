/**
 * Skills.sh 爬取器（验证模式）
 * 从 skills.sh All Time 榜单获取前100个 skill，解析详情页中的 GitHub 地址，并按现有规则爬取
 */

import { config } from 'dotenv';
import * as cheerio from 'cheerio';
import {
    getRepoInfo,
    getSkillFiles,
    getFileContent,
    parseSkillMd,
    generateSlug,
    generateSecurityReport,
    type SkillData,
    getReadmeContentFromApi,
} from './github.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILLS_SH_URL = process.env.SKILLS_SH_URL || 'https://skills.sh/';
const BLOCKED_SLUGS = new Set(['search', 'categories', 'category', 'tags', 'tag', 'submit', 'about', 'docs', 'login', 'signup', 'trending', 'hot']);

// ==================== 数据类型定义 ====================

interface LeaderboardItem {
    rank: number;
    slug: string;
    detail_url: string;
}

interface DetailPageResult {
    rank: number;
    slug: string;
    detail_url: string;
    github_url?: string;
    error?: string;
    error_code?: string;
}

interface CrawlResult {
    rank: number;
    slug: string;
    detail_url: string;
    github_url: string;
    skill?: SkillData;
    error?: string;
    error_code?: string;
    match_type?: 'exact' | 'fuzzy' | 'readme';
    match_score?: number;
}

interface OutputResult {
    summary: {
        total_requested: number;
        total_fetched: number;
        unique_skills: number;
        no_github: number;
        no_match: number;
        duplicates: number;
        errors: number;
    };
    items: CrawlResult[];
    duplicates: CrawlResult[];
    failed: CrawlResult[];
}

// ==================== 工具函数 ====================

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的 fetch
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'SkillForge-Crawler/1.0',
                },
            });
            return response;
        } catch (error) {
            lastError = error as Error;
            console.error(`  Fetch attempt ${i + 1} failed: ${error}`);
            const cause = (error as { cause?: unknown })?.cause;
            if (cause) {
                console.error(`  Cause: ${String(cause)}`);
            }
            if (i < maxRetries - 1) {
                await sleep(1000 * Math.pow(2, i)); // 指数退避
            }
        }
    }

    throw lastError || new Error('Fetch failed');
}

// ==================== 核心爬取函数 ====================

/**
 * 1. 获取 All Time 榜单前100条
 */
async function fetchLeaderboard(limit = 100): Promise<LeaderboardItem[]> {
    console.log(`\n[1/4] 获取 skills.sh All Time 榜单前 ${limit} 条...`);

    try {
        const response = await fetchWithRetry(SKILLS_SH_URL);
        if (!response.ok) {
            console.error(`  ✗ 获取榜单失败: ${response.status} ${response.statusText}`);
            return [];
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const items: LeaderboardItem[] = [];
        const seen = new Set<string>();

        // 解析榜单表格或列表
        // 根据实际 HTML 结构调整选择器
        $('table tbody tr, .skill-item, [data-skill]').each((index, element) => {
            if (items.length >= limit) return false; // 只取前100条

            const $el = $(element);

            // 尝试多种可能的结构
            let slug = $el.attr('data-slug') || 
                      $el.find('[data-slug]').attr('data-slug') ||
                      $el.find('a').attr('href')?.split('/').pop() || '';

            let detailUrl = $el.find('a').attr('href') || '';

            // 如果是相对路径，补全为完整URL
            if (detailUrl && !detailUrl.startsWith('http')) {
                detailUrl = `https://skills.sh${detailUrl.startsWith('/') ? '' : '/'}${detailUrl}`;
            }

            if (slug && detailUrl && !seen.has(detailUrl)) {
                if (BLOCKED_SLUGS.has(slug)) {
                    return;
                }
                seen.add(detailUrl);
                items.push({
                    rank: items.length + 1,
                    slug: slug.trim(),
                    detail_url: detailUrl.trim(),
                });
            }
        });

        // 若解析失败，尝试从所有链接中推断详情页（支持相对路径）
        if (items.length === 0) {
            const base = new URL(SKILLS_SH_URL);
            $('a[href]').each((index, element) => {
                if (items.length >= limit) return false;
                const href = $(element).attr('href') || '';
                if (!href) return;

                let detailUrl = href;
                if (detailUrl.startsWith('/')) {
                    detailUrl = `${base.origin}${detailUrl}`;
                }
                if (!detailUrl.startsWith('http')) return;

                try {
                    const url = new URL(detailUrl);
                    if (url.hostname !== base.hostname) return;
                    const segments = url.pathname.split('/').filter(Boolean);
                    if (segments.length === 0) return;
                    const slug = segments[segments.length - 1];
                    if (!/^[A-Za-z0-9_.-]+$/.test(slug)) return;
                    if (BLOCKED_SLUGS.has(slug)) return;
                    if (!seen.has(detailUrl)) {
                        seen.add(detailUrl);
                        items.push({
                            rank: items.length + 1,
                            slug,
                            detail_url: detailUrl,
                        });
                    }
                } catch {
                    // ignore invalid URL
                }
            });
        }

        // 若解析失败，使用正则回退从 HTML 中提取详情页链接
        if (items.length === 0) {
            const linkRegex = /https:\/\/skills\.sh\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g;
            let match: RegExpExecArray | null;
            while ((match = linkRegex.exec(html)) !== null && items.length < limit) {
                const detailUrl = match[0];
                if (seen.has(detailUrl)) continue;
                const slug = match[3];
                if (BLOCKED_SLUGS.has(slug)) continue;
                seen.add(detailUrl);
                items.push({
                    rank: items.length + 1,
                    slug,
                    detail_url: detailUrl,
                });
            }
        }

        console.log(`  ✓ 成功获取 ${items.length} 条记录`);
        return items.slice(0, limit);

    } catch (error) {
        console.error(`  ✗ 获取榜单失败:`, error);
        return [];
    }
}

/**
 * 2. 解析详情页，提取 GitHub 地址
 */
export async function parseDetailPage(item: LeaderboardItem): Promise<DetailPageResult> {
    try {
        const response = await fetchWithRetry(item.detail_url);
        const html = await response.text();

        // 从导入命令中提取 GitHub 地址
        // 例如: npx skills add https://github.com/vercel-labs/skills --skill find-skills
        const githubUrlMatch = html.match(/(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/);

        if (githubUrlMatch) {
            return {
                rank: item.rank,
                slug: item.slug,
                detail_url: item.detail_url,
                github_url: githubUrlMatch[1],
            };
        } else {
            return {
                rank: item.rank,
                slug: item.slug,
                detail_url: item.detail_url,
                error: 'No GitHub URL found',
                error_code: 'no_github_url',
            };
        }
    } catch (error) {
        return {
            rank: item.rank,
            slug: item.slug,
            detail_url: item.detail_url,
            error: `Parse failed: ${error}`,
            error_code: 'detail_fetch_failed',
        };
    }
}

// ==================== Slug 匹配工具 ====================
function normalizeSlug(slug: string): string {
    return slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function tokenizeSlug(slug: string): string[] {
    return normalizeSlug(slug).split('-').filter(Boolean);
}

function jaccardSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a);
    const setB = new Set(b);
    let intersection = 0;
    for (const token of setA) {
        if (setB.has(token)) intersection += 1;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}

function getFuzzyMatchScore(target: string, candidate: string): number {
    const t = normalizeSlug(target);
    const c = normalizeSlug(candidate);
    if (!t || !c) return 0;
    if (t === c) return 1;
    if (t.includes(c) || c.includes(t)) return 0.9;
    const jaccard = jaccardSimilarity(tokenizeSlug(t), tokenizeSlug(c));
    const lev = levenshtein(t, c);
    const levScore = 1 - lev / Math.max(t.length, c.length);
    return Math.max(jaccard, levScore);
}

function findBestFuzzyMatch(
    target: string,
    candidates: Array<{ slug: string; content: string; parsed: ReturnType<typeof parseSkillMd> }>
) {
    let best = null as null | { slug: string; content: string; parsed: ReturnType<typeof parseSkillMd>; score: number };
    for (const candidate of candidates) {
        const score = getFuzzyMatchScore(target, candidate.slug);
        if (!best || score > best.score) {
            best = { ...candidate, score };
        }
    }
    if (!best) return null;
    return best;
}

/**
 * 3. 从 GitHub 爬取并匹配 slug 对应的 skill
 */
export async function crawlGitHubForSlug(
    githubUrl: string,
    targetSlug: string
): Promise<{ skill: SkillData | null; errorCode?: string; errorDetail?: string; matchType?: 'exact' | 'fuzzy' | 'readme'; matchScore?: number }> {
    try {
        const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            console.error(`  ✗ Invalid GitHub URL: ${githubUrl}`);
            return { skill: null, errorCode: 'invalid_github_url', errorDetail: 'Invalid GitHub URL' };
        }

        const [, owner, repo] = match;

        const repoInfo = await getRepoInfo(owner, repo);
        const repoMeta = repoInfo || { stars: 0, description: '', license: 'Unknown' };

        const readme = await getFileContent(owner, repo, 'README.md') ||
            await getFileContent(owner, repo, 'readme.md') ||
            await getReadmeContentFromApi(owner, repo) || '';

        // 直接尝试常见路径，尽量减少 API 列目录
        const directPaths = [
            'SKILL.md',
            `skills/${targetSlug}/SKILL.md`,
            `skills/${targetSlug.replace(/-/g, '_')}/SKILL.md`,
        ];

        const candidates: Array<{ slug: string; content: string; parsed: ReturnType<typeof parseSkillMd> }> = [];
        let fetchedAny = false;

        for (const filePath of directPaths) {
            const content = await getFileContent(owner, repo, filePath);
            if (!content) continue;
            fetchedAny = true;

            const parsed = parseSkillMd(content, { fallbackCategory: 'development' });
            const slug = generateSlug(parsed.name);
            if (slug === targetSlug) {
                const securityReport = generateSecurityReport(content, 3);
                const skillData: SkillData = {
                    name: parsed.name,
                    slug,
                    description: parsed.description || repoMeta.description,
                    summary: parsed.description || repoMeta.description,
                    github_url: githubUrl,
                    github_stars: repoMeta.stars,
                    install_count: 0,
                    category: parsed.category || 'development',
                    tags: parsed.tags.length > 0 ? parsed.tags : [parsed.category || 'development'],
                    platforms: ['claude-code', 'cursor', 'universal'],
                    security_level: 3,
                    security_report: securityReport,
                    skill_md_content: content,
                    usage_guide: readme,
                    author: owner,
                    license: repoMeta.license,
                    version: '1.0.0',
                    source: 'skills.sh',
                };
                return { skill: skillData, matchType: 'exact', matchScore: 1 };
            }
            candidates.push({ slug, content, parsed });
        }

        if (process.env.SKILLS_SH_USE_API_LISTING !== 'false') {
            const skillFiles = await getSkillFiles(owner, repo);
            for (const filePath of skillFiles) {
                const content = await getFileContent(owner, repo, filePath);
                if (!content) continue;
                fetchedAny = true;

                const parsed = parseSkillMd(content, { fallbackCategory: 'development' });
                const slug = generateSlug(parsed.name);
                if (slug === targetSlug) {
                    const securityReport = generateSecurityReport(content, 3);
                    const skillData: SkillData = {
                        name: parsed.name,
                        slug,
                        description: parsed.description || repoMeta.description,
                        summary: parsed.description || repoMeta.description,
                        github_url: githubUrl,
                        github_stars: repoMeta.stars,
                        install_count: 0,
                        category: parsed.category || 'development',
                        tags: parsed.tags.length > 0 ? parsed.tags : [parsed.category || 'development'],
                        platforms: ['claude-code', 'cursor', 'universal'],
                        security_level: 3,
                        security_report: securityReport,
                        skill_md_content: content,
                        usage_guide: readme,
                        author: owner,
                        license: repoMeta.license,
                        version: '1.0.0',
                        source: 'skills.sh',
                    };
                    return { skill: skillData, matchType: 'exact', matchScore: 1 };
                }
                candidates.push({ slug, content, parsed });
            }
        }

        if (!fetchedAny && readme) {
            const parsed = parseSkillMd(readme, { fallbackCategory: 'development' });
            const securityReport = generateSecurityReport(readme, 3);
            const fallbackName = parsed.name === 'Unknown' ? targetSlug : parsed.name;
            const skillData: SkillData = {
                name: fallbackName,
                slug: targetSlug,
                description: parsed.description || repoMeta.description,
                summary: parsed.description || repoMeta.description,
                github_url: githubUrl,
                github_stars: repoMeta.stars,
                install_count: 0,
                category: parsed.category || 'development',
                tags: parsed.tags.length > 0 ? parsed.tags : [parsed.category || 'development'],
                platforms: ['claude-code', 'cursor', 'universal'],
                security_level: 3,
                security_report: securityReport,
                skill_md_content: readme,
                usage_guide: readme,
                author: owner,
                license: repoMeta.license,
                version: '1.0.0',
                source: 'skills.sh',
            };
            return { skill: skillData, matchType: 'readme', matchScore: 0 };
        }

        if (!fetchedAny) {
            console.error(`  ✗ Failed to fetch SKILL.md content in ${owner}/${repo}`);
            return { skill: null, errorCode: 'skill_md_fetch_failed', errorDetail: 'Failed to fetch SKILL.md content' };
        }

        const best = findBestFuzzyMatch(targetSlug, candidates);
        if (best) {
            const securityReport = generateSecurityReport(best.content, 3);
            const skillData: SkillData = {
                name: best.parsed.name,
                slug: best.slug,
                description: best.parsed.description || repoMeta.description,
                summary: best.parsed.description || repoMeta.description,
                github_url: githubUrl,
                github_stars: repoMeta.stars,
                install_count: 0,
                category: best.parsed.category || 'development',
                tags: best.parsed.tags.length > 0 ? best.parsed.tags : [best.parsed.category || 'development'],
                platforms: ['claude-code', 'cursor', 'universal'],
                security_level: 3,
                security_report: securityReport,
                skill_md_content: best.content,
                usage_guide: readme,
                author: owner,
                license: repoMeta.license,
                version: '1.0.0',
                source: 'skills.sh',
            };

            return {
                skill: skillData,
                matchType: 'fuzzy',
                matchScore: best.score,
            };
        }

        console.error(`  ✗ No matching SKILL.md for slug "${targetSlug}" in ${owner}/${repo}`);
        return { skill: null, errorCode: 'slug_mismatch', errorDetail: 'No matching SKILL.md for slug' };

    } catch (error) {
        console.error(`  ✗ Error crawling GitHub: ${error}`);
        return { skill: null, errorCode: 'crawl_failed', errorDetail: String(error) };
    }
}

/**
 * 4. 批量处理详情页解析
 */
async function batchParseDetails(items: LeaderboardItem[], batchSize = 5): Promise<DetailPageResult[]> {
    console.log(`\n[2/4] 解析详情页，提取 GitHub 地址...`);
    
    const results: DetailPageResult[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(item => parseDetailPage(item)));
        results.push(...batchResults);
        
        console.log(`  进度: ${Math.min(i + batchSize, items.length)}/${items.length}`);
        
        // 避免速率限制
        if (i + batchSize < items.length) {
            await sleep(500);
        }
    }
    
    const successCount = results.filter(r => r.github_url).length;
    console.log(`  ✓ 成功解析 ${successCount}/${results.length} 个 GitHub 地址`);
    
    return results;
}

/**
 * 5. 批量爬取 GitHub 仓库
 */
async function batchCrawlGitHub(details: DetailPageResult[], batchSize = 3): Promise<CrawlResult[]> {
    console.log(`\n[3/4] 从 GitHub 爬取 skill 数据...`);
    
    const results: CrawlResult[] = [];
    const validDetails = details.filter(d => d.github_url);
    
    for (let i = 0; i < validDetails.length; i += batchSize) {
        const batch = validDetails.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
            batch.map(async (detail) => {
                console.log(`  [${detail.rank}] 处理 ${detail.slug}...`);
                
                const outcome = await crawlGitHubForSlug(detail.github_url!, detail.slug);

                return {
                    rank: detail.rank,
                    slug: detail.slug,
                    detail_url: detail.detail_url,
                    github_url: detail.github_url!,
                    skill: outcome.skill || undefined,
                    error: outcome.skill ? undefined : (outcome.errorDetail || 'No matching SKILL.md'),
                    error_code: outcome.errorCode,
                    match_type: outcome.matchType,
                    match_score: outcome.matchScore,
                };
            })
        );
        
        results.push(...batchResults);
        
        console.log(`  进度: ${Math.min(i + batchSize, validDetails.length)}/${validDetails.length}`);
        
        // 避免 GitHub API 速率限制
        if (i + batchSize < validDetails.length) {
            await sleep(1000);
        }
    }
    
    const successCount = results.filter(r => r.skill).length;
    console.log(`  ✓ 成功爬取 ${successCount}/${results.length} 个 skill`);
    
    return results;
}

/**
 * 6. 去重并生成最终结果
 */
function deduplicateAndSummarize(
    crawlResults: CrawlResult[],
    detailResults: DetailPageResult[]
): OutputResult {
    console.log(`\n[4/4] 去重并生成结果...`);
    
    const slugMap = new Map<string, CrawlResult>();
    const duplicates: CrawlResult[] = [];
    const failed: CrawlResult[] = [];
    
    // 去重：保留排名最靠前的
    for (const result of crawlResults) {
        if (!result.skill) {
            failed.push(result);
            continue;
        }
        
        if (slugMap.has(result.slug)) {
            duplicates.push(result);
        } else {
            slugMap.set(result.slug, result);
        }
    }
    
    // 统计无 GitHub 地址的记录
    const noGithub = detailResults.filter(d => !d.github_url);
    
    const items = Array.from(slugMap.values()).sort((a, b) => a.rank - b.rank);
    
    const summary = {
        total_requested: 100,
        total_fetched: detailResults.length,
        unique_skills: items.length,
        no_github: noGithub.length,
        no_match: failed.length,
        duplicates: duplicates.length,
        errors: failed.length + noGithub.length,
    };
    
    console.log(`  ✓ 去重完成:`);
    console.log(`    - 唯一 skill: ${summary.unique_skills}`);
    console.log(`    - 重复记录: ${summary.duplicates}`);
    console.log(`    - 失败记录: ${summary.errors}`);
    
    return {
        summary,
        items,
        duplicates,
        failed: [...failed, ...noGithub.map(d => ({
            rank: d.rank,
            slug: d.slug,
            detail_url: d.detail_url,
            github_url: d.github_url || '',
            error: d.error || 'No GitHub URL',
        }))],
    };
}

/**
 * 主函数：完整爬取流程
 */
async function crawlSkillsSh(): Promise<OutputResult> {
    console.log('='.repeat(60));
    console.log('Skills.sh 爬虫验证工具');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    // 1. 获取榜单
    const leaderboard = await fetchLeaderboard(100);
    if (leaderboard.length === 0) {
        throw new Error('无法获取榜单数据');
    }
    
    // 2. 解析详情页
    const details = await batchParseDetails(leaderboard);
    
    // 3. 爬取 GitHub
    const crawlResults = await batchCrawlGitHub(details);
    
    // 4. 去重与汇总
    const result = deduplicateAndSummarize(crawlResults, details);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ 完成！总耗时: ${duration}s`);
    
    return result;
}

/**
 * 保存结果到 JSON 文件
 */
async function saveResult(result: OutputResult): Promise<void> {
    const outputPath = join(__dirname, '../output/skills_sh_validate.json');
    
    // 确保输出目录存在
    await mkdir(dirname(outputPath), { recursive: true });
    
    await writeFile(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    
    console.log(`\n结果已保存至: ${outputPath}`);
}

// ==================== 程序入口 ====================

if (import.meta.url === `file://${process.argv[1]}`) {
    crawlSkillsSh()
        .then(result => saveResult(result))
        .then(() => {
            console.log('\n验证完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n✗ 错误:', error);
            process.exit(1);
        });
}

export { crawlSkillsSh, saveResult };
