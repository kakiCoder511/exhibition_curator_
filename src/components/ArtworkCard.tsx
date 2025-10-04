//ArtworkSummary , used for search result grid
"use client";

import { ArtworkUnified } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ArtworkCard({ artwork, onAdd, }: {
    artwork: ArtworkUnified;
    onAdd: (addedArtwork: ArtworkUnified) => void;
})
  {
  return (
    <Card className="flex flex-col">
      {/* artwork image */}
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={artwork.image ?? "/placeholder.png"}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* artwork info */}
      <CardHeader className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2">
          {artwork.title ?? "Untitled"}
        </h3>
        <p className="text-xs text-gray-600">
          {artwork.artist ?? "Unknown Artist"}
        </p>
        <p className="text-xs text-gray-400">
          {artwork.date ?? ""}
        </p>
      </CardHeader>

      {/* button */}
      <CardContent className="p-3 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onAdd(artwork)}
          aria-label="Add to Exhibition"
        >
          + Add
        </Button>
      </CardContent>
    </Card>
  );
}
