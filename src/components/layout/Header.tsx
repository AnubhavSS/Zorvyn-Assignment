import React from "react";
import { useStore } from "@/lib/store";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Header Component
 * 
 * The top navigation bar of the application.
 * Features:
 * - Theme toggling (Light/Dark mode).
 * - User profile menu with role switching capabilities.
 * - Displays current user status and email.
 */
export function Header() {
  // Access global store for role and theme management
  const { role, setRole, theme, setTheme } = useStore();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Spacer to push controls to the right */}
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Theme Toggle Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="theme-toggle">
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              data-testid="theme-light"
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              data-testid="theme-dark"
            >
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile and Role Management Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              data-testid="user-menu-trigger"
            >
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {role === "admin" ? "AD" : "VW"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {role === "admin" ? "Admin User" : "Viewer"}
                </p>
                <p className="text-xs text-muted-foreground leading-none">
                  {role === "admin" ? "admin@finova.app" : "viewer@finova.app"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Role Switching Section */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium px-2">
                Switch Role
              </p>
              <div className="flex flex-col gap-1">
                <Button
                  variant={role === "admin" ? "secondary" : "ghost"}
                  className="justify-start h-8 text-xs"
                  onClick={() => setRole("admin")}
                  data-testid="role-switch-admin"
                >
                  Admin (Full Access)
                  {role === "admin" && (
                    <Badge
                      variant="default"
                      className="ml-auto text-[10px] h-4"
                    >
                      Active
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={role === "viewer" ? "secondary" : "ghost"}
                  className="justify-start h-8 text-xs"
                  onClick={() => setRole("viewer")}
                  data-testid="role-switch-viewer"
                >
                  Viewer (Read Only)
                  {role === "viewer" && (
                    <Badge
                      variant="default"
                      className="ml-auto text-[10px] h-4"
                    >
                      Active
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

