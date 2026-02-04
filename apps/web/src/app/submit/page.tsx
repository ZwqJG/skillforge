'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitPage() {
    const { user, session, loading } = useAuth();
    const router = useRouter();
    const [githubUrl, setGithubUrl] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'validating' | 'crawling' | 'reviewing' | 'success' | 'failed'>('idle');
    const [reviewResult, setReviewResult] = useState<any>(null);

    // 未登录跳转
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/submit');
        }
    }, [user, loading, router]);

    const validateGithubUrl = (url: string): boolean => {
        const pattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
        return pattern.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setReviewResult(null);

        if (!validateGithubUrl(githubUrl)) {
            setError('请输入有效的 GitHub 仓库地址，格式：https://github.com/用户名/仓库名');
            return;
        }

        if (!session?.access_token) {
            setError('登录状态已过期，请重新登录');
            return;
        }

        setIsSubmitting(true);
        setStatus('validating');

        try {
            const response = await fetch('/api/skills/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ github_url: githubUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '提交失败');
            }

            setStatus('success');
            setReviewResult(data);
        } catch (err: any) {
            setError(err.message || '提交失败，请稍后重试');
            setStatus('failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
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
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2">提交你的 Skill</h1>
            <p className="text-[var(--gray-500)] mb-8">
                分享你创建的 Skill 给社区，让更多人受益。
            </p>

            {status === 'success' && reviewResult ? (
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">✅</span>
                            <div>
                                <h2 className="text-xl font-bold text-green-700">提交成功！</h2>
                                <p className="text-green-600">你的 Skill 已通过审核并上架</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 space-y-2">
                            <p><strong>名称：</strong>{reviewResult.skill?.name}</p>
                            <p><strong>安全等级：</strong>Level {reviewResult.skill?.security_level}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href={`/skill/${reviewResult.skill?.slug}`}
                            style={{ backgroundColor: '#000', color: '#fff' }}
                            className="flex-1 py-3 rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
                        >
                            查看 Skill
                        </Link>
                        <button
                            onClick={() => {
                                setStatus('idle');
                                setGithubUrl('');
                                setReviewResult(null);
                            }}
                            className="flex-1 py-3 border border-[var(--gray-300)] rounded-lg font-medium hover:bg-[var(--gray-50)] transition-colors"
                        >
                            继续提交
                        </button>
                    </div>
                </div>
            ) : status === 'failed' && reviewResult?.reject_reason ? (
                <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">❌</span>
                            <div>
                                <h2 className="text-xl font-bold text-red-700">审核未通过</h2>
                                <p className="text-red-600">{reviewResult.reject_reason}</p>
                            </div>
                        </div>

                        {reviewResult.suggestions && (
                            <div className="mt-4">
                                <p className="font-medium mb-2">改进建议：</p>
                                <ul className="list-disc list-inside text-sm text-[var(--gray-600)] space-y-1">
                                    {reviewResult.suggestions.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setStatus('idle');
                            setError('');
                            setReviewResult(null);
                        }}
                        className="w-full py-3 border border-[var(--gray-300)] rounded-lg font-medium hover:bg-[var(--gray-50)] transition-colors"
                    >
                        重新提交
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="github_url" className="block text-sm font-medium mb-2">
                            GitHub 仓库地址 <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="github_url"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent disabled:bg-[var(--gray-50)]"
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    <div className="bg-[var(--gray-50)] rounded-lg p-4 text-sm text-[var(--gray-600)]">
                        <p className="font-medium mb-2">💡 提交要求</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>仓库必须是公开的（Public）</li>
                            <li>仓库根目录必须包含 <code className="bg-[var(--gray-200)] px-1 rounded">SKILL.md</code> 文件</li>
                            <li>建议包含 <code className="bg-[var(--gray-200)] px-1 rounded">README.md</code> 作为使用说明</li>
                            <li>同一仓库只能被提交一次</li>
                            <li>每天最多提交 10 个 Skill</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#000', color: '#fff' }}
                        className="w-full py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {status === 'validating' && '验证仓库中...'}
                                {status === 'crawling' && '获取内容中...'}
                                {status === 'reviewing' && 'AI 审核中...'}
                            </span>
                        ) : (
                            '提交审核'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
