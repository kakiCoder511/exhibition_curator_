import ArtworkCard from "@/components/ArtworkCard";
import type { ArtworkSummary } from "@/lib/types";

export default function ResultGrid({
  artworks,
  onAdd,
  loading,
  error,
}: {
  artworks: ArtworkSummary[];
  onAdd: (a: ArtworkSummary) => void;
  loading?: boolean;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-gray-200 aspect-[4/3]" />
        ))}
      </div>
    );
  }
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (artworks.length === 0) return <p className="text-center text-gray-400 mt-6">No artworks found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {artworks.map((art) => (
        <ArtworkCard key={`${art.provider}:${art.id}`} artwork={art} onAdd={onAdd} />
      ))}
    </div>
  );
}
