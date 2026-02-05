import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { detectPlatformEntries, getSkillsDir, ensureDir, PLATFORMS, Platform, PlatformEntry } from '../utils/platform.js';
import { getSkillInfo, getSkillFromGitHub, logInstall } from '../utils/api.js';
import { createInterface } from 'node:readline/promises';

async function promptForPlatform(entries: PlatformEntry[]): Promise<Platform> {
    console.log(chalk.yellow('检测到多个平台:'));
    entries.forEach((entry, index) => {
        console.log(`  ${index + 1}) ${entry.platform.name} (${entry.key})`);
    });
    console.log(chalk.gray(`也可以使用 --target <platform> 跳过选择，例如: --target ${entries[0].key}`));

    if (!process.stdin.isTTY) {
        console.log(chalk.gray('当前环境不可交互，默认选择第一个平台'));
        return entries[0].platform;
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        while (true) {
            const answer = await rl.question(`请选择安装目标 [1-${entries.length}]: `);
            const index = Number(answer.trim());
            if (Number.isInteger(index) && index >= 1 && index <= entries.length) {
                return entries[index - 1].platform;
            }
            console.log(chalk.yellow('输入无效，请输入有效的数字。'));
        }
    } finally {
        rl.close();
    }
}

async function resolvePlatform(options: AddOptions): Promise<Platform> {
    if (options.target) {
        return PLATFORMS[options.target] || PLATFORMS['universal'];
    }

    const entries = detectPlatformEntries();
    if (entries.length === 0) {
        return PLATFORMS['universal'];
    }
    if (entries.length === 1) {
        return entries[0].platform;
    }
    return await promptForPlatform(entries);
}

interface AddOptions {
    target?: string;
    yes?: boolean;
}

const SECURITY_LABELS: Record<number, { label: string; color: typeof chalk.green }> = {
    3: { label: '🛡️ 官方认证', color: chalk.green },
    2: { label: '✅ 已审核', color: chalk.blue },
    1: { label: '⚠️ 社区验证', color: chalk.yellow },
    0: { label: '❓ 未审核', color: chalk.gray },
};

export async function add(skill: string, options: AddOptions) {
    const spinner = ora('获取 Skill 信息...').start();

    try {
        // 获取 Skill 信息
        const skillInfo = await getSkillInfo(skill);

        if (!skillInfo) {
            spinner.fail(`未找到 Skill: ${skill}`);
            console.log(chalk.gray('提示: 使用 skillforge search <关键词> 搜索可用的 Skills'));
            process.exit(1);
        }

        spinner.succeed('获取成功');

        // 显示 Skill 信息
        console.log('');
        console.log(chalk.bold(skillInfo.name));
        console.log(chalk.gray(skillInfo.description));
        console.log('');
        console.log(`  ⭐ ${skillInfo.github_stars.toLocaleString()} stars`);
        console.log(`  📥 ${skillInfo.install_count.toLocaleString()} 安装`);
        console.log(`  👤 ${skillInfo.author}`);
        console.log(`  📄 ${skillInfo.license}`);

        // 安全等级
        const security = SECURITY_LABELS[skillInfo.security_level];
        console.log(`  🔒 ${security.color(security.label)}`);
        console.log('');

        // 选择目标平台
        const platform = await resolvePlatform(options);

        console.log(chalk.gray(`目标平台: ${platform.name}`));

        // 获取安装目录
        const skillsDir = getSkillsDir(platform);
        const skillDir = path.join(skillsDir, skillInfo.slug);

        // 检查是否已安装
        if (fs.existsSync(skillDir)) {
            console.log(chalk.yellow(`⚠️ Skill "${skillInfo.slug}" 已安装，将覆盖更新`));
        }

        // 确认安装
        if (!options.yes) {
            // 简单实现：跳过确认（生产环境可以添加 inquirer 交互）
            console.log(chalk.gray('使用 -y 参数跳过确认'));
        }

        // 安装 Skill
        const installSpinner = ora('安装中...').start();

        // 确保目录存在
        ensureDir(skillDir);

        // 获取 SKILL.md 内容
        let skillMd = skillInfo.skill_md_content;
        if (!skillMd) {
            skillMd = await getSkillFromGitHub(skillInfo.github_url) || '';
        }

        if (!skillMd) {
            installSpinner.fail('无法获取 SKILL.md 内容');
            process.exit(1);
        }

        // 写入 SKILL.md
        const skillMdPath = path.join(skillDir, 'SKILL.md');
        fs.writeFileSync(skillMdPath, skillMd, 'utf-8');

        // 写入元数据
        const metadataPath = path.join(skillDir, '.skillforge.json');
        fs.writeFileSync(metadataPath, JSON.stringify({
            id: skillInfo.id,
            name: skillInfo.name,
            slug: skillInfo.slug,
            version: skillInfo.version,
            source: 'skillforge',
            installed_at: new Date().toISOString(),
        }, null, 2), 'utf-8');

        installSpinner.succeed('安装成功！');

        // 记录安装统计
        await logInstall(skillInfo.id, platform.name);

        console.log('');
        console.log(chalk.green(`✓ ${skillInfo.name} 已安装到 ${skillDir}`));
        console.log('');
        console.log(chalk.gray('现在可以在你的 Agent 中使用此 Skill 了'));

    } catch (error) {
        spinner.fail('安装失败');
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}
