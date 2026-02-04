'use client';

import { useState } from 'react';

interface CopyButtonProps {
    text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            style={{ backgroundColor: '#000', color: '#fff' }}
            className="px-4 py-2 rounded font-medium text-sm hover:opacity-80 transition-opacity"
        >
            {copied ? '已复制 ✓' : '复制'}
        </button>
    );
}
