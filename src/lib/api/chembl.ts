// ChEMBL API client — free, no auth required
// Docs: https://www.ebi.ac.uk/chembl/api/data/docs

const BASE_URL = 'https://www.ebi.ac.uk/chembl/api/data';
const TIMEOUT_MS = 10000;

interface ChEMBLActivity {
  molecule_chembl_id: string;
  molecule_pref_name: string | null;
  canonical_smiles: string;
  standard_value: number | null;
  standard_type: string;
  standard_units: string | null;
  standard_relation: string | null;
  pchembl_value: number | null;
  target_chembl_id: string;
  assay_type: string;
}

interface ChEMBLResponse {
  activities: ChEMBLActivity[];
  page_meta: { total_count: number };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`ChEMBL API error: ${res.status}`);
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchActivitiesByTarget(
  targetId: string,
  standardType: string = 'IC50',
  limit: number = 200
): Promise<ChEMBLActivity[]> {
  const url = `${BASE_URL}/activity.json?target_chembl_id=${targetId}&standard_type=${standardType}&standard_relation=%3D&limit=${limit}&format=json`;
  const res = await fetchWithTimeout(url);
  const data: ChEMBLResponse = await res.json();
  // Filter for clean quantitative data
  return data.activities.filter(
    (a) => a.standard_value !== null && a.standard_value > 0
  );
}

export async function fetchTargetActivitiesMultiple(
  targetIds: string[],
  limit: number = 50
): Promise<Record<string, { name: string; count: number }>> {
  const results: Record<string, { name: string; count: number }> = {};
  const fetches = targetIds.map(async (id) => {
    try {
      const url = `${BASE_URL}/activity.json?target_chembl_id=${id}&limit=1&format=json`;
      const res = await fetchWithTimeout(url);
      const data = await res.json();
      const targetUrl = `${BASE_URL}/target/${id}.json?format=json`;
      const targetRes = await fetchWithTimeout(targetUrl);
      const targetData = await targetRes.json();
      results[id] = {
        name: targetData.pref_name || id,
        count: data.page_meta?.total_count || 0,
      };
    } catch {
      // skip failed targets
    }
  });
  await Promise.allSettled(fetches);
  return results;
}

export type { ChEMBLActivity };
