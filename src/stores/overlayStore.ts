import { create } from 'zustand';

interface OverlayStore {
  count: number;
  open: () => void;
  close: () => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  count: 0,
  open: () => set((state) => ({ count: state.count + 1 })),
  close: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
}));

export const useOverlayOpen = () => {
  return useOverlayStore((state) => state.count > 0);
};