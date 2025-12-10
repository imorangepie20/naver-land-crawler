import { NextResponse } from 'next/server';
import { SEOUL_DISTRICTS } from '@/types';

export async function GET() {
    const regions = Object.entries(SEOUL_DISTRICTS).map(([name, code]) => ({
        name,
        code,
    }));

    return NextResponse.json({
        success: true,
        data: regions,
        count: regions.length,
    });
}
