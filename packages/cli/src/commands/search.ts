import chalk from 'chalk';
import ora from 'ora';
import { searchSkills } from '../utils/api.js';

interface SearchOptions {
    category?: string;
    limit?: string;
}

const SECURITY_LABELS: Record<number, string> = {
    3: '🛡️',
    2: '✅',
    1: '⚠️',
    0: '❓',
};

export async function search(query: string, options: SearchOptions) {
    const spinner = ora(`搜索 "${query}"...`).start();

    try {
        const result = await searchSkills(query, {
            category: options.category,
            limit: parseInt(options.limit || '10'),
        });

        spinner.stop();

        if (result.skills.length === 0) {
            console.log(chalk.gray(`未找到与 "${query}" 相关的 Skills`));
            return;
        }

        console.log(chalk.bold(`找到 ${result.total} 个结果:\n`));

        for (const skill of result.skills) {
            const security = SECURITY_LABELS[skill.security_level] || '❓';

            console.log(`  ${chalk.bold(skill.slug)} ${security}`);
            console.log(`    ${chalk.gray(skill.description.slice(0, 60))}${skill.description.length > 60 ? '...' : ''}`);
            console.log(`    ⭐ ${skill.github_stars.toLocaleString()}  📥 ${skill.install_count.toLocaleString()}  👤 ${skill.author}`);
            console.log('');
        }

        console.log(chalk.gray('使用 skillforge add <skill-name> 安装'));

    } catch (error) {
        spinner.fail('搜索失败');
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}
