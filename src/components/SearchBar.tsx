"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  }

  // short cut key on searchbar：Cmd/Ctrl+K ；Esc 
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl mx-auto p-4" role="search" aria-label="Artwork search">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search artworks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        aria-label="Search query"
      />
      <Button type="submit" disabled={!query.trim()} aria-label="Search">
        Search
      </Button>
      {!!query && (
        <Button type="button" variant="secondary" onClick={() => setQuery("")} aria-label="Clear search">
          Clear
        </Button>
      )}
    </form>
  );
}
