"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcutsProps {
  sidebarItems?: { href: string }[];
  onToggleSidebar?: () => void;
}

export function KeyboardShortcuts({ sidebarItems = [], onToggleSidebar }: KeyboardShortcutsProps) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // Ctrl+K : focus search bar
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input], input[type="search"], input[placeholder*="cherch"], input[placeholder*="Cherch"], input[placeholder*="taper"], input[placeholder*="Taper"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // "/" : focus search bar (only when not in an input)
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input], input[type="search"], input[placeholder*="cherch"], input[placeholder*="Cherch"], input[placeholder*="taper"], input[placeholder*="Taper"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Escape : close modals/menus, blur active input
      if (e.key === "Escape") {
        // Blur the current active element if it's an input
        if (isInput) {
          (target as HTMLElement).blur();
          return;
        }
        // Try to close any open overlay/modal by clicking overlay backdrop
        const overlay = document.querySelector<HTMLElement>(
          '[data-sidebar-overlay], .fixed.inset-0'
        );
        if (overlay) {
          overlay.click();
        }
        return;
      }

      // Alt+S : toggle sidebar on mobile
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        if (onToggleSidebar) {
          onToggleSidebar();
        } else {
          const hamburger = document.querySelector<HTMLButtonElement>(
            '[data-sidebar-toggle]'
          );
          if (hamburger) {
            hamburger.click();
          }
        }
        return;
      }

      // Alt+1 to Alt+5 : quick nav to sidebar sections
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 5 && sidebarItems.length > 0) {
          const index = num - 1;
          if (index < sidebarItems.length) {
            e.preventDefault();
            router.push(sidebarItems[index].href);
          }
        }
      }
    },
    [sidebarItems, onToggleSidebar, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
