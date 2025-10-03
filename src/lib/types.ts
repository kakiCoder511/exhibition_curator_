export type ProviderKey = "aic " | "met" | "vam";
export type Category = "painting" | "photography" | "decorative";

export type ArtworkUnified = {
  provider: ProviderKey;
  id?: string;
  title?: string;
  artist?: string;
  date?: string;
  image?: string;
  url?: string;
  license?: string;
  classification?: string;
  category?: Category;
};
