import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { detectPlatform, getSkillsDir } from '../utils/platform.js';

interface RemoveOptions {
    yes?: boolean;
}

export async function remove(skill: string, options: RemoveOptions) {
    const platform = detectPlatform();
    const skillsDir = getSkillsDir(platform);
    const skillDir = path.join(skillsDir, skill);

    if (!fs.existsSync(skillDir)) {
        console.log(chalk.red(`未找到 Skill: ${skill}`));
        console.log(chalk.gray('使用 skillforge list 查看已安装的 Skills'));
        process.exit(1);
    }

    // 确认删除
    if (!options.yes) {
        console.log(chalk.yellow(`将删除 Skill: ${skill}`));
        console.log(chalk.gray('使用 -y 参数跳过确认'));
    }

    // 删除目录
    try {
        fs.rmSync(skillDir, { recursive: true, force: true });
        console.log(chalk.green(`✓ 已删除 ${skill}`));
    } catch (error) {
        console.log(chalk.red('删除失败'));
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
