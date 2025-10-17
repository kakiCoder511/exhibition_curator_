"use client";
import type { ArtworkSummary } from "@/lib/types";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * MiniExhibitionCart
 * A floating summary panel for artworks added to the exhibition.
 * Users can remove, clear, or go to the Create Exhibition page.
 */
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
    // <div
    //   className="fixed bottom-4 right-4 z-50 w-80 max-w-full"
    //   aria-live="polite"
    // >
      <Card className="shadow-lg bg-white dark:bg-zinc-900 border rounded-2xl">
        {/* ---------- Header ---------- */}
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-1">
            My Curation
            {hasItems && (
              <span className="text-gray-600 dark:text-zinc-400 text-sm font-normal">
                ({items.length}{" "}
                {items.length === 1 ? "Artwork" : "Artworks"} added)
              </span>
            )}
          </CardTitle>

          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={!hasItems}
          >
            Clear
          </Button> */}
        </CardHeader>

        {/* ---------- Content ---------- */}
        <CardContent className="max-h-64 overflow-y-auto space-y-3">
          {hasItems ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={`${item.provider}:${item.id}`}
                  className="flex items-center justify-between gap-3 text-sm border-b border-gray-200 dark:border-zinc-700 pb-2"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-zinc-800">
                    <img
                      src={item.image ?? "/placeholder.svg"}
                      alt={item.title ?? "Artwork thumbnail"}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).src =
                          "/placeholder.svg")
                      }
                    />
                  </div>

                  {/* Artwork Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-zinc-100">
                      {item.title ?? "Untitled"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                      {item.artist ?? "Unknown Artist"}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
                    onClick={() => onRemove(item)}
                    aria-label={`Remove ${
                      item.title ?? item.id
                    } from mini exhibition`}
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              No artworks added yet. Start curating by selecting pieces you
              love.
            </p>
          )}
        </CardContent>

        {/* ---------- Footer ---------- */}
        <CardFooter className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
          {hasItems ? (
            <>
              <span>
                {items.length} artwork{items.length > 1 ? "s" : ""} ready
              </span>
              {/* ✅ NEW: Create button linking to Exhibition page */}
              <Link href="/exhibition/create">
                <Button size="sm">Create</Button>
              </Link>
            </>
          ) : (
            <span>Empty cart</span>
          )}
        </CardFooter>
      </Card>
    // </div>
  );
}
