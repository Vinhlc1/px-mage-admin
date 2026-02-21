"use client";

import { getCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SkipToMain } from "@/components/skip-to-main";

type AuthenticatedLayoutProps = {
  children?: React.ReactNode;
};

/**
 * Wraps all authenticated pages with the providers they need:
 * - SearchProvider  — Cmd+K search dialog state
 * - LayoutProvider  — sidebar variant/collapsible persisted to cookie
 * - SidebarProvider — shadcn sidebar open/closed state
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie("sidebar_state") !== "false";
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Content container — enables container queries
              "@container/content",
              // Fixed layout: constrain height to viewport
              "has-data-[layout=fixed]:h-svh",
              // Fixed + inset: subtract sidebar margins
              "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]"
            )}
          >
            {children}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  );
}
