import type { ArtworkSummary, ArtworkDetailData, Category } from "./types";

// ------------------------------
// Constants & Helpers
// ------------------------------

const AIC_ENDPOINT = "https://api.artic.edu/api/v1/artworks";
// keep /search but only to retrieve IDs; images come from hydrate call
const AIC_SEARCH_ENDPOINT = `${AIC_ENDPOINT}/search`; // used just to fetch matching IDs

/**
 * Build the "search for IDs" URL (step 1).
 * Example: https://api.artic.edu/api/v1/artworks/search?q=cat&limit=24&fields=id
 */
function buildAICSearchIdsUrl(query: string, limit = 24) {
  const q = query.trim(); // defensively trim
  // only request 'id' here (faster, smaller)
  return `${AIC_SEARCH_ENDPOINT}?q=${encodeURIComponent(
    q
  )}&limit=${limit}&fields=id`;
}

/**
 * Build the "hydrate by IDs" URL (step 2).
 * Example: https://api.artic.edu/api/v1/artworks?ids=1,2,3&fields=id,title,image_id,...
 */
function buildAICHydrateUrl(ids: string[], fields: string[]) {
  const fieldString = fields.join(",");
  return `${AIC_ENDPOINT}?ids=${ids.join(",")}&fields=${fieldString}`;
}

// Construct IIIF image URL from image_id.

const AIC_IMAGE = (imageId?: string | null) =>
  imageId
    ? `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`
    : undefined;

/**
 * Map AIC classification_title to our Category type.
 */
const mapClassificationToCategory = (c?: string): Category | undefined => {
  if (!c) return undefined;
  const s = c.toLowerCase();
  if (s.includes("painting")) return "painting";
  if (s.includes("photograph")) return "photography";
  if (s.includes("ceramic") || s.includes("decorative")) return "decorative";
  return undefined;
};

// ------------------------------
// Fetch Functions
// ------------------------------

/**
 * 🔎 Search Artworks (Summary) — 2-step:
 *   1) search for matching IDs
 *   2) hydrate those IDs to get image_id and other fields
 */
export async function searchAIC(q: string): Promise<ArtworkSummary[]> {
  // STEP 1: search for IDs only
  const idsUrl = buildAICSearchIdsUrl(q); //  use minimal /search for IDs
  try {
    const idsRes = await fetch(idsUrl, {
      next: { revalidate: 60 }, //  light caching (optional)
    } as RequestInit);
    if (!idsRes.ok)
      throw new Error(
        `AIC search IDs failed: HTTP ${idsRes.status} ${idsRes.statusText}`
      );

    const idsJson = (await idsRes.json()) as {
      data?: Array<{ id?: number | string | null | undefined }>;
    };
    const idList: string[] = Array.isArray(idsJson?.data)
      ? idsJson.data
          .map((d) => d?.id)
          .filter(
            (id): id is number | string => id !== null && id !== undefined
          )
          .map((id) => String(id))
      : [];

    if (idList.length === 0) return []; // nothing matched

    // STEP 2: hydrate details (including image_id)
    const hydrateUrl = buildAICHydrateUrl(idList, [
      "id",
      "title",
      "artist_title",
      "date_display",
      "image_id",
      "thumbnail",
      "has_image",
      "classification_title",
    ]); // ask for image_id here

    const res = await fetch(hydrateUrl, {
      next: { revalidate: 60 }, // light caching (optional)
    } as RequestInit);
    if (!res.ok)
      throw new Error(
        `AIC hydrate failed: HTTP ${res.status} ${res.statusText}`
      );

    const json = (await res.json()) as {
      data?: AICHydrateRecord[];
    };
    if (!json?.data || !Array.isArray(json.data)) {
      throw new Error("AIC hydrate: Unexpected API response structure");
    }

    return json.data.map(
      (d): ArtworkSummary => ({
        provider: "aic",
        id: String(d.id),
        title: d.title ?? "Untitled",
        artist: d.artist_title ?? undefined,
        date: d.date_display ?? undefined,
        image: AIC_IMAGE(d.image_id) ?? d.thumbnail?.lqip ?? "/placeholder.svg",
        //  link to public artwork page
        url: d.id ? `https://www.artic.edu/artworks/${d.id}` : undefined,
        category: mapClassificationToCategory(d.classification_title),
      })
    );
  } catch (err) {
    console.error("❌ Error in searchAIC:", err);
    throw err;
  }
}

type AICHydrateRecord = {
  id: number | string;
  title?: string | null;
  artist_title?: string | null;
  date_display?: string | null;
  image_id?: string | null;
  thumbnail?: { lqip?: string | null } | null;
  classification_title?: string | null;
};

/**
 * 🖼️ Get Artwork Detail (by ID)
 * Returns extended artwork information for the detail page.
 */
export async function getAICDetail(id: string): Promise<ArtworkDetailData> {
  const fields = [
    "id",
    "title",
    "artist_title",
    "date_display",
    "image_id",
    "thumbnail",
    "classification_title",
    "department_title",
    "credit_line",
    "is_public_domain",
    "short_description",
    "description",
  ].join(",");

  const url = `${AIC_ENDPOINT}/${encodeURIComponent(id)}?fields=${fields}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, //  light caching (optional)
    } as RequestInit);
    if (!res.ok)
      throw new Error(
        `AIC detail fetch failed: HTTP ${res.status} ${res.statusText}`
      );

    const json = await res.json();
    const d = json?.data ?? {};

    const image =
      AIC_IMAGE(d.image_id) ?? d.thumbnail?.lqip ?? "/placeholder.svg";

    return {
      provider: "aic",
      id: String(d.id),
      title: d.title ?? "Untitled",
      artist: d.artist_title ?? undefined,
      date: d.date_display ?? undefined,
      image,
      //  link to public artwork page
      url: d.id ? `https://www.artic.edu/artworks/${d.id}` : undefined,
      category: mapClassificationToCategory(d.classification_title),

      description: d.short_description ?? d.description ?? undefined,
      creditLine: d.credit_line ?? undefined,
      license: d.is_public_domain ? "public-domain" : undefined,
      classification: d.classification_title ?? undefined,
      repository: "Art Institute of Chicago",
      department: d.department_title ?? undefined,
    };
  } catch (err) {
    console.error(`❌ Error in getAICDetail(${id}):`, err);
    throw err;
  }
}
