// src/features/navigation/tabOrder.ts
export const TAB_ORDER = [
  "profile",
  "care",
  "resume",
  "documents",
  "travel",
  "gallery",
  "quickid",
] as const;

export type TabId = typeof TAB_ORDER[number];

export function getPrevNext(tab: TabId) {
  const i = TAB_ORDER.indexOf(tab);
  if (i === -1) return { prev: TAB_ORDER[0], next: TAB_ORDER[0] }; // safety fallback
  return {
    prev: TAB_ORDER[(i - 1 + TAB_ORDER.length) % TAB_ORDER.length],
    next: TAB_ORDER[(i + 1) % TAB_ORDER.length],
  };
}