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

const mapClassificationToCategory = (
  classification?: string | null
): Category | undefined => {
  if (!classification) return undefined;
  const normalized = classification.toLowerCase();
  if (normalized.includes("painting")) return "painting";
  if (normalized.includes("photograph")) return "photography";
  if (
    normalized.includes("ceramic") ||
    normalized.includes("decorative") ||
    normalized.includes("glass")
  )
    return "decorative";
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
  const json = (await res.json()) as VAMSearchResponse;

  const items: VAMSearchRecord[] = Array.isArray(json.records)
    ? json.records
    : Array.isArray(json.data)
      ? json.data
      : [];

  return items.map((d, index): ArtworkSummary => {
    const systemNumber = normalizeId(d.systemNumber);
    const id = normalizeId(systemNumber ?? d.id) ?? `vam-${index}`;
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
  const json = (await res.json()) as VAMDetailResponse;

  const d: VAMDetailRecord =
    json.record ?? json.data ?? (json as unknown as VAMDetailRecord);
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

  const systemNumber = normalizeId(d.systemNumber);
  const publicUrl = systemNumber
    ? `https://collections.vam.ac.uk/item/${encodeURIComponent(systemNumber)}`
    : undefined;

  return {
    provider: "vam",
    id: normalizeId(systemNumber ?? d.id) ?? id,
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

type Nullable<T> = T | null | undefined;

type VAMImageRef = {
  id?: Nullable<string>;
  asset_id?: Nullable<string>;
};

type VAMImageVariant = {
  sizes?: {
    large?: {
      src?: Nullable<string>;
    };
  };
  url?: Nullable<string>;
};

type VAMMaker = {
  name?: Nullable<string>;
};

type VAMLinks = {
  self?: {
    href?: Nullable<string>;
  };
};

type VAMSearchRecord = {
  id?: Nullable<string | number>;
  systemNumber?: Nullable<string | number>;
  _primaryImageId?: Nullable<string>;
  primaryImageId?: Nullable<string>;
  primary_image_id?: Nullable<string>;
  _primaryImage?: Nullable<VAMImageRef>;
  images?: Nullable<Array<Nullable<VAMImageRef>>>;
  _images?: Nullable<Array<Nullable<VAMImageVariant>>>;
  image?: Nullable<string>;
  _primaryTitle?: Nullable<string>;
  title?: Nullable<string>;
  _primaryMaker?: Nullable<VAMMaker>;
  maker?: Nullable<string>;
  _primaryDate?: Nullable<string>;
  date_text?: Nullable<string>;
  _links?: Nullable<VAMLinks>;
  link?: Nullable<string>;
  objectType?: Nullable<string>;
  category?: Nullable<string>;
};

type VAMSearchResponse = {
  records?: Nullable<VAMSearchRecord[]>;
  data?: Nullable<VAMSearchRecord[]>;
};

type VAMDetailRecord = VAMSearchRecord & {
  _summaryDescription?: Nullable<string>;
  description?: Nullable<string>;
  creditLine?: Nullable<string>;
  classification?: Nullable<string>;
  department?: Nullable<string>;
};

type VAMDetailResponse = {
  record?: Nullable<VAMDetailRecord>;
  data?: Nullable<VAMDetailRecord>;
};

function normalizeId(input: Nullable<string | number>): string | undefined {
  if (input === null || input === undefined) return undefined;
  return String(input);
}
