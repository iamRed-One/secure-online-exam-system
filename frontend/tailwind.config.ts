import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          25:  "#f2f7ff",
          50:  "#ecf3ff",
          100: "#dde9ff",
          200: "#c2d6ff",
          300: "#9cb9ff",
          400: "#7592ff",
          500: "#465fff",
          600: "#3641f5",
          700: "#2a31d8",
          800: "#252dae",
          900: "#262e89",
          950: "#161950",
        },
        gray: {
          25:   "#fcfcfd",
          50:   "#f9fafb",
          100:  "#f2f4f7",
          200:  "#e4e7ec",
          300:  "#d0d5dd",
          400:  "#98a2b3",
          500:  "#667085",
          600:  "#475467",
          700:  "#344054",
          800:  "#1d2939",
          900:  "#101828",
          950:  "#0c111d",
          dark: "#1a2231",
        },
        success: {
          50:  "#ecfdf3",
          100: "#d1fadf",
          400: "#32d583",
          500: "#12b76a",
        },
        error: {
          50:  "#fef3f2",
          100: "#fee4e2",
          400: "#f97066",
          500: "#f04438",
          800: "#912018",
        },
        orange: {
          400: "#fd853a",
          500: "#fb6514",
        },
      },
      boxShadow: {
        "theme-xs": "0px 1px 2px 0px rgba(16,24,40,0.05)",
        "theme-sm": "0px 1px 3px 0px rgba(16,24,40,0.1),0px 1px 2px 0px rgba(16,24,40,0.06)",
        "theme-md": "0px 4px 8px -2px rgba(16,24,40,0.1),0px 2px 4px -2px rgba(16,24,40,0.06)",
        "theme-lg": "0px 12px 16px -4px rgba(16,24,40,0.08),0px 4px 6px -2px rgba(16,24,40,0.03)",
        "theme-xl": "0px 20px 24px -4px rgba(16,24,40,0.08),0px 8px 8px -4px rgba(16,24,40,0.03)",
      },
      fontSize: {
        "theme-xs": ["12px", { lineHeight: "18px" }],
        "theme-sm": ["14px", { lineHeight: "20px" }],
        "theme-xl": ["20px", { lineHeight: "30px" }],
      },
      zIndex: {
        "99999": "99999",
      },
    },
  },
  plugins: [],
};
export default config;
