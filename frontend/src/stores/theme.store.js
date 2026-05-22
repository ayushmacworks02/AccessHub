import { create } from "zustand";

const THEME_STORAGE_KEY = "nxauth-theme";

const getStoredTheme = () => {
  return localStorage.getItem(THEME_STORAGE_KEY) || "system";
};

const applyTheme = (theme) => {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.add(systemTheme);
    return;
  }

  root.classList.add(theme);
};

export const useThemeStore = create((set, get) => ({
  theme: getStoredTheme(),

  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);

    set({
      theme,
    });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);

    set({
      theme: nextTheme,
    });
  },

  initializeTheme: () => {
    const theme = getStoredTheme();
    applyTheme(theme);

    set({
      theme,
    });
  },
}));