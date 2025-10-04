"use client";
import type { ArtworkSummary } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MiniExhibitionCartProps = {
  items: ArtworkSummary[];
  onRemove: (artwork: ArtworkSummary) => void;
  onClear: () => void;
};

export default function MiniExhibitionCart({ items, onRemove, onClear }: MiniExhibitionCartProps) {
  const hasItems = items.length > 0;

  return (
    <Card aria-live="polite">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold">
          Mini Exhibition
          {hasItems ? ` (${items.length})` : ""}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={!hasItems}>
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasItems ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={`${item.provider}:${item.id}`} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title ?? "Untitled"}</p>
                  <p className="truncate text-xs text-gray-500">
                    {item.artist ?? "Unknown Artist"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item)}
                  aria-label={`Remove ${item.title ?? item.id} from mini exhibition`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No artworks added yet. Start curating by selecting pieces you love.</p>
        )}
      </CardContent>
      {hasItems && (
        <CardFooter className="text-xs text-gray-500">
          {items.length} artwork{items.length > 1 ? "s" : ""} ready for your mini exhibition.
        </CardFooter>
      )}
    </Card>
  );
}
