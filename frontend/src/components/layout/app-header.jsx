import { LogOut, Moon, Settings, Sun, UserCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth";
import { useThemeStore } from "@/stores/theme.store";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="flex items-center gap-3">
        <MobileSidebar />

        <div>
          <h1 className="text-sm font-semibold sm:text-base">
            Admin Console
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage access, identities, and audit trails.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar size="sm">
                <AvatarFallback>
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                {user?.name || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="space-y-1">
                <p className="truncate text-sm font-medium">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled>
              <UserCircle className="size-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="size-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}