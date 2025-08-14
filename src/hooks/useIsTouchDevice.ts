// src/hooks/useIsTouchDevice.ts
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ?? false;
  const maxTouch = (navigator as any).maxTouchPoints && (navigator as any).maxTouchPoints > 0;
  const ontouch = "ontouchstart" in window;
  return Boolean(coarse || maxTouch || ontouch);
}