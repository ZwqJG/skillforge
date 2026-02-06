import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { detectPlatform, getSkillsDir, listSkillsInDir, PLATFORMS } from '../utils/platform.js';

interface SkillMetadata {
    name: string;
    slug: string;
    version: string;
    installed_at: string;
}

export async function list() {
    console.log(chalk.bold('已安装的 Skills\n'));

    const platform = detectPlatform();
    const skillsDir = getSkillsDir(platform);

    console.log(chalk.gray(`平台: ${platform.name}`));
    console.log(chalk.gray(`目录: ${skillsDir}\n`));

    const skills = listSkillsInDir(skillsDir);

    if (skills.length === 0) {
        console.log(chalk.gray('暂无安装的 Skills'));
        console.log('');
        console.log(chalk.gray('使用 npx skillforge-tools add <skill-name> 安装'));
        return;
    }

    // 显示已安装的 Skills
    for (const skill of skills) {
        const metadataPath = path.join(skillsDir, skill, '.skillforge.json');
        let metadata: SkillMetadata | null = null;

        if (fs.existsSync(metadataPath)) {
            try {
                metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            } catch {
                // 忽略解析错误
            }
        }

        if (metadata) {
            console.log(`  ${chalk.bold(metadata.name)} ${chalk.gray(`v${metadata.version}`)}`);
            console.log(`    ${chalk.gray(`安装于 ${new Date(metadata.installed_at).toLocaleDateString()}`)}`);
        } else {
            console.log(`  ${chalk.bold(skill)} ${chalk.gray('(未知版本)')}`);
        }
        console.log('');
    }

    console.log(chalk.gray(`共 ${skills.length} 个 Skills`));

    // 检查其他平台
    console.log('');
    console.log(chalk.gray('其他平台:'));

    for (const [key, p] of Object.entries(PLATFORMS)) {
        if (p.name === platform.name) continue;

        const otherDir = getSkillsDir(p);
        const otherSkills = listSkillsInDir(otherDir);

        if (otherSkills.length > 0) {
            console.log(`  ${p.name}: ${otherSkills.length} 个 Skills`);
        }
    }
}
