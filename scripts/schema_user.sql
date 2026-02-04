-- SkillForge 用户系统 Schema 更新
-- 在 Supabase SQL Editor 中执行

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户资料 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户可以读取所有公开资料
DROP POLICY IF EXISTS "User profiles are publicly readable" ON user_profiles;
CREATE POLICY "User profiles are publicly readable" ON user_profiles
    FOR SELECT USING (true);

-- 用户只能更新自己的资料
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 用户可以插入自己的资料
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. 更新 skills 表，添加用户提交相关字段
ALTER TABLE skills ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
-- status: pending | approved | rejected | updating
ALTER TABLE skills ADD COLUMN IF NOT EXISTS github_key VARCHAR(255);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS reject_reason TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS ai_review_result JSONB;

-- github_key 唯一索引（用于防重复提交）
CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_github_key ON skills(github_key) WHERE github_key IS NOT NULL;

-- 更新 RLS 策略：允许用户提交和更新自己的 Skill
-- 公开读取（只显示已通过审核的）
DROP POLICY IF EXISTS "Skills are publicly readable" ON skills;
CREATE POLICY "Skills are publicly readable" ON skills
    FOR SELECT USING (status = 'approved' OR submitted_by = auth.uid());

-- 登录用户可以提交
DROP POLICY IF EXISTS "Authenticated users can submit skills" ON skills;
CREATE POLICY "Authenticated users can submit skills" ON skills
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());

-- 用户可以更新自己提交的 Skill
DROP POLICY IF EXISTS "Users can update own skills" ON skills;
CREATE POLICY "Users can update own skills" ON skills
    FOR UPDATE USING (submitted_by = auth.uid() OR auth.role() = 'service_role');

-- 服务角色可以做任何操作
DROP POLICY IF EXISTS "Service role has full access" ON skills;
CREATE POLICY "Service role has full access" ON skills
    FOR ALL USING (auth.role() = 'service_role');

-- 3. 每日提交限制表
CREATE TABLE IF NOT EXISTS daily_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_date DATE DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 1,
    UNIQUE(user_id, submission_date)
);

-- 每日提交限制 RLS
ALTER TABLE daily_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own submissions" ON daily_submissions;
CREATE POLICY "Users can read own submissions" ON daily_submissions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own submissions" ON daily_submissions;
CREATE POLICY "Users can insert own submissions" ON daily_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON daily_submissions;
CREATE POLICY "Users can update own submissions" ON daily_submissions
    FOR UPDATE USING (auth.uid() = user_id);
