'use client';

import { useState } from 'react';
import { Skill } from '@/types';

interface SkillTabsProps {
    skill: Skill;
}

type TabKey = 'skillmd' | 'security';

export function SkillTabs({ skill }: SkillTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('skillmd');

    const tabs: { key: TabKey; label: string }[] = [
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
                {activeTab === 'skillmd' && (
                    <div className="prose prose-neutral max-w-none">
                        {skill.skill_md_content ? (
                            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(skill.skill_md_content) }} />
                        ) : (
                            <div className="text-[var(--gray-500)]">
                                <p>暂无 SKILL.md 内容。</p>
                            </div>
                        )}
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
    let content = markdown.replace(/\r\n/g, '\n');

    const codeBlocks: string[] = [];
    content = content.replace(/```(\w*)\n([\s\S]*?)```/gim, (_match, _lang, code) => {
        const idx = codeBlocks.length;
        const escaped = String(code)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        codeBlocks.push(
            `<pre class="bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-lg p-3 overflow-x-auto"><code class="text-sm font-mono">${escaped}</code></pre>`
        );
        return `@@CODEBLOCK_${idx}@@`;
    });

    const tables: string[] = [];
    content = content.replace(/(^\|.*\|\n\|[-:| ]+\|\n(?:\|.*\|\n?)*)/gm, (match) => {
        const html = tableToHtml(match);
        const idx = tables.length;
        tables.push(html);
        return `@@TABLE_${idx}@@`;
    });

    content = content
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/__(.*)__/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code class="px-2 py-0.5 rounded bg-[var(--gray-100)] text-[var(--gray-700)] font-mono text-xs">$1</code>')
        .replace(/\n/gim, '<br>');

    content = content.replace(/@@TABLE_(\d+)@@/g, (_m, idx) => tables[Number(idx)] || '');
    content = content.replace(/@@CODEBLOCK_(\d+)@@/g, (_m, idx) => codeBlocks[Number(idx)] || '');
    return content;
}

function tableToHtml(markdownTable: string): string {
    const lines = markdownTable.trim().split('\n');
    if (lines.length < 2) return markdownTable;

    const headerCells = splitTableRow(lines[0]);
    const bodyLines = lines.slice(2).filter((line) => line.trim().startsWith('|'));

    const thead = `<thead><tr>${headerCells
        .map((cell) => `<th class="text-left text-[var(--gray-500)] font-medium pb-2 border-b border-[var(--gray-200)]">${renderInline(cell)}</th>`)
        .join('')}</tr></thead>`;

    const tbody = `<tbody>${bodyLines
        .map((line) => {
            const cells = splitTableRow(line);
            return `<tr>${cells.map((cell) => `<td class="py-2 border-b border-[var(--gray-100)]">${renderInline(cell)}</td>`).join('')}</tr>`;
        })
        .join('')}</tbody>`;

    return `<table class="w-full text-sm border-collapse">${thead}${tbody}</table>`;
}

function splitTableRow(line: string): string[] {
    const trimmed = line.trim();
    const noLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
    const noTrailing = noLeading.endsWith('|') ? noLeading.slice(0, -1) : noLeading;
    return noTrailing.split('|').map((cell) => cell.trim());
}

function renderInline(text: string): string {
    return text
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/__(.*)__/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code class="px-2 py-0.5 rounded bg-[var(--gray-100)] text-[var(--gray-700)] font-mono text-xs">$1</code>');
}
