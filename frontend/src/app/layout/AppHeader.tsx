"use client";
import React, { useEffect, useRef } from "react";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
// import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { useSidebar } from "../context/SidebarContext";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-[99999] dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Left side */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Hamburger */}
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 lg:h-11 lg:w-11"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.66a.75.75 0 111.06 1.06L13.06 13l4.72 4.72a.75.75 0 11-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 01-1.06-1.06L10.94 13 6.22 8.34a.75.75 0 010-1.06z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 1a1 1 0 011-1h14a1 1 0 110 2H1a1 1 0 01-1-1zm0 10a1 1 0 011-1h14a1 1 0 110 2H1a1 1 0 01-1-1zM1 5a1 1 0 000 2h8a1 1 0 000-2H1z" fill="currentColor"/>
              </svg>
            )}
          </button>

          {/* Search (desktop only) */}
          <div className="hidden lg:block flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04 9.37a6.33 6.33 0 1112.67 0 6.33 6.33 0 01-12.67 0zM9.37 1.54a7.83 7.83 0 100 15.66 7.83 7.83 0 000-15.66zm5.59 13.32l2.82 2.82a.75.75 0 01-1.06 1.06l-2.82-2.82a.75.75 0 011.06-1.06z" fill="currentColor"/>
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 xl:w-[430px]"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/5 dark:text-gray-400">
                <span>⌘</span><span>K</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-between w-full gap-4 px-5 py-4 lg:justify-end lg:px-0 lg:shadow-none">
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            {/* <NotificationDropdown /> */}
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
