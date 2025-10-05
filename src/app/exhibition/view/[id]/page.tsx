"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ArtworkSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAICDetail } from "@/lib/aic";
import { sanitizeHtml } from "@/lib/sanitize";
import { useExhibitionStore } from "@/store/exhibition";

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
  const { setAll } = useExhibitionStore();

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
  useEffect(() => {
    const first = snapshot?.items?.[0];
    if (!first) return;
    void ensureDescription(first);
  }, [snapshot]);

  const heroImage = useMemo(() => snapshot?.items?.[0]?.image, [snapshot]);

  async function ensureDescription(a: ArtworkSummary) {
    const key = `${a.provider}:${a.id}`;
    if (descMap[key] !== undefined) return;
    try {
      if (a.provider === "aic") {
        const d = await getAICDetail(a.id);
        setDescMap((m) => ({ ...m, [key]: d.description }));
      } else {
        setDescMap((m) => ({ ...m, [key]: undefined }));
      }
    } catch {
      setDescMap((m) => ({ ...m, [key]: undefined }));
    }
  }

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section with first artwork as background */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={snapshot.title}
            className="absolute inset-0 w-full h-full object-cover"
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

      {/* Fullscreen slides for artworks */}
      <main className="snap-y snap-mandatory h-[calc(100vh-0px)] overflow-y-auto">
        {snapshot.items.map((a, idx) => {
          const key = `${a.provider}:${a.id}`;
          const isOpen = openIdx === idx;
          const desc = descMap[key];
          return (
            <section key={key} className="w-full snap-start">
              {/* Image area: consistent spacing, no crop */}
              <div className="relative w-full bg-black flex items-center justify-center py-2 md:py-4 min-h-[60vh] md:min-h-[70vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image ?? "/placeholder.png"}
                  alt={a.title ?? "Artwork"}
                  className="max-h-[70vh] md:max-h-[80vh] w-auto max-w-full object-contain"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.png")}
                />
              </div>

              {/* Separate info card below the artwork (not overlayed) */}
              <div className="pt-2 pb-4 px-2 md:px-6 bg-black">
                <div className="mx-auto max-w-4xl bg-white text-black rounded-lg p-3 md:p-4 shadow border border-black/10">
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
            setAll({
              title: snapshot.title,
              curator: snapshot.curator,
              notes: snapshot.notes,
              items: snapshot.items,
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
            setAll({
              title: snapshot.title,
              curator: snapshot.curator,
              notes: snapshot.notes,
              items: snapshot.items,
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
