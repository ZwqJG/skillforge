'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

export function Header() {
    const { user, loading, signOut } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <header className="border-b border-[var(--gray-200)]">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span>⚒️</span>
                    <span>SkillForge</span>
                </Link>

                {/* 导航 */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/search"
                        className="text-[var(--gray-600)] hover:text-[var(--foreground)] transition-colors"
                    >
                        搜索
                    </Link>

                    {!loading && user && (
                        <Link
                            href="/submit"
                            className="text-[var(--gray-600)] hover:text-[var(--foreground)] transition-colors"
                        >
                            提交 Skill
                        </Link>
                    )}

                    <a
                        href="https://github.com/ZwqJG/skillforge"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gray-600)] hover:text-[var(--foreground)] transition-colors"
                    >
                        GitHub
                    </a>

                    {/* 用户菜单 */}
                    {loading ? (
                        <span className="text-[var(--gray-400)]">...</span>
                    ) : user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-2 text-[var(--gray-600)] hover:text-[var(--foreground)] transition-colors"
                            >
                                <span className="w-8 h-8 rounded-full bg-[var(--gray-200)] flex items-center justify-center text-sm">
                                    {user.email?.charAt(0).toUpperCase()}
                                </span>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--gray-200)] rounded-lg shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 text-sm text-[var(--gray-500)] border-b border-[var(--gray-100)]">
                                        {user.email}
                                    </div>
                                    <Link
                                        href="/my-skills"
                                        className="block px-4 py-2 text-sm hover:bg-[var(--gray-50)] transition-colors"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        我的提交
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--gray-50)] transition-colors"
                                    >
                                        退出登录
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            style={{ backgroundColor: '#000', color: '#fff' }}
                            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            登录
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-[var(--gray-200)] py-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--gray-500)]">
                <p>安全可信的 Skill 精选平台</p>
                <p className="mt-2">© 2026 SkillForge. MIT License.</p>
            </div>
        </footer>
    );
}

