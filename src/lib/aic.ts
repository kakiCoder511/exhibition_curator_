import type { ArtworkSummary, ArtworkDetailData, Category } from "./types";

// ------------------------------
// Constants & Helpers
// ------------------------------

const AIC_ENDPOINT = "https://api.artic.edu/api/v1/artworks";

/**
 * Build AIC query URL
 * Example:
 * https://api.artic.edu/api/v1/artworks?query=cat&fields=id,title,image_id
 */
function buildAICUrl(query: string, fields: string[]) {
  const fieldString = fields.join(",");
  return `${AIC_ENDPOINT}?query=${encodeURIComponent(query)}&fields=${fieldString}`;
}

/**
 * Construct IIIF image URL from image_id
 */
const AIC_IMAGE = (imageId?: string) =>
  imageId
    ? `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`
    : undefined;

/**
 * Map AIC classification_title to our Category type
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
 * 🔎 Search Artworks (Summary)
 * Returns a simplified list of artworks for the search grid.
 */
export async function searchAIC(q: string): Promise<ArtworkSummary[]> {
  const url = buildAICUrl(q, [
    "id",
    "title",
    "artist_title",
    "date_display",
    "image_id",
    "thumbnail",
    "classification_title",
  ]);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AIC search failed: HTTP ${res.status} ${res.statusText}`);

    const json = await res.json();
    if (!json?.data) throw new Error("AIC search: Unexpected API response structure");

    return (json.data ?? []).map((d: any): ArtworkSummary => ({
      provider: "aic",
      id: String(d.id),
      title: d.title ?? "Untitled",
      artist: d.artist_title ?? undefined,
      date: d.date_display ?? undefined,
      image: AIC_IMAGE(d.image_id) ?? d.thumbnail?.lqip ?? "/placeholder.png",
      url: d.id ? `${AIC_ENDPOINT}/${d.id}` : undefined,
      category: mapClassificationToCategory(d.classification_title),
    }));
  } catch (err) {
    console.error("❌ Error in searchAIC:", err);
    throw err;
  }
}

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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AIC detail fetch failed: HTTP ${res.status} ${res.statusText}`);

    const json = await res.json();
    const d = json.data ?? {};

    const image = AIC_IMAGE(d.image_id) ?? d.thumbnail?.lqip ?? "/placeholder.png";

    return {
      provider: "aic",
      id: String(d.id),
      title: d.title ?? "Untitled",
      artist: d.artist_title ?? undefined,
      date: d.date_display ?? undefined,
      image,
      url: d.id ? `${AIC_ENDPOINT}/${d.id}` : undefined,
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
