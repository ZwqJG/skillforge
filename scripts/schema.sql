-- SkillForge 数据库 Schema
-- 在 Supabase SQL Editor 中执行

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Skills 主表
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  summary TEXT,
  github_url VARCHAR(500) NOT NULL,
  github_stars INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  
  -- 分类
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  
  -- 安全
  security_level INTEGER DEFAULT 0 CHECK (security_level >= 0 AND security_level <= 3),
  security_report JSONB,
  last_scanned_at TIMESTAMPTZ,
  
  -- 内容
  skill_md_content TEXT,
  usage_guide TEXT,
  
  -- 元数据
  author VARCHAR(255),
  license VARCHAR(50),
  version VARCHAR(50),
  source VARCHAR(50),  -- 来源：skills.sh, skillhub, github, manual
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_security_level ON skills(security_level);
CREATE INDEX IF NOT EXISTS idx_skills_github_stars ON skills(github_stars DESC);
CREATE INDEX IF NOT EXISTS idx_skills_install_count ON skills(install_count DESC);
CREATE INDEX IF NOT EXISTS idx_skills_source ON skills(source);
CREATE INDEX IF NOT EXISTS idx_skills_created_at ON skills(created_at DESC);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills 
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), '')));

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skills_updated_at ON skills;
CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS 策略（公开读取）
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skills are publicly readable" ON skills;
CREATE POLICY "Skills are publicly readable" ON skills
  FOR SELECT USING (true);

-- 只允许服务端密钥写入
DROP POLICY IF EXISTS "Only service role can insert" ON skills;
CREATE POLICY "Only service role can insert" ON skills
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only service role can update" ON skills;
CREATE POLICY "Only service role can update" ON skills
  FOR UPDATE USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only service role can delete" ON skills;
CREATE POLICY "Only service role can delete" ON skills
  FOR DELETE USING (auth.role() = 'service_role');

-- 安装统计表
CREATE TABLE IF NOT EXISTS install_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  platform VARCHAR(50),
  ip_hash VARCHAR(64),  -- 哈希后的 IP，用于去重
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_install_logs_skill_id ON install_logs(skill_id);
CREATE INDEX IF NOT EXISTS idx_install_logs_created_at ON install_logs(created_at DESC);

-- 安装统计 RLS
ALTER TABLE install_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Install logs are insertable by everyone" ON install_logs;
CREATE POLICY "Install logs are insertable by everyone" ON install_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can read install logs" ON install_logs;
CREATE POLICY "Only service role can read install logs" ON install_logs
  FOR SELECT USING (auth.role() = 'service_role');
