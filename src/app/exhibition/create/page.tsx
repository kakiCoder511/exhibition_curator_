"use client";

// This page reads selected artworks from a global Zustand store.
// How artworks reach this page:
// 1) On the search/home page, when user clicks "Add" on an artwork,
//    call `addArtwork(artwork)` from `useExhibitionStore()`.
// 2) The store is configured with `persist`, so artworks survive route changes
//    (stored in localStorage under the key defined in the store middleware).
// 3) The "Create" button in the mini cart links here: /exhibition/create.
//    If you see no artworks here, ensure the home page is adding to the store,
//    not to a local component state.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useExhibitionStore } from "@/store/exhibition";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { providerMeta } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

export default function CreateExhibitionPage() {
  const router = useRouter();
  const {
    exhibitionTitle: title,
    exhibitionCurator: curator,
    exhibitionNotes: notes,
    artworks,
    setTitle,
    setCurator,
    setNotes,
    removeArtwork,
    resetExhibition,
    moveArtwork,
    sortArtworks,
  } = useExhibitionStore();
  const [sortValue, setSortValue] = useState("");

  const canSave = title.trim().length > 0 && artworks.length > 0;

  async function handleSave() {
    // Minimal save flow:
    // - Write a snapshot to localStorage (you can replace this with an API call)
    // - Clear the working store so the next exhibition starts empty
    // - Navigate to your desired page (currently the home page)
    const key = "exhibition-snapshots";
    const id = Date.now().toString(36);
    const snapshot = {
      id,
      title: title.trim(),
      curator: curator.trim(),
      notes: notes.trim(),
      items: artworks,
      savedAt: new Date().toISOString(),
    };
    const prev =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    const list = prev ? JSON.parse(prev) : [];
    list.unshift(snapshot);
    localStorage.setItem(key, JSON.stringify(list));

    resetExhibition();
    router.push(`/exhibition/view/${id}`); // Go to the exhibit view page we just created
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between px-4 py-2">
          <div>
            <h1 className="text-2xl font-bold">
              <Link href="/" className="hover:underline">
                Create Exhibition
              </Link>
            </h1>
            <p className="text-sm text-muted-foreground">
              Name your exhibition and review selected artworks.
            </p>
          </div>
          <div className="space-x-2">
            <Button disabled={!canSave} onClick={handleSave}>
              Curate & Save
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
              <CardTitle className="text-lg">
                Selected Artworks ({artworks.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Sort</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Sort selected artworks</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2">
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "title:asc" ? "default" : "outline"}
                        onClick={() => { setSortValue("title:asc"); sortArtworks("title","asc"); }}
                        >
                          Title A–Z
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "title:desc" ? "default" : "outline"}
                        onClick={() => { setSortValue("title:desc"); sortArtworks("title","desc"); }}
                        >
                          Title Z–A
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "artist:asc" ? "default" : "outline"}
                        onClick={() => { setSortValue("artist:asc"); sortArtworks("artist","asc"); }}
                        >
                          Artist A–Z
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "artist:desc" ? "default" : "outline"}
                        onClick={() => { setSortValue("artist:desc"); sortArtworks("artist","desc"); }}
                        >
                          Artist Z–A
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "date:asc" ? "default" : "outline"}
                        onClick={() => { setSortValue("date:asc"); sortArtworks("date","asc"); }}
                        >
                          Date Asc
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                        variant={sortValue === "date:desc" ? "default" : "outline"}
                        onClick={() => { setSortValue("date:desc"); sortArtworks("date","desc"); }}
                        >
                          Date Desc
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Add more</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No artworks yet — go back and add some from search.
                </p>
              ) : (
                artworks.map((a) => (
                  <div key={`${a.provider}:${a.id}`} className="space-y-2">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                      <img
                        src={a.image ?? "/placeholder.svg"}
                        alt={a.title ?? "Artwork"}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).src =
                            "/placeholder.svg")
                        }
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium truncate">
                        {a.title ?? "Untitled"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {a.artist ?? "Unknown"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        Source: {providerMeta(a.provider).name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap w-full">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveArtwork(a.id, "up")}
                        aria-label="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveArtwork(a.id, "down")}
                        aria-label="Move down"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                        // Currently removes by `id` only. If your providers can
                        // share the same `id`, update the store to remove by
                        // compound key (id + provider) and call it here instead.
                        onClick={() => removeArtwork(a.id)}
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
