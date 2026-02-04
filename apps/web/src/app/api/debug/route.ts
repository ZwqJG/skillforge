import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const diagnostics = {
        timestamp: new Date().toISOString(),
        env: {
            NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET',
        },
        supabaseConfigured: !!(supabaseUrl && supabaseKey),
        testQuery: null as any,
    };

    if (supabaseUrl && supabaseKey) {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error, count } = await supabase
                .from('skills')
                .select('slug, name', { count: 'exact' })
                .limit(5);

            diagnostics.testQuery = {
                success: !error,
                error: error?.message || null,
                totalCount: count,
                sampleSlugs: data?.map(s => s.slug) || [],
            };
        } catch (e: any) {
            diagnostics.testQuery = {
                success: false,
                error: e.message,
            };
        }
    }

    return NextResponse.json(diagnostics, { status: 200 });
}
