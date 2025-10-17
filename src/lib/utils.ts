import { clsx, type ClassValue } from "clsx"
import type { ProviderKey } from "@/lib/types"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function providerMeta(provider: ProviderKey): { name: string; termsUrl?: string } {
  switch (provider) {
    case "aic":
      return {
        name: "Art Institute of Chicago",
        termsUrl: "https://www.artic.edu/terms",
      }
    case "vam":
      return {
        name: "Victoria and Albert Museum",
        termsUrl: "https://developers.vam.ac.uk/guide/v2/terms.html",
      }
    case "met":
      return {
        name: "The Metropolitan Museum of Art",
        termsUrl: "https://www.metmuseum.org/about-the-met/policies-and-documents/image-resources",
      }
    default:
      return { name: String(provider).toUpperCase() }
  }
}
