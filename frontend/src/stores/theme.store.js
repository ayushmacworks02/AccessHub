import { create } from "zustand";

const THEME_STORAGE_KEY = "accesshub-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "system";
  }

  return localStorage.getItem(THEME_STORAGE_KEY) || "system";
};

const applyThemeToDocument = (theme) => {
  if (typeof window === "undefined") {
    return;
  }

  const root = window.document.documentElement;
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const shouldUseDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  root.classList.toggle("dark", shouldUseDark);
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyThemeToDocument(nextTheme);
    set({ theme: nextTheme });
  },

  initializeTheme: () => {
    const theme = getInitialTheme();
    applyThemeToDocument(theme);
    set({ theme });
  },
}));

export const initializeThemeOnLoad = () => {
  const theme = getInitialTheme();
  applyThemeToDocument(theme);
};