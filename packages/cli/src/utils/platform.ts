import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Platform {
    name: string;
    skillsDir: string;
    configFile?: string;
}

export interface PlatformEntry {
    key: string;
    platform: Platform;
}

// 支持的平台配置
export const PLATFORMS: Record<string, Platform> = {
    'claude-code': {
        name: 'Claude Code',
        skillsDir: path.join(os.homedir(), '.claude', 'skills'),
        configFile: path.join(os.homedir(), '.claude', 'settings.json'),
    },
    'cursor': {
        name: 'Cursor',
        skillsDir: '.cursor/skills',
    },
    'codex': {
        name: 'Codex',
        skillsDir: '.codex/skills',
    },
    'opencode': {
        name: 'OpenCode',
        skillsDir: '.opencode/skills',
    },
    'universal': {
        name: 'Universal',
        skillsDir: '.agent/skills',
    },
};

/**
 * 检测当前环境的所有平台
 */
export function detectPlatformEntries(): PlatformEntry[] {
    const entries: PlatformEntry[] = [];

    // 检查 Claude Code
    const claudeDir = path.join(os.homedir(), '.claude');
    if (fs.existsSync(claudeDir)) {
        entries.push({ key: 'claude-code', platform: PLATFORMS['claude-code'] });
    }

    // 检查 Cursor（项目级）
    if (fs.existsSync('.cursor')) {
        entries.push({ key: 'cursor', platform: PLATFORMS['cursor'] });
    }

    // 检查 Codex
    if (fs.existsSync('.codex')) {
        entries.push({ key: 'codex', platform: PLATFORMS['codex'] });
    }

    // 检查 OpenCode
    if (fs.existsSync('.opencode')) {
        entries.push({ key: 'opencode', platform: PLATFORMS['opencode'] });
    }

    return entries;
}

export function detectPlatforms(): Platform[] {
    return detectPlatformEntries().map(entry => entry.platform);
}

/**
 * 检测当前环境的平台（返回单个）
 */
export function detectPlatform(): Platform {
    const platforms = detectPlatforms();
    if (platforms.length > 0) {
        return platforms[0];
    }
    return PLATFORMS['universal'];
}

/**
 * 获取 Skills 安装目录
 */
export function getSkillsDir(platform: Platform): string {
    // 如果是绝对路径（如 Claude Code），直接返回
    if (path.isAbsolute(platform.skillsDir)) {
        return platform.skillsDir;
    }

    // 否则是相对于当前目录的路径
    return path.resolve(process.cwd(), platform.skillsDir);
}

/**
 * 确保目录存在
 */
export function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * 列出目录下的所有 Skill
 */
export function listSkillsInDir(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(dir)
        .filter(name => {
            const skillPath = path.join(dir, name);
            return fs.statSync(skillPath).isDirectory();
        });
}
