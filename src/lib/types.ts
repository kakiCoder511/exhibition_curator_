export type ProviderKey = "aic" | "met" | "vam";
export type Category = "painting" | "photography" | "decorative";

//for artwork summary info
export type ArtworkSummary = {
  provider: ProviderKey;
  id: string;
  title?: string;
  artist?: string;
  date?: string;
  image?: string;
  url?: string;
  category?: Category;
};

//artwork extended info
export type ArtworkDetailData = ArtworkSummary & {
  description?: string;
  creditLine?: string;
  license?: string;
  classification?: string;
  repository?: string;
  department?: string;
};

export type SearchQuery = {
  q?: string;
  provider?: ProviderKey[];
  category?: Category;
  sort?: "relevance" | "dateAsc" | "dateDesc";
};