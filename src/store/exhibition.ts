import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArtworkSummary } from "@/lib/types";

type ExhibitionState = {
  title: string;
  curator: string;
  notes: string;
  items: ArtworkSummary[];
  setTitle: (v: string) => void;
  setCurator: (v: string) => void;
  setNotes: (v: string) => void;
  addItem: (a: ArtworkSummary) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  moveItem: (id: string, direction: "up" | "down") => void;
  sortItems: (
    by: "title" | "artist" | "date",
    direction: "asc" | "desc"
  ) => void;
};

export const useExhibitionStore = create<ExhibitionState>()(
  persist(
    (set, get) => ({
      title: "",
      curator: "",
      notes: "",
      items: [],
      setTitle: (v) => set({ title: v }),
      setCurator: (v) => set({ curator: v }),
      setNotes: (v) => set({ notes: v }),
      addItem: (a) => {
        const exists = get().items.some(x => x.id === a.id && x.provider === a.provider);
        if (!exists) set({ items: [a, ...get().items] });
      },
      removeItem: (id) => set({ items: get().items.filter(x => x.id !== id) }),
      moveItem: (id, direction) => {
        const items = [...get().items];
        const index = items.findIndex(x => x.id === id);
        if (index === -1) return;
        if (direction === "up" && index > 0) {
          const tmp = items[index - 1];
          items[index - 1] = items[index];
          items[index] = tmp;
        } else if (direction === "down" && index < items.length - 1) {
          const tmp = items[index + 1];
          items[index + 1] = items[index];
          items[index] = tmp;
        }
        set({ items });
      },
      sortItems: (by, direction) => {
        const items = [...get().items];
        const dir = direction === "asc" ? 1 : -1;
        items.sort((a, b) => {
          const va = (a[by] ?? "").toString().toLowerCase();
          const vb = (b[by] ?? "").toString().toLowerCase();
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });
        set({ items });
      },
      clear: () => set({ title: "", curator: "", notes: "", items: [] }),
    }),
    { name: "exhibition-store" }
  )
);
