import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  LineChart, 
  Settings, 
  LogOut,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/insights", label: "Insights", icon: LineChart },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border min-h-[100dvh] sticky top-0">
        <div className="p-6 flex items-center gap-3 text-sidebar-foreground">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Finova</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors text-sm font-medium">
            <Settings className="w-5 h-5" />
            Settings
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 flex items-center justify-around h-16 px-4 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          return (
            <Link key={item.href} href={item.href}>
              <div
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
