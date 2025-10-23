import { useCallback, useEffect, useState } from "react";

export type HomeDestination = "app" | "profile";

export interface UserSettings {
  homeDestination: HomeDestination;
  rememberLastTab: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  homeDestination: "app",
  rememberLastTab: false,
};

const storageKey = (userId?: string) =>
  userId ? `pp_user_settings_${userId}` : `pp_user_settings_guest`;

export function useUserSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (e) {
      // Fallback to defaults on parse error
      setSettings(DEFAULT_SETTINGS);
    }
  }, [userId]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(next));
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });
  }, [userId]);

  return { settings, updateSettings } as const;
}
