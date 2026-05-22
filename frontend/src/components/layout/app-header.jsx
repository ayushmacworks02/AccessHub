import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useThemeStore } from "@/stores/theme.store";

export function AppHeader() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="size-9 rounded-xl border" />

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            Admin Console
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            Manage access, identities, and audit trails.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </header>
  );
}