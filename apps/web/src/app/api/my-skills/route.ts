import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        // 验证用户身份
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const accessToken = authHeader.replace('Bearer ', '');
        const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: { user: currentUser }, error: authError } = await anonSupabase.auth.getUser(accessToken);

        if (authError || !currentUser) {
            return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 });
        }

        // 获取用户提交的 Skills
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: skills, error } = await supabase
            .from('skills')
            .select('id, name, slug, status, github_stars, security_level, created_at, updated_at')
            .eq('submitted_by', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Query error:', error);
            return NextResponse.json({ error: '查询失败' }, { status: 500 });
        }

        return NextResponse.json({ skills: skills || [] });

    } catch (error: any) {
        console.error('My skills error:', error);
        return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 });
    }
}
