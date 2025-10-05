"use client";
import type { ArtworkSummary } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArtworkCard({
  artwork,
  onAdd,
}: {
  artwork: ArtworkSummary;
  onAdd: (a: ArtworkSummary) => void;
}) {
  return (
    <Card className="flex flex-col">
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={artwork.image ?? "/placeholder.png"}
          alt={artwork.title ?? "Untitled"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">
          {artwork.title ?? "Untitled"}
        </h3>
        <p className="text-xs text-gray-600">
          {artwork.artist ?? "Unknown Artist"}
        </p>
        <p className="text-xs text-gray-500">{artwork.date}</p>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onAdd(artwork)}>
            Add
          </Button>
          {artwork.url && (
            <a
              href={artwork.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline self-center"
            >
              Details
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
