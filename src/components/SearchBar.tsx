"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full px-4 py-4"
      role="search"
      aria-label="Artwork search"
    >
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search artworks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10 bg-white/95 border-transparent focus-visible:border-ring focus-visible:bg-white"
          aria-label="Search query"
        />
        {!!query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute inset-y-0 right-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" disabled={!query.trim()} aria-label="Search">
        Search
      </Button>
    </form>
  );
}
