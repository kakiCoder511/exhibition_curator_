// The Met Collection API (v1-compatible client)
// Docs (v1): https://metmuseum.github.io/
// The museum is releasing API v2; this client can be adjusted when fields differ.

import type { ArtworkSummary, ArtworkDetailData, Category } from "./types";

const MET_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

const mapClassificationToCategory = (c?: string): Category | undefined => {
  if (!c) return undefined;
  const s = c.toLowerCase();
  if (s.includes("painting")) return "painting";
  if (s.includes("photograph")) return "photography";
  if (s.includes("ceramic") || s.includes("decorative") || s.includes("glass")) return "decorative";
  return undefined;
};

export async function searchMet(q: string): Promise<ArtworkSummary[]> {
  const query = q.trim();
  if (!query) return [];

  // STEP 1: search for objectIDs
  const url = `${MET_BASE}/search?q=${encodeURIComponent(query)}&hasImages=true`;
  const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit);
  if (!res.ok) throw new Error(`MET search failed: HTTP ${res.status}`);
  const json = await res.json();
  const ids: number[] = Array.isArray(json?.objectIDs) ? json.objectIDs.slice(0, 24) : [];
  if (ids.length === 0) return [];

  // STEP 2: hydrate a subset (up to 24) sequentially or in small batches
  const chunks: number[][] = [];
  const size = 8;
  for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));

  const results: ArtworkSummary[] = [];
  for (const group of chunks) {
    const batch = await Promise.all(
      group.map(async (id) => {
        try {
          const d = await getMetDetailRaw(String(id));
          const image = d.primaryImageSmall || d.primaryImage || undefined;
          const title = d.title || "Untitled";
          const artist = d.artistDisplayName || undefined;
          const date = d.objectDate || undefined;
          return {
            provider: "met" as const,
            id: String(id),
            title,
            artist,
            date,
            image: image || "/placeholder.svg",
            url: `https://www.metmuseum.org/art/collection/search/${id}`,
            category: mapClassificationToCategory(d.classification || d.objectName),
          } satisfies ArtworkSummary;
        } catch {
          return null;
        }
      })
    );
    for (const item of batch) if (item) results.push(item);
  }
  return results;
}

async function getMetDetailRaw(id: string) {
  const url = `${MET_BASE}/objects/${encodeURIComponent(id)}`;
  const res = await fetch(url, { next: { revalidate: 300 } } as RequestInit);
  if (!res.ok) throw new Error(`MET detail failed: HTTP ${res.status}`);
  return res.json();
}

export async function getMetDetail(id: string): Promise<ArtworkDetailData> {
  const d = await getMetDetailRaw(id);
  const image = d.primaryImage || d.primaryImageSmall || "/placeholder.svg";
  // Build a richer description from available fields since MET API often lacks narrative text
  const descParts: string[] = [];
  if (d.medium) descParts.push(`Medium: ${d.medium}`);
  if (d.dimensions) descParts.push(`Dimensions: ${d.dimensions}`);
  if (d.culture) descParts.push(`Culture: ${d.culture}`);
  if (d.period) descParts.push(`Period: ${d.period}`);
  if (d.classification) descParts.push(`Classification: ${d.classification}`);
  if (d.creditLine) descParts.push(`Credit line: ${d.creditLine}`);
  const description = descParts.length ? descParts.join(" \u2022 ") : undefined;
  return {
    provider: "met",
    id: String(d.objectID ?? id),
    title: d.title || "Untitled",
    artist: d.artistDisplayName || undefined,
    date: d.objectDate || undefined,
    image,
    url: d.objectID ? `https://www.metmuseum.org/art/collection/search/${d.objectID}` : undefined,
    category: mapClassificationToCategory(d.classification || d.objectName),
    description,
    creditLine: d.creditLine || undefined,
    license: d.isPublicDomain ? "public-domain" : undefined,
    classification: d.classification || d.objectName || undefined,
    repository: "The Metropolitan Museum of Art",
    department: d.department || undefined,
  };
}
