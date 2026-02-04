import { NextResponse } from 'next/server';
import { getSkills } from '@/lib/skills';
import { Category, SecurityLevel, Platform } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    try {
        const result = await getSkills({
            q: searchParams.get('q') || undefined,
            category: searchParams.get('category') as Category | undefined,
            security_level: searchParams.get('security_level')
                ? parseInt(searchParams.get('security_level')!) as SecurityLevel
                : undefined,
            platform: searchParams.get('platform') as Platform | undefined,
            sort: (searchParams.get('sort') as 'stars' | 'installs' | 'recent') || 'stars',
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
            page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 12,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching skills:', error);
        return NextResponse.json(
            { error: 'Failed to fetch skills' },
            { status: 500 }
        );
    }
}
