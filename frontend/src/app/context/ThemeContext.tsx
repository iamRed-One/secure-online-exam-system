"use client";
import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void; };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.backgroundColor = "#101828";
    document.body.style.backgroundColor = "#101828";
    document.body.style.color = "#f9fafb";
  } else {
    root.classList.remove("dark");
    root.style.backgroundColor = "#f9fafb";
    document.body.style.backgroundColor = "#f9fafb";
    document.body.style.color = "#101828";
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // On mount: always start light, clear any saved preference
  useEffect(() => {
    localStorage.removeItem("theme");
    applyTheme("light");
  }, []);

  // On toggle: apply immediately
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () => setTheme(p => p === "light" ? "dark" : "light"),
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
