import { notFound } from 'next/navigation';
import { getSkillBySlug } from '@/lib/skills';
import { SecurityBadge } from '@/components/ui/security-badge';
import { CopyButton } from '@/components/ui/copy-button';
import { SkillTabs } from '@/components/skill/skill-tabs';
import { Metadata } from 'next';

interface SkillPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    if (!skill) {
        return { title: 'Skill Not Found - SkillForge' };
    }

    return {
        title: `${skill.name} - SkillForge`,
        description: skill.description,
    };
}

export default async function SkillPage({ params }: SkillPageProps) {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    if (!skill) {
        notFound();
    }

    const installCommand = `npx skillforge add ${skill.slug}`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* 头部 */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-3xl font-bold">{skill.name}</h1>
                    <SecurityBadge level={skill.security_level} size="lg" />
                </div>

                {/* 统计 */}
                <div className="flex items-center gap-6 text-[var(--gray-500)] mb-4">
                    <span className="flex items-center gap-1.5">
                        <span>⭐</span>
                        <span>{formatNumber(skill.github_stars)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span>📥</span>
                        <span>{formatNumber(skill.install_count)} 安装</span>
                    </span>
                    <a
                        href={skill.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-[var(--foreground)]"
                    >
                        <span>GitHub</span>
                        <span>↗</span>
                    </a>
                </div>

                {/* 描述 */}
                <p className="text-lg text-[var(--gray-600)] mb-4">
                    {skill.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {skill.tags.map((tag) => (
                        <a
                            key={tag}
                            href={`/search?q=${encodeURIComponent(tag)}`}
                            className="px-3 py-1 text-sm bg-[var(--gray-100)] text-[var(--gray-600)] rounded-full hover:bg-[var(--gray-200)]"
                        >
                            #{tag}
                        </a>
                    ))}
                </div>

                {/* 一键安装 */}
                <div className="bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-lg p-4">
                    <p className="text-sm text-[var(--gray-500)] mb-2">一键安装</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono bg-[var(--gray-100)] px-4 py-2 rounded">
                            {installCommand}
                        </code>
                        <CopyButton text={installCommand} />
                    </div>
                    <p className="text-xs text-[var(--gray-400)] mt-2">
                        支持：{skill.platforms.map(p => platformLabels[p] || p).join(' · ')}
                    </p>
                </div>
            </div>

            {/* 详情 Tabs */}
            <SkillTabs skill={skill} />

            {/* 元信息 */}
            <div className="mt-8 pt-8 border-t border-[var(--gray-200)]">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <dt className="text-[var(--gray-500)]">作者</dt>
                        <dd className="font-medium">{skill.author}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--gray-500)]">许可证</dt>
                        <dd className="font-medium">{skill.license}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--gray-500)]">版本</dt>
                        <dd className="font-medium">{skill.version}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--gray-500)]">来源</dt>
                        <dd className="font-medium">{skill.source}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

const platformLabels: Record<string, string> = {
    'claude-code': 'Claude Code',
    'cursor': 'Cursor',
    'codex': 'Codex',
    'opencode': 'OpenCode',
    'universal': '通用',
};

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}
