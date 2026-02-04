import { NextResponse } from 'next/server';
import { getSkillBySlug } from '@/lib/skills';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const skill = await getSkillBySlug(slug);

        if (!skill) {
            return NextResponse.json(
                { error: 'Skill not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(skill);
    } catch (error) {
        console.error('Error fetching skill:', error);
        return NextResponse.json(
            { error: 'Failed to fetch skill' },
            { status: 500 }
        );
    }
}
