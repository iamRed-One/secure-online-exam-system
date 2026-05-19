"use client";
import React from "react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {/* Sun icon (light mode) */}
      <svg className="dark:hidden" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5v1.25M10 16.25v1.25M4.4 4.4l.88.88M14.72 14.72l.88.88M2.5 10h1.25M16.25 10h1.25M4.4 15.6l.88-.88M14.72 5.28l.88-.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      {/* Moon icon (dark mode) */}
      <svg className="hidden dark:block" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 10.5a7.5 7.5 0 11-7.5-7.5 5.5 5.5 0 007.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};
