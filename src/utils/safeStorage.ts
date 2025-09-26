// SafeStorage.ts
// Hybrid storage wrapper for Supabase sessions
// Falls back gracefully when localStorage is blocked (iOS Safari/PWA)

class SafeStorage {
  private memoryStore: Record<string, string> = {};

  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return this.memoryStore[key] || null;
    }
  }

  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      this.memoryStore[key] = value;
    }
  }

  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      delete this.memoryStore[key];
    }
  }
}

export const safeStorage = new SafeStorage();