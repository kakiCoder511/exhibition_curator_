"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ArtworkSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAICDetail } from "@/lib/aic";
import { getMetDetail } from "@/lib/met";
import { getVAMDetail } from "@/lib/vam";
import { sanitizeHtml } from "@/lib/sanitize";
import { useExhibitionStore } from "@/store/exhibition";
import { hasUsableImage, providerMeta } from "@/lib/utils";

type Snapshot = {
  id: string;
  title: string;
  curator: string;
  notes: string;
  items: ArtworkSummary[];
  savedAt: string;
};

export default function ExhibitionViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [descMap, setDescMap] = useState<Record<string, string | undefined>>({});
  const { loadExhibition } = useExhibitionStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exhibition-snapshots");
      const list: Snapshot[] = raw ? JSON.parse(raw) : [];
      const found = list.find((s) => s.id === id) ?? null;
      setSnapshot(found);
      if (!found) setError("Exhibition not found.");
    } catch {
      setError("Failed to load exhibition.");
    }
  }, [id]);

  // Prefetch first item's description when page loads (nice-to-have)
  const ensureDescription = useCallback(async (a: ArtworkSummary) => {
    const key = `${a.provider}:${a.id}`;
    if (descMap[key] !== undefined) return;
    try {
      if (a.provider === "aic") {
        const d = await getAICDetail(a.id);
        setDescMap((m) => ({ ...m, [key]: d.description }));
      } else if (a.provider === "met") {
        const d = await getMetDetail(a.id);
        setDescMap((m) => ({ ...m, [key]: d.description }));
      } else if (a.provider === "vam") {
        const d = await getVAMDetail(a.id);
        setDescMap((m) => ({ ...m, [key]: d.description }));
      } else {
        setDescMap((m) => ({ ...m, [key]: undefined }));
      }
    } catch {
      setDescMap((m) => ({ ...m, [key]: undefined }));
    }
  }, [descMap]);

  const filteredItems = useMemo(
    () => (snapshot?.items ?? []).filter((item) => hasUsableImage(item.image)),
    [snapshot?.items]
  );
  const heroImage = useMemo(
    () => filteredItems[0]?.image ?? snapshot?.items?.[0]?.image,
    [filteredItems, snapshot?.items]
  );
  const [heroBroken, setHeroBroken] = useState(false);

  useEffect(() => {
    const first = filteredItems[0];
    if (!first) return;
    void ensureDescription(first);
  }, [filteredItems, ensureDescription]);

  useEffect(() => {
    setHeroBroken(false);
  }, [heroImage]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-red-500">{error}</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  if (filteredItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-white/70">
          This exhibition does not include artworks with available images.
        </p>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            loadExhibition({
              exhibitionTitle: snapshot.title ?? "",
              exhibitionCurator: snapshot.curator ?? "",
              exhibitionNotes: snapshot.notes ?? "",
              artworks: snapshot.items ?? [],
            });
            router.push("/exhibition/create");
          }}
        >
          Edit exhibition
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section with first artwork as background */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        {heroImage && !heroBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={snapshot.title ?? "Exhibition hero artwork"}
            className="absolute inset-0 w-full h-full object-cover select-none"
            onError={() => setHeroBroken(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
        <div className="relative z-10 h-full flex flex-col items-start justify-end p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {snapshot.title || "Untitled Exhibition"}
          </h1>
          {snapshot.curator && (
            <p className="mt-2 text-lg md:text-xl text-white/80">
              Curated by {snapshot.curator}
            </p>
          )}
          {snapshot.notes && (
            <p className="mt-4 max-w-3xl text-sm md:text-base text-white/70">
              {snapshot.notes}
            </p>
          )}
        </div>
      </section>

      {/* Artwork sections */}
      <main className="px-2 md:px-6 py-8 space-y-10">
        {filteredItems.map((a, idx) => {
          const key = `${a.provider}:${a.id}`;
          const isOpen = openIdx === idx;
          const desc = descMap[key];
          return (
            <section
              key={key}
              className="space-y-4 border-b border-white/10 pb-10 last:border-b-0 last:pb-0"
            >
              {/* Image area */}
              <div className="relative w-full bg-black flex items-center justify-center rounded-lg overflow-hidden min-h-[50vh] md:min-h-[60vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image ?? "/placeholder.svg"}
                  alt={a.title ?? "Artwork"}
                  className="max-h-[70vh] md:max-h-[80vh] w-auto max-w-full object-contain"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.svg")}
                />
              </div>

              {/* Info card */}
              <div className="mx-auto max-w-4xl">
                <div className="bg-white text-black rounded-lg p-4 md:p-5 shadow border border-black/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xl md:text-2xl font-semibold truncate">
                        {a.title ?? "Untitled"}
                      </h3>
                      <p className="text-sm md:text-base text-black/70 truncate">
                        {(a.artist ?? "Unknown Artist")}
                        {a.date ? ` · ${a.date}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={a.url} target="_blank" rel="noreferrer">
                            Source
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          if (!isOpen) await ensureDescription(a);
                          setOpenIdx(isOpen ? null : idx);
                        }}
                      >
                        {isOpen ? "Hide details" : "Details"}
                      </Button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-2 text-sm md:text-base text-black/85">
                      {desc ? (
                        <div
                          className="leading-relaxed prose prose-sm max-w-none"
                          // Render limited, sanitized HTML from providers like AIC
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc) }}
                        />
                      ) : (
                        <p className="italic text-black/60">No description available.</p>
                      )}
                    </div>
                  )}
                  <div className="mt-3 text-xs text-black/60 flex items-center gap-2">
                    <span>
                      Source: {providerMeta(a.provider).name}
                    </span>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                        Item
                      </a>
                    )}
                    {providerMeta(a.provider).termsUrl && (
                      <a
                        href={providerMeta(a.provider).termsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Terms
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* Top nav shortcuts */}
      <div className="fixed top-3 right-3 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            if (!snapshot) return;
            loadExhibition({
              exhibitionTitle: snapshot.title ?? "",
              exhibitionCurator: snapshot.curator ?? "",
              exhibitionNotes: snapshot.notes ?? "",
              artworks: snapshot.items ?? [],
            });
            router.push("/");
          }}
        >
          Home
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            if (!snapshot) return;
            loadExhibition({
              exhibitionTitle: snapshot.title ?? "",
              exhibitionCurator: snapshot.curator ?? "",
              exhibitionNotes: snapshot.notes ?? "",
              artworks: snapshot.items ?? [],
            });
            router.push("/exhibition/create");
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
