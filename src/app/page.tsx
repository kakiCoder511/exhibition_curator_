"use client";
import { useState } from "react";
import type { ArtworkSummary } from "@/lib/types";
import { searchAIC } from "@/lib/aic";
import { searchVAM } from "@/lib/vam";
import { searchMet } from "@/lib/met";
import SearchBar from "@/components/SearchBar";
import ResultGrid from "@/components/ResultGrid";
import MiniExhibitionCart from "@/components/MiniExhibitionCart";
import { useExhibitionStore } from "@/store/exhibition";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">
          <Link href="/" className="hover:underline">
            Exhibition Curator
          </Link>
        </h1>{" "}
        <p className="text-sm text-gray-600">Search & curate artworks</p>
      </header>
      <SearchBar onSearch={handleSearch} />

      <main className="max-w-5xl mx-auto space-y-6">
        <MiniExhibitionCart
          artworks={cartArtworks}
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
    </div>
  );
}
