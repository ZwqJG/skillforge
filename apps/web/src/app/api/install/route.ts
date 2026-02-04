import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { skill_id, platform } = body;

        if (!skill_id || !platform) {
            return NextResponse.json(
                { error: 'Missing skill_id or platform' },
                { status: 400 }
            );
        }

        // TODO: 实际记录到数据库
        // 目前只是打印日志
        console.log(`Install logged: skill=${skill_id}, platform=${platform}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging install:', error);
        return NextResponse.json(
            { error: 'Failed to log install' },
            { status: 500 }
        );
    }
}
