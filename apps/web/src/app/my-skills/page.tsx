'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MySkill {
    id: string;
    name: string;
    slug: string;
    status: 'pending' | 'approved' | 'rejected' | 'updating';
    github_stars: number;
    security_level: number;
    created_at: string;
    updated_at: string;
}

export default function MySkillsPage() {
    const { user, session, loading } = useAuth();
    const router = useRouter();
    const [skills, setSkills] = useState<MySkill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/my-skills');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && session?.access_token) {
            fetchMySkills();
        }
    }, [user, session]);

    const fetchMySkills = async () => {
        if (!session?.access_token) return;
        try {
            const response = await fetch('/api/my-skills', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSkills(data.skills || []);
            }
        } catch (error) {
            console.error('Failed to fetch skills:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (skillSlug: string) => {
        if (!session?.access_token) return;
        setUpdatingId(skillSlug);
        try {
            const response = await fetch(`/api/skills/${skillSlug}/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            if (response.ok) {
                await fetchMySkills();
            } else {
                const data = await response.json();
                alert(data.error || '更新失败');
            }
        } catch (error) {
            alert('更新失败，请稍后重试');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p>加载中...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">我的提交</h1>
                    <p className="text-[var(--gray-500)] mt-1">管理你提交的 Skills</p>
                </div>
                <Link
                    href="/submit"
                    style={{ backgroundColor: '#000', color: '#fff' }}
                    className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    提交新 Skill
                </Link>
            </div>

            {skills.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[var(--gray-300)] rounded-lg">
                    <p className="text-[var(--gray-500)] mb-4">你还没有提交过 Skill</p>
                    <Link
                        href="/submit"
                        style={{ backgroundColor: '#000', color: '#fff' }}
                        className="inline-block px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        开始提交
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {skills.map((skill) => (
                        <div
                            key={skill.id}
                            className="border border-[var(--gray-200)] rounded-lg p-6 hover:border-[var(--gray-300)] transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/skill/${skill.slug}`}
                                            className="text-lg font-semibold hover:underline"
                                        >
                                            {skill.name}
                                        </Link>
                                        <StatusBadge status={skill.status} />
                                        <SecurityBadge level={skill.security_level} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--gray-500)]">
                                        <span>⭐ {skill.github_stars}</span>
                                        <span>提交于 {new Date(skill.created_at).toLocaleDateString()}</span>
                                        {skill.updated_at !== skill.created_at && (
                                            <span>更新于 {new Date(skill.updated_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUpdate(skill.slug)}
                                    disabled={updatingId === skill.slug || skill.status === 'pending'}
                                    className="px-4 py-2 text-sm border border-[var(--gray-300)] rounded-lg hover:bg-[var(--gray-50)] disabled:opacity-50 transition-colors"
                                >
                                    {updatingId === skill.slug ? '更新中...' : '同步更新'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        pending: { label: '审核中', color: 'bg-yellow-100 text-yellow-700' },
        approved: { label: '已上架', color: 'bg-green-100 text-green-700' },
        rejected: { label: '未通过', color: 'bg-red-100 text-red-700' },
        updating: { label: '更新中', color: 'bg-blue-100 text-blue-700' },
    }[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ${config.color}`}>
            {config.label}
        </span>
    );
}

function SecurityBadge({ level }: { level: number }) {
    const config = {
        3: { label: '🛡️ 官方认证', color: 'bg-purple-100 text-purple-700' },
        2: { label: '✅ 已审核', color: 'bg-green-100 text-green-700' },
        1: { label: '⚠️ 社区验证', color: 'bg-yellow-100 text-yellow-700' },
        0: { label: '❓ 待审核', color: 'bg-gray-100 text-gray-700' },
    }[level] || { label: `Level ${level}`, color: 'bg-gray-100 text-gray-700' };

    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ${config.color}`}>
            {config.label}
        </span>
    );
}
