import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme.store";

export function ThemeProvider({ children }) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      const storedTheme = localStorage.getItem("accesshub-theme") || "system";

      if (storedTheme === "system") {
        initializeTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [initializeTheme]);

  return children;
}