// PubChem PUG REST API client — free, no auth required
// Docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest

const BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const TIMEOUT_MS = 10000;
const BATCH_SIZE = 5; // PubChem recommends small batches for name lookups

export interface CompoundProperty {
  CID: number;
  MolecularWeight: number;
  XLogP: number;
  TPSA: number;
  HBondDonorCount: number;
  HBondAcceptorCount: number;
  MolecularFormula: string;
  IUPACName?: string;
  // We'll add the drug name ourselves
  drugName?: string;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`PubChem API error: ${res.status}`);
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBatch(names: string[]): Promise<CompoundProperty[]> {
  const nameStr = names.join(',');
  const props = 'MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,MolecularFormula,IUPACName';
  const url = `${BASE_URL}/compound/name/${encodeURIComponent(nameStr)}/property/${props}/JSON`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();
  const properties: CompoundProperty[] = data.PropertyTable?.Properties || [];
  // Attach drug names (PubChem returns in same order as requested)
  return properties.map((p, i) => ({ ...p, drugName: names[i] || undefined }));
}

export async function fetchCompoundProperties(
  names: string[]
): Promise<CompoundProperty[]> {
  const results: CompoundProperty[] = [];
  const batches: string[][] = [];

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    batches.push(names.slice(i, i + BATCH_SIZE));
  }

  // Fetch batches in parallel (max 4 concurrent to respect rate limits)
  const CONCURRENCY = 4;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(chunk.map((batch) => fetchBatch(batch)));
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    }
  }

  return results;
}
