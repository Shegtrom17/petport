/**
 * Smoothly scrolls an element into view only if it's not already visible.
 * Accounts for sticky headers and ensures the element is positioned comfortably.
 * 
 * @param el - The HTML element to scroll into view
 * @param options - Configuration options
 * @param options.topOffset - Custom top offset (defaults to sticky header height)
 * @param options.margin - Additional margin around the element (default: 8px)
 */
export function smoothScrollIntoViewIfNeeded(
  el: HTMLElement, 
  options?: { topOffset?: number; margin?: number }
) {
  if (!el) return;

  const margin = options?.margin ?? 8;

  // Try to account for sticky app header
  const header = document.querySelector('header.sticky') as HTMLElement | null;
  const headerHeight = options?.topOffset ?? (header?.getBoundingClientRect().height ?? 0);

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Visible window bounds we consider acceptable
  const topVisibleThreshold = headerHeight + margin;
  const bottomVisibleThreshold = viewportHeight - margin;

  const isTopVisible = rect.top >= topVisibleThreshold;
  const isBottomVisible = rect.bottom <= bottomVisibleThreshold;

  // If already fully visible, do nothing
  if (isTopVisible && isBottomVisible) {
    console.log('[SmoothScroll] Element already visible, skipping scroll');
    return;
  }

  // Target Y so the top sits just below the header, with a small margin
  const targetY = Math.max(0, window.scrollY + rect.top - headerHeight - margin);

  console.log('[SmoothScroll] Scrolling element into view', {
    currentScroll: window.scrollY,
    targetScroll: targetY,
    elementTop: rect.top,
    headerHeight,
    margin
  });

  window.scrollTo({
    top: targetY,
    behavior: 'smooth',
  });
}
