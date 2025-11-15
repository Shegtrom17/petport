// Global window typings for app-wide flags
declare global {
  interface Window {
    __recentUpdate?: boolean;
    prerenderReady?: boolean;
  }
}

export {};
