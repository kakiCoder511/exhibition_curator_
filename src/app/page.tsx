"use client";
import { useState } from "react";
import type { ArtworkSummary } from "@/lib/types";
import { searchAIC } from "@/lib/aic";
import SearchBar from "@/components/SearchBar";
import ResultGrid from "@/components/ResultGrid";
import MiniExhibitionCart from "@/components/MiniExhibitionCart";
import { useExhibitionStore } from "@/store/exhibition";

export default function Home() {
  const [results, setResults] = useState<ArtworkSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { items: cartItems, addItem, removeItem, clear } = useExhibitionStore();

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
    addItem(a);
  }

  function handleRemove(a: ArtworkSummary) {
    removeItem(a.id);
  }

  function handleClear() {
    if (cartItems.length === 0) return;
    clear();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Exhibition Curator</h1>
        <p className="text-sm text-gray-600">Search & curate artworks</p>
      </header>
      <SearchBar onSearch={handleSearch} />


      <main className="max-w-5xl mx-auto space-y-6">
        <MiniExhibitionCart items={cartItems} onRemove={handleRemove} onClear={handleClear} />
        <ResultGrid artworks={results} onAdd={handleAdd} loading={loading} error={error} />
      </main>
    </div>
  );
}
