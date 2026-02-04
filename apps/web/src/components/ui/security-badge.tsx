import { SecurityLevel } from '@/types';

interface SecurityBadgeProps {
    level: SecurityLevel;
    size?: 'sm' | 'md' | 'lg';
}

const levelConfig: Record<SecurityLevel, { label: string; icon: string; className: string }> = {
    3: { label: '官方认证', icon: '🛡️', className: 'badge-security-3' },
    2: { label: '已审核', icon: '✅', className: 'badge-security-2' },
    1: { label: '社区验证', icon: '⚠️', className: 'badge-security-1' },
    0: { label: '未审核', icon: '❓', className: 'badge-security-0' },
};

const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

export function SecurityBadge({ level, size = 'md' }: SecurityBadgeProps) {
    const config = levelConfig[level];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClasses[size]}`}
            title={`安全等级: Level ${level} - ${config.label}`}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
