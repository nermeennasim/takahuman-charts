import { NextRequest, NextResponse } from 'next/server';
import { fetchCompoundProperties } from '@/lib/api/pubchem';
import { DRUG_NAMES } from '@/lib/api/drug-names';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const drugsParam = searchParams.get('drugs');
  const limit = parseInt(searchParams.get('limit') || '80', 10);

  const names = drugsParam
    ? drugsParam.split(',').map((s) => s.trim())
    : DRUG_NAMES.slice(0, limit);

  try {
    const properties = await fetchCompoundProperties(names);
    return NextResponse.json({ properties });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch PubChem data', properties: [] },
      { status: 502 }
    );
  }
}
