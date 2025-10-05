"use client";
import type { ArtworkSummary } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MiniExhibitionCartProps = {
  items: ArtworkSummary[];
  onRemove: (artwork: ArtworkSummary) => void;
  onClear: () => void;
};

export default function MiniExhibitionCart({
  items,
  onRemove,
  onClear,
}: MiniExhibitionCartProps) {
  const hasItems = items.length > 0;

  return (
    //* Card  */
    // * Card header */
    <Card aria-live="polite">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold">
  Mini Exhibition
  {hasItems && (
    <span className="ml-1 text-gray-600">
      ({items.length} {items.length === 1 ? "Artwork" : "Artworks"} added)
    </span>
  )}
</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!hasItems}
        >
          Clear
        </Button>
      </CardHeader>

      {/* Card Content - Artworks List  */}

      <CardContent className="space-y-4">
        {hasItems ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${item.provider}:${item.id}`}
                className="flex items-center justify-between gap-3 text-sm border-b pb-2"
              >
                {/* ✅ Thumbnail */}
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={item.image ?? "/placeholder.png"}
                    alt={item.title ?? "Artwork thumbnail"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* ✅ Artwork Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">
                    {item.title ?? "Untitled"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {item.artist ?? "Unknown Artist"}
                  </p>
                </div>

                {/* ✅ Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item)}
                  aria-label={`Remove ${item.title ?? item.id} from mini exhibition`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No artworks added yet. Start curating by selecting pieces you love.
          </p>
        )}
      </CardContent>

      {hasItems && (
        <CardFooter className="text-xs text-gray-500">
          {items.length} artwork{items.length > 1 ? "s" : ""} ready for your
          mini exhibition.
        </CardFooter>
      )}
    </Card>
  );
}
