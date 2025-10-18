"use client";
import { useEffect, useMemo, useState } from "react";
import type { ArtworkSummary } from "@/lib/types";
import { searchAIC } from "@/lib/aic";
import { searchVAM } from "@/lib/vam";
import { searchMet } from "@/lib/met";
import SearchBar from "@/components/SearchBar";
import ResultGrid from "@/components/ResultGrid";
import MiniExhibitionCart from "@/components/MiniExhibitionCart";
import { useExhibitionStore } from "@/store/exhibition";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hasUsableImage, providerMeta } from "@/lib/utils";

export default function Home() {
  const [results, setResults] = useState<ArtworkSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    artworks: cartArtworks,
    addArtwork,
    removeArtwork,
    resetExhibition,
  } = useExhibitionStore();
  type FeaturedArtwork = {
    title: string;
    artist?: string;
    image?: string;
    url?: string;
  };

  const [featuredArtwork, setFeaturedArtwork] = useState<FeaturedArtwork>({
    title: "Art of the Day",
  });

  useEffect(() => {
    let active = true;

    async function fetchFeatured() {
      try {
        const terms = ["painting", "portrait", "landscape", "flowers"];
        const term = terms[Math.floor(Math.random() * terms.length)];
        const page = Math.floor(Math.random() * 10) + 1;
        const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
          term
        )}&fields=id,title,artist_title,image_id&limit=1&page=${page}&has_images=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("AIC search failed");
        const json = await res.json();
        const item = json?.data?.[0];
        const imageId = item?.image_id;
        if (item && imageId && active) {
          setFeaturedArtwork({
            title: item.title ?? "Featured artwork",
            artist: item.artist_title ?? undefined,
            image: `https://www.artic.edu/iiif/2/${imageId}/full/1200,/0/default.jpg`,
            url: item.id
              ? `https://www.artic.edu/artworks/${item.id}`
              : undefined,
          });
        }
      } catch (err) {
        console.error("Failed to fetch art of the day", err);
      }
    }

    fetchFeatured();
    return () => {
      active = false;
    };
  }, []);
  const filteredCartArtworks = useMemo(
    () => cartArtworks.filter((art) => hasUsableImage(art.image)),
    [cartArtworks]
  );
  const heroBackground = hasUsableImage(featuredArtwork.image)
    ? featuredArtwork.image
    : undefined;

  async function handleSearch(query: string) {
    setLoading(true);
    setError("");
    try {
      const [aic, vam, met] = await Promise.all([
        searchAIC(query),
        searchVAM(query).catch(() => [] as ArtworkSummary[]),
        searchMet(query).catch(() => [] as ArtworkSummary[]),
      ]);
      setResults([...aic, ...vam, ...met]);
    } catch {
      setError("Failed to fetch artworks.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(a: ArtworkSummary) {
    addArtwork(a);
  }

  function handleRemove(a: ArtworkSummary) {
    removeArtwork(a.id);
  }

  function handleClear() {
    if (cartArtworks.length === 0) return;
    resetExhibition();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <section className="relative min-h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-zinc-900"
          style={
            heroBackground
              ? {
                  backgroundImage: `url(${heroBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-8 text-white">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <Link href="/" className="hover:underline decoration-white/70">
                Exhibition Curator
              </Link>
            </h1>
            <p className="text-sm md:text-base text-white/75">
      Discover art across museums, curate your own selections, and save
      exhibitions that inspire you.
            </p>
          </header>
          <div className="max-w-2xl w-full bg-white/85 text-gray-900 rounded-xl shadow-lg backdrop-blur-sm">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Art of the Day
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold">
              {featuredArtwork.title ?? "Art of the Day"}
            </h2>
            <p className="text-sm md:text-base text-white/80">
              {featuredArtwork.artist || "Art Institute of Chicago"}
              {" • "}
              {providerMeta("aic").name}
            </p>
            {featuredArtwork.url && (
              <a
                href={featuredArtwork.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white"
              >
                View on {providerMeta("aic").name}
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto space-y-6 px-6 py-10">
        <MiniExhibitionCart
          artworks={filteredCartArtworks}
          onRemove={handleRemove}
          onClear={handleClear}
        />
        <ResultGrid
          artworks={results}
          onAdd={handleAdd}
          loading={loading}
          error={error}
        />
      </main>
      <Button
        type="button"
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg px-5 flex items-center gap-3"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp className="size-4" />
        To top
        <Badge
          variant="secondary"
          className="rounded-full text-xs px-2 py-0.5"
          aria-label={`Mini exhibition has ${filteredCartArtworks.length} artworks`}
        >
          {filteredCartArtworks.length}
        </Badge>
      </Button>
    </div>
  );
}
