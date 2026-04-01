import { NextRequest, NextResponse } from 'next/server';
import { fetchActivitiesByTarget } from '@/lib/api/chembl';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const target = searchParams.get('target') || 'CHEMBL203';
  const type = searchParams.get('type') || 'IC50';
  const limit = parseInt(searchParams.get('limit') || '200', 10);

  try {
    const activities = await fetchActivitiesByTarget(target, type, limit);
    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ChEMBL data', activities: [] },
      { status: 502 }
    );
  }
}
