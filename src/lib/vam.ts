// Docs: https://developers.vam.ac.uk/guide/v2/welcome.html
// This file mirrors the style of aic.ts and returns ArtworkSummary/Detail-like data.

import type { ArtworkSummary, ArtworkDetailData, Category } from "./types";

const VAM_BASE = "https://api.vam.ac.uk/v2"; // placeholder base per docs

// Build a IIIF image URL from a V&A image identifier.
// The V&A docs indicate an IIIF base such as framemark.vam.ac.uk/collections/{id}
// and then the standard IIIF path segment: /full/{w},/0/default.jpg
function VAM_IMAGE(imageId?: string, width = 800): string | undefined {
  if (!imageId) return undefined;
  return `https://framemark.vam.ac.uk/collections/${encodeURIComponent(
    imageId
  )}/full/${width},/0/default.jpg`;
}

function vamHeaders() {
  const key = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAM_API_KEY || process.env.VAM_API_KEY : undefined;
  const headers: Record<string, string> = {};
  if (key) headers["X-API-Key"] = key; // adjust header/query param name per docs if needed
  return headers;
}

const mapClassificationToCategory = (c?: string): Category | undefined => {
  if (!c) return undefined;
  const s = c.toLowerCase();
  if (s.includes("painting")) return "painting";
  if (s.includes("photograph")) return "photography";
  if (s.includes("ceramic") || s.includes("decorative")) return "decorative";
  return undefined;
};

// ------------------------------
// Search (Summary)
// ------------------------------

export async function searchVAM(q: string): Promise<ArtworkSummary[]> {
  const query = q.trim();
  if (!query) return [];

  // TODO: Replace the placeholder path/params with the correct V&A search endpoint.
  // Commonly, V&A v2 search resembles: `${VAM_BASE}/objects/search?q=${...}&page_size=24`
  const url = `${VAM_BASE}/objects/search?q=${encodeURIComponent(query)}&page_size=24`;

  const res = await fetch(url, {
    headers: vamHeaders(),
    // next: { revalidate: 60 } // enable if calling from server functions
  } as RequestInit);
  if (!res.ok) throw new Error(`VAM search failed: HTTP ${res.status}`);
  const json = await res.json();

  // TODO: Map the V&A response shape to our ArtworkSummary fields.
  // Inspect json structure and adjust the property paths below.
  const items: any[] = Array.isArray(json?.records || json?.data)
    ? (json.records || json.data)
    : [];

  return items.map((d: any): ArtworkSummary => {
    const systemNumber = d.systemNumber ? String(d.systemNumber) : undefined;
    const id = String(systemNumber || d.id);
    // Try multiple possible fields for a primary image identifier
    const imageId =
      d._primaryImageId ||
      d.primaryImageId ||
      d.primary_image_id ||
      d._primaryImage?.id ||
      d._primaryImage?.asset_id ||
      d.images?.[0]?.id ||
      d.images?.[0]?.asset_id ||
      undefined;

    const fallback =
      d._images?.[0]?.sizes?.large?.src ||
      d._images?.[0]?.url ||
      d.image ||
      undefined;

    const image = VAM_IMAGE(imageId) || (typeof fallback === "string" ? fallback : undefined) || "/placeholder.svg";

    const publicUrl = systemNumber
      ? `https://collections.vam.ac.uk/item/${encodeURIComponent(systemNumber)}`
      : undefined;

    return {
      provider: "vam",
      id,
      title: d._primaryTitle || d.title || "Untitled",
      artist: d._primaryMaker?.name || d.maker || undefined,
      date: d._primaryDate || d.date_text || undefined,
      image,
      url: d._links?.self?.href || d.link || publicUrl,
      category: mapClassificationToCategory(d.objectType || d.category),
    };
  });
}

// ------------------------------
// Detail
// ------------------------------

export async function getVAMDetail(id: string): Promise<ArtworkDetailData> {
  // TODO: Replace with the proper detail endpoint.
  const url = `${VAM_BASE}/objects/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: vamHeaders() } as RequestInit);
  if (!res.ok) throw new Error(`VAM detail failed: HTTP ${res.status}`);
  const json = await res.json();

  const d: any = json?.record || json?.data || json || {};
  const imageId =
    d._primaryImageId ||
    d.primaryImageId ||
    d.primary_image_id ||
    d._primaryImage?.id ||
    d._primaryImage?.asset_id ||
    d.images?.[0]?.id ||
    d.images?.[0]?.asset_id ||
    undefined;
  const fallback =
    d._images?.[0]?.sizes?.large?.src || d._images?.[0]?.url || d.image || undefined;
  const image = VAM_IMAGE(imageId) || (typeof fallback === "string" ? fallback : undefined) || "/placeholder.svg";

  const systemNumber = d.systemNumber ? String(d.systemNumber) : undefined;
  const publicUrl = systemNumber
    ? `https://collections.vam.ac.uk/item/${encodeURIComponent(systemNumber)}`
    : undefined;

  return {
    provider: "vam",
    id: String(systemNumber || d.id),
    title: d._primaryTitle || d.title || "Untitled",
    artist: d._primaryMaker?.name || d.maker || undefined,
    date: d._primaryDate || d.date_text || undefined,
    image,
    url: d._links?.self?.href || d.link || publicUrl,
    category: mapClassificationToCategory(d.objectType || d.category),
    description: d._summaryDescription || d.description || undefined,
    creditLine: d.creditLine || undefined,
    license: undefined,
    classification: d.objectType || d.classification || undefined,
    repository: "Victoria and Albert Museum",
    department: d.department || undefined,
  } as ArtworkDetailData;
}
