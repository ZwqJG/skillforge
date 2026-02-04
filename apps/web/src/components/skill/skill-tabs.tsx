'use client';

import { useState } from 'react';
import { Skill } from '@/types';

interface SkillTabsProps {
    skill: Skill;
}

type TabKey = 'usage' | 'skillmd' | 'security';

export function SkillTabs({ skill }: SkillTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('usage');

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'usage', label: '使用说明' },
        { key: 'skillmd', label: 'SKILL.md' },
        { key: 'security', label: '安全报告' },
    ];

    return (
        <div>
            {/* Tab 头 */}
            <div className="flex border-b border-[var(--gray-200)]">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                                : 'border-transparent text-[var(--gray-500)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 内容 */}
            <div className="py-6">
                {activeTab === 'usage' && (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {skill.usage_guide ? (
                            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(skill.usage_guide) }} />
                        ) : (
                            <div className="text-[var(--gray-500)]">
                                <p>暂无使用说明。</p>
                                <p className="mt-2">安装后，在你的 Agent 中即可使用此 Skill。</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skillmd' && (
                    <div className="bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                            {skill.skill_md_content || '暂无 SKILL.md 内容'}
                        </pre>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div>
                        {skill.security_report ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-[var(--gray-500)]">审核时间:</span>
                                    <span>{new Date(skill.security_report.scanned_at).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-[var(--gray-500)]">审核版本:</span>
                                    <span>{skill.security_report.version}</span>
                                </div>

                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--gray-200)]">
                                            <th className="text-left py-2 font-medium">检查项</th>
                                            <th className="text-left py-2 font-medium">状态</th>
                                            <th className="text-left py-2 font-medium">说明</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {skill.security_report.checks.map((check, i) => (
                                            <tr key={i} className="border-b border-[var(--gray-100)]">
                                                <td className="py-2">{check.name}</td>
                                                <td className="py-2">
                                                    <span className={`inline-flex items-center gap-1 ${check.status === 'passed' ? 'text-green-600' :
                                                            check.status === 'warning' ? 'text-yellow-600' :
                                                                'text-red-600'
                                                        }`}>
                                                        {check.status === 'passed' && '✅ 通过'}
                                                        {check.status === 'warning' && '⚠️ 注意'}
                                                        {check.status === 'failed' && '❌ 失败'}
                                                    </span>
                                                </td>
                                                <td className="py-2 text-[var(--gray-500)]">
                                                    {check.message || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {skill.security_report.permissions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2">权限声明</h4>
                                        <ul className="list-disc list-inside text-sm text-[var(--gray-600)]">
                                            {skill.security_report.permissions.map((perm, i) => (
                                                <li key={i}>{perm}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-[var(--gray-500)]">
                                <p>暂无安全报告。</p>
                                <p className="mt-2">此 Skill 尚未进行安全扫描。</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// 简单的 Markdown 转 HTML（生产环境建议使用 marked 或 remark）
function markdownToHtml(markdown: string): string {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\n/gim, '<br>');
}
