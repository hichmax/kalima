"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LearnerProgress } from "@/lib/types";
import {
  defaultProgress,
  loadProgress,
  normalizeProgress,
  saveProgress,
} from "@/lib/storage";
import {
  pullProgressFromLocalDatabase,
  pushProgressToLocalDatabase,
} from "@/lib/device";

type Theme = "light" | "dark";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  progress: LearnerProgress;
  updateProgress: (patch: Partial<LearnerProgress>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const serverSyncEnabled =
  process.env.NEXT_PUBLIC_STORAGE_MODE !== "browser";

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [progress, setProgress] = useState<LearnerProgress>(defaultProgress);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      const storedTheme =
        window.localStorage.getItem("kalima:theme") ||
        window.localStorage.getItem("nour:theme");
      const initialTheme =
        storedTheme === "dark" ||
        (!storedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");

      const localProgress = loadProgress();
      setProgress(localProgress);

      if (process.env.NODE_ENV !== "test" && serverSyncEnabled) {
        void pullProgressFromLocalDatabase().then((serverProgress) => {
          if (
            active &&
            serverProgress &&
            new Date(serverProgress.updatedAt).getTime() >
              new Date(localProgress.updatedAt).getTime()
          ) {
            setProgress(saveProgress(normalizeProgress(serverProgress)));
          }
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        window.localStorage.setItem("kalima:theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      },
      progress,
      updateProgress: (patch) => {
        setProgress((current) => {
          const next = saveProgress({ ...current, ...patch });
          if (process.env.NODE_ENV !== "test" && serverSyncEnabled) {
            void pushProgressToLocalDatabase(next);
          }
          return next;
        });
      },
    }),
    [progress, theme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside Providers");
  return context;
}
