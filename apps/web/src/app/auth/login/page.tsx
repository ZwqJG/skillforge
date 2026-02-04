'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { signIn, user, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 如果已登录，跳转到首页
    if (!loading && user) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || '登录失败');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p>加载中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-8">登录 SkillForge</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            邮箱
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            密码
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: '#000', color: '#fff' }}
                        className="w-full py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </button>
                </form>

                <p className="text-center mt-6 text-[var(--gray-500)]">
                    还没有账号？{' '}
                    <Link href="/auth/signup" className="text-[var(--foreground)] hover:underline">
                        立即注册
                    </Link>
                </p>
            </div>
        </div>
    );
}
