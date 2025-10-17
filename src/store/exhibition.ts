import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArtworkSummary } from "@/lib/types";

type ExhibitionState = {
  exhibitionTitle: string;
  exhibitionCurator: string;
  exhibitionNotes: string;
  artworks: ArtworkSummary[];

  // actions
  loadExhibition: (data: {
    exhibitionTitle: string;
    exhibitionCurator: string;
    exhibitionNotes: string;
    artworks: ArtworkSummary[];
  }) => void;
  setTitle: (title: string) => void;
  setCurator: (curator: string) => void;
  setNotes: (notes: string) => void;

  addArtwork: (artwork: ArtworkSummary) => void;
  removeArtwork: (id: string) => void;
  moveArtwork: (id: string, direction: "up" | "down") => void;
  sortArtworks: (
    by: "title" | "artist" | "date",
    direction: "asc" | "desc"
  ) => void;
  resetExhibition: () => void;
};

export const useExhibitionStore = create<ExhibitionState>()(
  persist(
    (set, get) => ({
      exhibitionTitle: "",
      exhibitionCurator: "",
      exhibitionNotes: "",
      artworks: [],

      loadExhibition: ({ exhibitionTitle, exhibitionCurator, exhibitionNotes, artworks }) =>
        set({ exhibitionTitle, exhibitionCurator, exhibitionNotes, artworks }),

      setTitle: (title) => set({ exhibitionTitle: title }),
      setCurator: (curator) => set({ exhibitionCurator: curator }),
      setNotes: (notes) => set({ exhibitionNotes: notes }),

      addArtwork: (artwork) => {
        const exists = get().artworks.some(
          (x) => x.id === artwork.id && x.provider === artwork.provider
        );
        if (!exists) set({ artworks: [artwork, ...get().artworks] });
      },

      removeArtwork: (id) => set({
        artworks: get().artworks.filter((x) => x.id !== id),
      }),

      moveArtwork: (id, direction) => {
        const artworks = [...get().artworks];
        const index = artworks.findIndex((x) => x.id === id);
        if (index === -1) return;
        if (direction === "up" && index > 0) {
          [artworks[index - 1], artworks[index]] = [artworks[index], artworks[index - 1]];
        } else if (direction === "down" && index < artworks.length - 1) {
          [artworks[index + 1], artworks[index]] = [artworks[index], artworks[index + 1]];
        }
        set({ artworks });
      },

      sortArtworks: (by, direction) => {
        const artworks = [...get().artworks];
        const dir = direction === "asc" ? 1 : -1;
        artworks.sort((a, b) => {
          const va = (a[by] ?? "").toString().toLowerCase();
          const vb = (b[by] ?? "").toString().toLowerCase();
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });
        set({ artworks });
      },

      resetExhibition: () =>
        set({
          exhibitionTitle: "",
          exhibitionCurator: "",
          exhibitionNotes: "",
          artworks: [],
        }),
    }),
    { name: "exhibition-store" }
  )
);
