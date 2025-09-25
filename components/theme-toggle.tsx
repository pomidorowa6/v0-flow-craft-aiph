"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Switch thumb with icons */}
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-background border border-border shadow-lg transition-all duration-300 ease-in-out ${
          theme === "dark" ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {/* Sun icon - visible in light mode */}
        <Sun
          className={`absolute inset-0.5 h-4 w-4 text-amber-500 transition-all duration-300 ${
            theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
          }`}
        />
        {/* Moon icon - visible in dark mode */}
        <Moon
          className={`absolute inset-0.5 h-4 w-4 text-slate-400 transition-all duration-300 ${
            theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
          }`}
        />
      </span>

      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
