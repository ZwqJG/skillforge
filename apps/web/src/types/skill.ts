// Skill 类型定义

export type SecurityLevel = 0 | 1 | 2 | 3;

export type Category =
  | 'development'
  | 'operations'
  | 'design'
  | 'office'
  | 'marketing'
  | 'creative';

export type Platform =
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'opencode'
  | 'universal';

export interface SecurityReport {
  scanned_at: string;
  version: string;
  level: SecurityLevel;
  checks: SecurityCheck[];
  permissions: string[];
}

export interface SecurityCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message?: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  summary: string;
  github_url: string;
  github_stars: number;
  install_count: number;

  // 分类
  category: Category;
  tags: string[];
  platforms: Platform[];

  // 安全
  security_level: SecurityLevel;
  security_report?: SecurityReport | null;
  last_scanned_at?: string | null;

  // 内容
  skill_md_content: string;
  usage_guide: string;

  // 元数据
  author: string;
  license: string;
  version: string;
  source: 'skills.sh' | 'skillhub' | 'github' | 'manual';

  created_at: string;
  updated_at: string;
}

// API 响应类型
export interface SkillListResponse {
  skills: Skill[];
  total: number;
  page: number;
  page_size: number;
}

export interface SearchParams {
  q?: string;
  category?: Category;
  security_level?: SecurityLevel;
  platform?: Platform;
  sort?: 'stars' | 'installs' | 'recent';
  page?: number;
  page_size?: number;
}
