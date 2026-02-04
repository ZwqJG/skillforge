'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const { signUp, user, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 如果已登录，跳转到首页
    if (!loading && user) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 验证密码
        if (password.length < 6) {
            setError('密码至少需要 6 个字符');
            return;
        }
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(email, password);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || '注册失败');
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

    if (success) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-full max-w-md p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold mb-4">注册成功！</h1>
                    <p className="text-[var(--gray-500)] mb-6">
                        我们已向 {email} 发送了一封确认邮件。<br />
                        请点击邮件中的链接完成验证。
                    </p>
                    <Link
                        href="/auth/login"
                        style={{ backgroundColor: '#000', color: '#fff' }}
                        className="inline-block px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        前往登录
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-8">注册 SkillForge</h1>

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
                            placeholder="至少 6 个字符"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                            确认密码
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                            placeholder="再次输入密码"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: '#000', color: '#fff' }}
                        className="w-full py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isLoading ? '注册中...' : '注册'}
                    </button>
                </form>

                <p className="text-center mt-6 text-[var(--gray-500)]">
                    已有账号？{' '}
                    <Link href="/auth/login" className="text-[var(--foreground)] hover:underline">
                        立即登录
                    </Link>
                </p>
            </div>
        </div>
    );
}
