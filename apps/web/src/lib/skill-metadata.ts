import type { Category } from '@/types';

export interface ParsedSkillMetadata {
    name: string;
    description: string;
    category: Category;
    tags: string[];
}

const CATEGORY_VALUES: Category[] = [
    'development',
    'operations',
    'design',
    'office',
    'marketing',
    'creative',
];

const CATEGORY_RULES: Array<{ category: Category; keywords: string[] }> = [
    {
        category: 'development',
        keywords: [
            'mcp', 'api', 'sdk', 'code', 'typescript', 'javascript', 'python', 'node',
            'react', 'vue', 'next.js', 'nextjs', 'testing', 'debug', 'git', 'workflow',
            'database', 'sql',
        ],
    },
    {
        category: 'operations',
        keywords: ['deploy', 'deployment', 'devops', 'ci/cd', 'kubernetes', 'docker', 'monitoring', 'incident', 'sre'],
    },
    {
        category: 'design',
        keywords: ['design system', 'design', 'ui', 'ux', 'figma', 'accessibility', 'a11y', 'layout', 'typography'],
    },
    {
        category: 'office',
        keywords: ['document', 'docx', 'word', 'pdf', 'ppt', 'pptx', 'presentation', 'xlsx', 'excel', 'spreadsheet'],
    },
    {
        category: 'marketing',
        keywords: ['marketing', 'seo', 'analytics', 'campaign', 'conversion', 'growth', 'copywriting', 'content'],
    },
    {
        category: 'creative',
        keywords: ['creative', 'art', 'visual', 'poster', 'canvas', 'video', 'animation', 'remotion'],
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
    { tag: 'testing', keywords: ['testing', 'tdd', 'e2e', 'unit test'] },
    { tag: 'debugging', keywords: ['debug', 'troubleshoot', 'root cause'] },
    { tag: 'security', keywords: ['security', 'auth', 'permission', 'vulnerability'] },
    { tag: 'database', keywords: ['database', 'sql', 'postgres', 'supabase'] },
    { tag: 'devops', keywords: ['devops', 'deployment', 'ci/cd', 'kubernetes', 'docker'] },
    { tag: 'design', keywords: ['design', 'figma', 'layout', 'typography'] },
    { tag: 'accessibility', keywords: ['accessibility', 'a11y'] },
    { tag: 'document', keywords: ['document', 'docx', 'word', 'pdf'] },
    { tag: 'spreadsheet', keywords: ['xlsx', 'excel', 'spreadsheet'] },
    { tag: 'presentation', keywords: ['ppt', 'pptx', 'presentation'] },
    { tag: 'seo', keywords: ['seo', 'organic traffic'] },
    { tag: 'analytics', keywords: ['analytics', 'tracking'] },
    { tag: 'marketing', keywords: ['marketing', 'campaign', 'conversion', 'growth'] },
    { tag: 'copywriting', keywords: ['copywriting', 'ad copy', 'sales copy'] },
    { tag: 'creative', keywords: ['creative', 'visual', 'art'] },
    { tag: 'video', keywords: ['video', 'remotion'] },
    { tag: 'animation', keywords: ['animation', 'motion'] },
    { tag: 'canvas', keywords: ['canvas', 'poster'] },
    { tag: 'workflow', keywords: ['workflow', 'orchestration', 'planning'] },
    { tag: 'git', keywords: ['git', 'branch', 'worktree'] },
];

const TAG_ALIAS: Record<string, string> = {
    'next.js': 'nextjs',
    'next-js': 'nextjs',
    'a-b-testing': 'ab-testing',
    'a-b-test': 'ab-testing',
    'a/b': 'ab-testing',
    'a-b': 'ab-testing',
};

export function extractSkillMetadata(
    content: string,
    fallbackCategory: Category = 'development'
): ParsedSkillMetadata {
    const frontmatter = extractFrontmatter(content);
    const metadataBlock = extractYamlBlock(frontmatter, 'metadata');
    const h1Title = content.match(/^#\s+(.+)/m)?.[1]?.trim() || 'Untitled Skill';

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
    const inferredCategory = inferCategory(inferenceText, explicitCategory || fallbackCategory);
    const inferredTags = inferTags(inferenceText, inferredCategory);

    const category = explicitCategory || inferredCategory;
    const tags = dedupeTags([...explicitTags, ...inferredTags]);
    if (tags.length === 0) tags.push(category);

    const description = descriptionFromYaml || buildDescriptionFallback(content, name, category, tags);

    return {
        name,
        description,
        category,
        tags: tags.slice(0, 8),
    };
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
    return value.split(',').map(cleanYamlToken).filter(Boolean);
}

function cleanYamlToken(value: string): string {
    return value.trim().replace(/^['"]|['"]$/g, '');
}

function normalizeCategory(category: string): Category | '' {
    const normalized = category.trim().toLowerCase();
    return CATEGORY_VALUES.includes(normalized as Category) ? (normalized as Category) : '';
}

function inferCategory(text: string, fallbackCategory: Category): Category {
    let bestCategory: Category | '' = '';
    let bestScore = -1;
    for (const rule of CATEGORY_RULES) {
        const score = rule.keywords.reduce((acc, keyword) => (
            acc + (keywordHit(text, keyword) ? (keyword.includes(' ') ? 2 : 1) : 0)
        ), 0);
        if (score > bestScore) {
            bestScore = score;
            bestCategory = rule.category;
        }
    }
    if (bestCategory && bestScore > 0) return bestCategory;
    return fallbackCategory;
}

function inferTags(text: string, category: Category): string[] {
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
    for (const raw of tags) {
        const normalized = normalizeTag(raw);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push(normalized);
    }
    return result;
}

function buildDescriptionFallback(
    content: string,
    name: string,
    category: Category,
    tags: string[]
): string {
    const body = content
        .replace(/^---\s*\n[\s\S]*?\n---/m, '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/[#>*-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (body.length > 0) return body.slice(0, 220);

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
