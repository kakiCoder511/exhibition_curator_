"use client";
import { useState } from "react";
import type { ArtworkSummary } from "@/lib/types";
import { searchAIC } from "@/lib/aic";
import SearchBar from "@/components/SearchBar";
import ResultGrid from "@/components/ResultGrid";
import MiniExhibitionCart from "@/components/MiniExhibitionCart";

export default function Home() {
  const [results, setResults] = useState<ArtworkSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<ArtworkSummary[]>([]);

  async function handleSearch(query: string) {
    setLoading(true);
    setError("");
    try {
      const data = await searchAIC(query); 
      setResults(data);
    } catch {
      setError("Failed to fetch artworks.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(a: ArtworkSummary) {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === a.id && item.provider === a.provider)) {
        return prev;
      }
      return [...prev, a];
    });
  }

  function handleRemove(a: ArtworkSummary) {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === a.id && item.provider === a.provider))
    );
  }

  function handleClear() {
    if (cartItems.length === 0) return;
    setCartItems([]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Exhibition Curator</h1>
        <p className="text-sm text-gray-600">Search & curate artworks</p>
      </header>

      <SearchBar onSearch={handleSearch} />
      <main className="max-w-5xl mx-auto space-y-6">
        <ResultGrid artworks={results} onAdd={handleAdd} loading={loading} error={error} />
        <MiniExhibitionCart items={cartItems} onRemove={handleRemove} onClear={handleClear} />
      </main>
    </div>
  );
}
