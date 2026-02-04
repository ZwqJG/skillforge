'use client';

import { useState } from 'react';

// 支持的 10 个 AI 编程代理商
const SUPPORTED_TOOLS = [
    {
        name: 'Claude Code',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-9l7.5 4.5-7.5 4.5z" />
            </svg>
        ),
    },
    {
        name: 'Cursor',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M5 3l14 9-14 9V3z" />
            </svg>
        ),
    },
    {
        name: 'Windsurf',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
        ),
    },
    {
        name: 'Codex',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" />
                <path fill="var(--foreground)" d="M12 6v12M6 12h12" stroke="var(--background)" strokeWidth="2" />
            </svg>
        ),
    },
    {
        name: 'OpenCode',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
        ),
    },
    {
        name: 'Roo Code',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        ),
    },
    {
        name: 'Trae',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
    },
    {
        name: 'Zed',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M4 4h16v4H8l12 8v4H4v-4h12L4 8V4z" />
            </svg>
        ),
    },
    {
        name: 'Aider',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
        ),
    },
    {
        name: 'Continue',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M8 5v14l11-7z" />
            </svg>
        ),
    },
];

export function InstallSection() {
    const [copied, setCopied] = useState(false);
    const installCommand = 'npx skillforge add <owner/repo>';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(installCommand);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <section className="bg-[var(--foreground)] text-[var(--background)] rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* 左侧：一键安装 */}
                <div>
                    <h3 className="text-lg font-medium mb-4 opacity-80">
                        一条命令即可安装
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-[var(--background)]/10 rounded-lg px-4 py-3">
                            <span className="text-[var(--background)]/50">$</span>
                            <code className="font-mono text-sm md:text-base flex-1">
                                {installCommand}
                            </code>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-[var(--background)]/10 rounded-lg hover:bg-[var(--background)]/20 transition-colors"
                            title={copied ? '已复制' : '复制命令'}
                        >
                            {copied ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* 右侧：支持的工具 */}
                <div>
                    <h3 className="text-lg font-medium mb-4 opacity-80">
                        这些代理商可以使用
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {SUPPORTED_TOOLS.map((tool) => (
                            <div
                                key={tool.name}
                                className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--background)]/10 hover:bg-[var(--background)]/20 transition-colors cursor-default"
                                title={tool.name}
                            >
                                {tool.icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
