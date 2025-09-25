"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ViewType } from "@/types"

interface HeaderBarProps {
  currentView: ViewType
  isExpanded: boolean
  onToggleExpanded: () => void
}

const viewLabels: Record<ViewType, string> = {
  issues: "Issues",
  "current-sprint": "Current Sprint",
  sprints: "Sprints",
  management: "Management Dashboard",
  people: "People & Capacity",
  dependencies: "Dependencies",
  analytics: "Analytics",
}

export function HeaderBar({ currentView, isExpanded, onToggleExpanded }: HeaderBarProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onToggleExpanded} className="p-2">
          {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <h2 className="text-2xl font-bold text-foreground">{viewLabels[currentView]}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
