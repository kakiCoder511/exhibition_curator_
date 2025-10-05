"use client";

// This page reads selected artworks from a global Zustand store.
// How items reach this page:
// 1) On the search/home page, when user clicks "Add" on an artwork,
//    call `addItem(artwork)` from `useExhibitionStore()`.
// 2) The store is configured with `persist`, so items survive route changes
//    (stored in localStorage under the key defined in the store middleware).
// 3) The "Create" button in the mini cart links here: /exhibition/create.
//    If you see no items here, ensure the home page is adding to the store,
//    not to a local component state.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useExhibitionStore } from "@/store/exhibition";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CreateExhibitionPage() {
  const router = useRouter();
  const {
    title, curator, notes, items,
    setTitle, setCurator, setNotes,
    removeItem, clear, moveItem, sortItems
  } = useExhibitionStore();
  const [sortValue, setSortValue] = useState("");

  const canSave = title.trim().length > 0 && items.length > 0;

  async function handleSave() {
    // Minimal save flow:
    // - Write a snapshot to localStorage (you can replace this with an API call)
    // - Clear the working store so the next exhibition starts empty
    // - Navigate to your desired page (currently the home page)
    const key = "exhibition-snapshots";
    const snapshot = {
      title: title.trim(),
      curator: curator.trim(),
      notes: notes.trim(),
      items,
      savedAt: new Date().toISOString(),
    };
    const prev = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    const list = prev ? JSON.parse(prev) : [];
    list.unshift(snapshot);
    localStorage.setItem(key, JSON.stringify(list));

    clear();            // 重置工作區
    router.push("/");   // Go back to home (change to /exhibitions if you have a listing page)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Exhibition</h1>
            <p className="text-sm text-muted-foreground">
              Name your exhibition and review selected artworks.
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => router.back()}>Back</Button>
            <Button disabled={!canSave} onClick={handleSave}>
              Save Exhibition
            </Button>
          </div>
        </header>

        {/* Form */}
        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="p-4 grid gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                placeholder="e.g. Light & Shadow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Curator</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                placeholder="Your name"
                value={curator}
                onChange={(e) => setCurator(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                rows={4}
                placeholder="Short description, themes, audience..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected artworks */}
        <section>
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Selected Artworks ({items.length})</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  className="h-8 px-2 py-1 rounded-md border text-sm bg-background"
                  value={sortValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSortValue(v);
                    const [by, dir] = v.split(":") as ["title"|"artist"|"date", "asc"|"desc"];
                    if (by && dir) sortItems(by, dir);
                  }}
                >
                  <option value="">Sort...</option>
                  <option value="title:asc">Title A–Z</option>
                  <option value="title:desc">Title Z–A</option>
                  <option value="artist:asc">Artist A–Z</option>
                  <option value="artist:desc">Artist Z–A</option>
                  <option value="date:asc">Date Asc</option>
                  <option value="date:desc">Date Desc</option>
                </select>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Add more</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No artworks yet — go back and add some from search.
                </p>
              ) : (
                items.map((a) => (
                  <div key={`${a.provider}:${a.id}`} className="space-y-2">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                      <img
                        src={a.image ?? "/placeholder.png"}
                        alt={a.title ?? "Artwork"}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.png")}
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium truncate">{a.title ?? "Untitled"}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.artist ?? "Unknown"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(a.id, "up")}
                        aria-label="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveItem(a.id, "down")}
                        aria-label="Move down"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        // Currently removes by `id` only. If your providers can
                        // share the same `id`, update the store to remove by
                        // compound key (id + provider) and call it here instead.
                        onClick={() => removeItem(a.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
