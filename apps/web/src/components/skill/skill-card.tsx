import Link from 'next/link';
import { Skill } from '@/types';
import { SecurityBadge } from '@/components/ui/security-badge';

interface SkillCardProps {
    skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
    return (
        <Link
            href={`/skill/${skill.slug}`}
            target="_blank"
            className="block p-6 border border-[var(--gray-200)] rounded-lg hover:border-[var(--foreground)] transition-colors"
        >
            {/* 头部：名称 + 安全徽章 */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-lg leading-tight">{skill.name}</h3>
                <SecurityBadge level={skill.security_level} size="sm" />
            </div>

            {/* 描述 */}
            <p className="text-[var(--gray-500)] text-sm mb-4 line-clamp-2">
                {skill.description}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {skill.tags.slice(0, 4).map((tag) => (
                    <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-[var(--gray-100)] text-[var(--gray-600)] rounded"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* 底部统计 */}
            <div className="flex items-center gap-4 text-sm text-[var(--gray-500)]">
                <span className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{formatNumber(skill.github_stars)}</span>
                </span>
                <span className="flex items-center gap-1">
                    <span>📥</span>
                    <span>{formatNumber(skill.install_count)}</span>
                </span>
                <span className="text-[var(--gray-400)]">by {skill.author}</span>
            </div>
        </Link>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}
