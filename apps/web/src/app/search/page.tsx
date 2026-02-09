import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchBar } from '@/components/ui/search-bar';
import { SkillCard } from '@/components/skill/skill-card';
import { getSkills } from '@/lib/skills';
import { Category, SecurityLevel, Platform } from '@/types';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        category?: Category;
        security_level?: string;
        platform?: Platform;
        sort?: 'stars' | 'installs' | 'recent';
        page?: string;
    }>;
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams?: {
        q?: string;
        category?: Category;
    };
}): Promise<Metadata> {
    const query = searchParams?.q?.trim();
    const category = searchParams?.category;
    const title = query
        ? `搜索「${query}」- ${SITE_NAME}`
        : `搜索 Skills - ${SITE_NAME}`;
    const description = query
        ? `在 ${SITE_NAME} 搜索与 ${query} 相关的 AI Agent Skills。`
        : `在 ${SITE_NAME} 浏览和筛选高质量的 AI Agent Skills。`;

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    const canonical = params.toString()
        ? `${SITE_URL}/search?${params.toString()}`
        : `${SITE_URL}/search`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            type: 'website',
            url: canonical,
            title,
            description,
            siteName: SITE_NAME,
            locale: 'zh_CN',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    };
}

const categories = [
    { value: '', label: '全部分类' },
    { value: 'development', label: '开发' },
    { value: 'operations', label: '运营' },
    { value: 'design', label: '设计' },
    { value: 'office', label: '办公' },
    { value: 'marketing', label: '营销' },
    { value: 'creative', label: '创意' },
];

const sortOptions = [
    { value: 'stars', label: 'GitHub Stars' },
    { value: 'installs', label: '安装量' },
    { value: 'recent', label: '最新' },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const { skills, total, page, page_size } = await getSkills({
        q: params.q,
        category: params.category,
        security_level: params.security_level ? parseInt(params.security_level) as SecurityLevel : undefined,
        platform: params.platform,
        sort: params.sort || 'stars',
        page: params.page ? parseInt(params.page) : 1,
        page_size: 12,
    });

    const totalPages = Math.ceil(total / page_size);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* 搜索栏 */}
            <div className="mb-8">
                <Suspense fallback={<div className="h-12 bg-[var(--gray-100)] rounded-lg animate-pulse" />}>
                    <SearchBar placeholder="搜索 Skill..." />
                </Suspense>
            </div>

            {/* 筛选器 */}
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-[var(--gray-200)]">
                {/* 分类 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--gray-500)]">分类:</span>
                    <div className="flex flex-wrap gap-1">
                        {categories.map((cat) => (
                            <a
                                key={cat.value}
                                href={`/search?${new URLSearchParams({
                                    ...(params.q && { q: params.q }),
                                    ...(cat.value && { category: cat.value }),
                                    ...(params.sort && { sort: params.sort }),
                                }).toString()}`}
                                className={`px-3 py-1 text-sm rounded-full border transition-all ${params.category === cat.value || (!params.category && !cat.value)
                                    ? 'bg-[var(--gray-100)] border-[var(--gray-400)] text-[var(--foreground)] font-medium'
                                    : 'border-[var(--gray-300)] text-[var(--gray-600)] hover:border-[var(--gray-400)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                {cat.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* 排序 */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-[var(--gray-500)]">排序:</span>
                    <div className="flex gap-1">
                        {sortOptions.map((opt) => (
                            <a
                                key={opt.value}
                                href={`/search?${new URLSearchParams({
                                    ...(params.q && { q: params.q }),
                                    ...(params.category && { category: params.category }),
                                    sort: opt.value,
                                }).toString()}`}
                                className={`px-3 py-1 text-sm rounded-full border transition-all ${params.sort === opt.value || (!params.sort && opt.value === 'stars')
                                    ? 'bg-[var(--gray-100)] border-[var(--gray-400)] text-[var(--foreground)] font-medium'
                                    : 'border-[var(--gray-300)] text-[var(--gray-600)] hover:border-[var(--gray-400)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                {opt.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* 结果统计 */}
            <div className="mb-6">
                <p className="text-sm text-[var(--gray-500)]">
                    {params.q ? (
                        <>搜索 &quot;{params.q}&quot; 找到 <strong>{total}</strong> 个结果</>
                    ) : (
                        <>共 <strong>{total}</strong> 个 Skills</>
                    )}
                </p>
            </div>

            {/* 结果列表 */}
            {skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-[var(--gray-500)]">没有找到相关 Skill</p>
                    <a href="/search" className="text-sm underline mt-2 inline-block">
                        清除筛选条件
                    </a>
                </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {page > 1 && (
                        <a
                            href={`/search?${new URLSearchParams({
                                ...(params.q && { q: params.q }),
                                ...(params.category && { category: params.category }),
                                ...(params.sort && { sort: params.sort }),
                                page: String(page - 1),
                            }).toString()}`}
                            className="px-4 py-2 border border-[var(--gray-300)] rounded hover:border-[var(--foreground)]"
                        >
                            上一页
                        </a>
                    )}
                    <span className="px-4 py-2 text-[var(--gray-500)]">
                        {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                        <a
                            href={`/search?${new URLSearchParams({
                                ...(params.q && { q: params.q }),
                                ...(params.category && { category: params.category }),
                                ...(params.sort && { sort: params.sort }),
                                page: String(page + 1),
                            }).toString()}`}
                            className="px-4 py-2 border border-[var(--gray-300)] rounded hover:border-[var(--foreground)]"
                        >
                            下一页
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
