#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { remove } from './commands/remove.js';
import { search } from './commands/search.js';

const program = new Command();

program
    .name('skillforge')
    .description('CLI tool for installing and managing Skills from SkillForge')
    .version('0.1.0');

program
    .command('add <skill>')
    .description('Install a skill from SkillForge')
    .option('-t, --target <platform>', 'Target platform (claude-code, cursor, codex, opencode)')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(add);

program
    .command('list')
    .alias('ls')
    .description('List installed skills')
    .action(list);

program
    .command('remove <skill>')
    .alias('rm')
    .description('Remove an installed skill')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(remove);

program
    .command('search <query>')
    .description('Search for skills')
    .option('-c, --category <category>', 'Filter by category')
    .option('-l, --limit <number>', 'Limit results', '10')
    .action(search);

program.parse();
