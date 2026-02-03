#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/commands/add.ts
import * as fs2 from "fs";
import * as path2 from "path";
import chalk from "chalk";
import ora from "ora";

// src/utils/platform.ts
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
var PLATFORMS = {
  "claude-code": {
    name: "Claude Code",
    skillsDir: path.join(os.homedir(), ".claude", "skills"),
    configFile: path.join(os.homedir(), ".claude", "settings.json")
  },
  "cursor": {
    name: "Cursor",
    skillsDir: ".cursor/skills"
  },
  "codex": {
    name: "Codex",
    skillsDir: ".codex/skills"
  },
  "opencode": {
    name: "OpenCode",
    skillsDir: ".opencode/skills"
  },
  "universal": {
    name: "Universal",
    skillsDir: ".agent/skills"
  }
};
function detectPlatform() {
  const claudeDir = path.join(os.homedir(), ".claude");
  if (fs.existsSync(claudeDir)) {
    return PLATFORMS["claude-code"];
  }
  if (fs.existsSync(".cursor")) {
    return PLATFORMS["cursor"];
  }
  if (fs.existsSync(".codex")) {
    return PLATFORMS["codex"];
  }
  if (fs.existsSync(".opencode")) {
    return PLATFORMS["opencode"];
  }
  return PLATFORMS["universal"];
}
function getSkillsDir(platform) {
  if (path.isAbsolute(platform.skillsDir)) {
    return platform.skillsDir;
  }
  return path.resolve(process.cwd(), platform.skillsDir);
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function listSkillsInDir(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter((name) => {
    const skillPath = path.join(dir, name);
    return fs.statSync(skillPath).isDirectory();
  });
}

// src/utils/api.ts
var API_BASE_URL = process.env.SKILLFORGE_API_URL || "https://skillforge.vercel.app";
async function getSkillInfo(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("API unavailable, trying GitHub fallback...");
    return null;
  }
}
async function searchSkills(query, options) {
  const params = new URLSearchParams({
    q: query,
    ...options?.category && { category: options.category },
    page_size: String(options?.limit || 10)
  });
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills?${params}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Search API unavailable");
    return { skills: [], total: 0 };
  }
}
async function getSkillFromGitHub(githubUrl) {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return null;
  }
  const [, owner, repo] = match;
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/SKILL.md`;
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/SKILL.md`;
      const masterResponse = await fetch(masterUrl);
      if (!masterResponse.ok) {
        return null;
      }
      return await masterResponse.text();
    }
    return await response.text();
  } catch (error) {
    return null;
  }
}
async function logInstall(skillId, platform) {
  try {
    await fetch(`${API_BASE_URL}/api/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill_id: skillId, platform })
    });
  } catch {
  }
}

// src/commands/add.ts
var SECURITY_LABELS = {
  3: { label: "\u{1F6E1}\uFE0F \u5B98\u65B9\u8BA4\u8BC1", color: chalk.green },
  2: { label: "\u2705 \u5DF2\u5BA1\u6838", color: chalk.blue },
  1: { label: "\u26A0\uFE0F \u793E\u533A\u9A8C\u8BC1", color: chalk.yellow },
  0: { label: "\u2753 \u672A\u5BA1\u6838", color: chalk.gray }
};
async function add(skill, options) {
  const spinner = ora("\u83B7\u53D6 Skill \u4FE1\u606F...").start();
  try {
    const skillInfo = await getSkillInfo(skill);
    if (!skillInfo) {
      spinner.fail(`\u672A\u627E\u5230 Skill: ${skill}`);
      console.log(chalk.gray("\u63D0\u793A: \u4F7F\u7528 skillforge search <\u5173\u952E\u8BCD> \u641C\u7D22\u53EF\u7528\u7684 Skills"));
      process.exit(1);
    }
    spinner.succeed("\u83B7\u53D6\u6210\u529F");
    console.log("");
    console.log(chalk.bold(skillInfo.name));
    console.log(chalk.gray(skillInfo.description));
    console.log("");
    console.log(`  \u2B50 ${skillInfo.github_stars.toLocaleString()} stars`);
    console.log(`  \u{1F4E5} ${skillInfo.install_count.toLocaleString()} \u5B89\u88C5`);
    console.log(`  \u{1F464} ${skillInfo.author}`);
    console.log(`  \u{1F4C4} ${skillInfo.license}`);
    const security = SECURITY_LABELS[skillInfo.security_level];
    console.log(`  \u{1F512} ${security.color(security.label)}`);
    console.log("");
    const platform = options.target ? PLATFORMS[options.target] || PLATFORMS["universal"] : detectPlatform();
    console.log(chalk.gray(`\u76EE\u6807\u5E73\u53F0: ${platform.name}`));
    const skillsDir = getSkillsDir(platform);
    const skillDir = path2.join(skillsDir, skillInfo.slug);
    if (fs2.existsSync(skillDir)) {
      console.log(chalk.yellow(`\u26A0\uFE0F Skill "${skillInfo.slug}" \u5DF2\u5B89\u88C5\uFF0C\u5C06\u8986\u76D6\u66F4\u65B0`));
    }
    if (!options.yes) {
      console.log(chalk.gray("\u4F7F\u7528 -y \u53C2\u6570\u8DF3\u8FC7\u786E\u8BA4"));
    }
    const installSpinner = ora("\u5B89\u88C5\u4E2D...").start();
    ensureDir(skillDir);
    let skillMd = skillInfo.skill_md_content;
    if (!skillMd) {
      skillMd = await getSkillFromGitHub(skillInfo.github_url) || "";
    }
    if (!skillMd) {
      installSpinner.fail("\u65E0\u6CD5\u83B7\u53D6 SKILL.md \u5185\u5BB9");
      process.exit(1);
    }
    const skillMdPath = path2.join(skillDir, "SKILL.md");
    fs2.writeFileSync(skillMdPath, skillMd, "utf-8");
    const metadataPath = path2.join(skillDir, ".skillforge.json");
    fs2.writeFileSync(metadataPath, JSON.stringify({
      id: skillInfo.id,
      name: skillInfo.name,
      slug: skillInfo.slug,
      version: skillInfo.version,
      source: "skillforge",
      installed_at: (/* @__PURE__ */ new Date()).toISOString()
    }, null, 2), "utf-8");
    installSpinner.succeed("\u5B89\u88C5\u6210\u529F\uFF01");
    await logInstall(skillInfo.id, platform.name);
    console.log("");
    console.log(chalk.green(`\u2713 ${skillInfo.name} \u5DF2\u5B89\u88C5\u5230 ${skillDir}`));
    console.log("");
    console.log(chalk.gray("\u73B0\u5728\u53EF\u4EE5\u5728\u4F60\u7684 Agent \u4E2D\u4F7F\u7528\u6B64 Skill \u4E86"));
  } catch (error) {
    spinner.fail("\u5B89\u88C5\u5931\u8D25");
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// src/commands/list.ts
import * as fs3 from "fs";
import * as path3 from "path";
import chalk2 from "chalk";
async function list() {
  console.log(chalk2.bold("\u5DF2\u5B89\u88C5\u7684 Skills\n"));
  const platform = detectPlatform();
  const skillsDir = getSkillsDir(platform);
  console.log(chalk2.gray(`\u5E73\u53F0: ${platform.name}`));
  console.log(chalk2.gray(`\u76EE\u5F55: ${skillsDir}
`));
  const skills = listSkillsInDir(skillsDir);
  if (skills.length === 0) {
    console.log(chalk2.gray("\u6682\u65E0\u5B89\u88C5\u7684 Skills"));
    console.log("");
    console.log(chalk2.gray("\u4F7F\u7528 skillforge add <skill-name> \u5B89\u88C5"));
    return;
  }
  for (const skill of skills) {
    const metadataPath = path3.join(skillsDir, skill, ".skillforge.json");
    let metadata = null;
    if (fs3.existsSync(metadataPath)) {
      try {
        metadata = JSON.parse(fs3.readFileSync(metadataPath, "utf-8"));
      } catch {
      }
    }
    if (metadata) {
      console.log(`  ${chalk2.bold(metadata.name)} ${chalk2.gray(`v${metadata.version}`)}`);
      console.log(`    ${chalk2.gray(`\u5B89\u88C5\u4E8E ${new Date(metadata.installed_at).toLocaleDateString()}`)}`);
    } else {
      console.log(`  ${chalk2.bold(skill)} ${chalk2.gray("(\u672A\u77E5\u7248\u672C)")}`);
    }
    console.log("");
  }
  console.log(chalk2.gray(`\u5171 ${skills.length} \u4E2A Skills`));
  console.log("");
  console.log(chalk2.gray("\u5176\u4ED6\u5E73\u53F0:"));
  for (const [key, p] of Object.entries(PLATFORMS)) {
    if (p.name === platform.name) continue;
    const otherDir = getSkillsDir(p);
    const otherSkills = listSkillsInDir(otherDir);
    if (otherSkills.length > 0) {
      console.log(`  ${p.name}: ${otherSkills.length} \u4E2A Skills`);
    }
  }
}

// src/commands/remove.ts
import * as fs4 from "fs";
import * as path4 from "path";
import chalk3 from "chalk";
async function remove(skill, options) {
  const platform = detectPlatform();
  const skillsDir = getSkillsDir(platform);
  const skillDir = path4.join(skillsDir, skill);
  if (!fs4.existsSync(skillDir)) {
    console.log(chalk3.red(`\u672A\u627E\u5230 Skill: ${skill}`));
    console.log(chalk3.gray("\u4F7F\u7528 skillforge list \u67E5\u770B\u5DF2\u5B89\u88C5\u7684 Skills"));
    process.exit(1);
  }
  if (!options.yes) {
    console.log(chalk3.yellow(`\u5C06\u5220\u9664 Skill: ${skill}`));
    console.log(chalk3.gray("\u4F7F\u7528 -y \u53C2\u6570\u8DF3\u8FC7\u786E\u8BA4"));
  }
  try {
    fs4.rmSync(skillDir, { recursive: true, force: true });
    console.log(chalk3.green(`\u2713 \u5DF2\u5220\u9664 ${skill}`));
  } catch (error) {
    console.log(chalk3.red("\u5220\u9664\u5931\u8D25"));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// src/commands/search.ts
import chalk4 from "chalk";
import ora2 from "ora";
var SECURITY_LABELS2 = {
  3: "\u{1F6E1}\uFE0F",
  2: "\u2705",
  1: "\u26A0\uFE0F",
  0: "\u2753"
};
async function search(query, options) {
  const spinner = ora2(`\u641C\u7D22 "${query}"...`).start();
  try {
    const result = await searchSkills(query, {
      category: options.category,
      limit: parseInt(options.limit || "10")
    });
    spinner.stop();
    if (result.skills.length === 0) {
      console.log(chalk4.gray(`\u672A\u627E\u5230\u4E0E "${query}" \u76F8\u5173\u7684 Skills`));
      return;
    }
    console.log(chalk4.bold(`\u627E\u5230 ${result.total} \u4E2A\u7ED3\u679C:
`));
    for (const skill of result.skills) {
      const security = SECURITY_LABELS2[skill.security_level] || "\u2753";
      console.log(`  ${chalk4.bold(skill.slug)} ${security}`);
      console.log(`    ${chalk4.gray(skill.description.slice(0, 60))}${skill.description.length > 60 ? "..." : ""}`);
      console.log(`    \u2B50 ${skill.github_stars.toLocaleString()}  \u{1F4E5} ${skill.install_count.toLocaleString()}  \u{1F464} ${skill.author}`);
      console.log("");
    }
    console.log(chalk4.gray("\u4F7F\u7528 skillforge add <skill-name> \u5B89\u88C5"));
  } catch (error) {
    spinner.fail("\u641C\u7D22\u5931\u8D25");
    console.error(chalk4.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// src/index.ts
var program = new Command();
program.name("skillforge").description("CLI tool for installing and managing Skills from SkillForge").version("0.1.0");
program.command("add <skill>").description("Install a skill from SkillForge").option("-t, --target <platform>", "Target platform (claude-code, cursor, codex, opencode)").option("-y, --yes", "Skip confirmation prompt").action(add);
program.command("list").alias("ls").description("List installed skills").action(list);
program.command("remove <skill>").alias("rm").description("Remove an installed skill").option("-y, --yes", "Skip confirmation prompt").action(remove);
program.command("search <query>").description("Search for skills").option("-c, --category <category>", "Filter by category").option("-l, --limit <number>", "Limit results", "10").action(search);
program.parse();
