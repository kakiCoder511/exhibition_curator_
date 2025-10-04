"use client";
import ArtworkCard from "@/components/ArtworkCard";
export default function Home() {
  const demoArtwork = {
    provider: "aic",
    id: "1",
    title: "Sleeping Cat",
    artist: "Unknown",
    date: "1890",
    image: "/placeholder.png",
    url: "#",
    category: "painting",
  };

  function handleAdd(art: any) {
    console.log("Added:", art.title);
  }

  return (
    <div className="p-6">
      <ArtworkCard artwork={demoArtwork} onAdd={handleAdd} />
    </div>
  );
}
