import Link from 'next/link';

export function Header() {
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
                    <a
                        href="https://github.com/skillforge/skillforge"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gray-600)] hover:text-[var(--foreground)] transition-colors"
                    >
                        GitHub
                    </a>
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
