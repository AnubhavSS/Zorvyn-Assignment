import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Shell Component
 * 
 * The root layout wrapper for the application.
 * Responsibilities:
 * - Provides the overall flex container for the Sidebar and Main Content area.
 * - Handles the scrolling behavior and responsive layout constraints.
 * - Ensures the Header is consistently positioned above page content.
 * 
 * @param children - The page content to be rendered within the main layout area.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground overflow-hidden">
      {/* Navigation Sidebar (fixed on desktop, usually hidden/collapsible on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto pb-16 md:pb-0">
        {/* Top Header/Action Bar */}
        <Header />
        
        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

