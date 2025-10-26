"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarOpenIcon, SidebarCloseIcon } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import type { ViewType, Notification } from "@/types"

interface HeaderBarProps {
  currentView: ViewType
  isExpanded: boolean
  onToggleExpanded: () => void
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAsUnread: (notificationId: string) => void
  onDismiss: (notificationId: string) => void
  onMarkAllAsRead: () => void
}

const viewLabels: Record<ViewType, string> = {
  issues: "Backlog",
  "current-sprint": "Current Sprint",
  sprints: "Sprints",
  management: "Management Dashboard",
  "team-capacity": "Team Capacity Dashboard", // Updated title to "Team Capacity Dashboard"
  dependencies: "Dependencies",
  analytics: "Portfolio Overview",
  reports: "Reports",
}

export function HeaderBar({
  currentView,
  isExpanded,
  onToggleExpanded,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDismiss,
  onMarkAllAsRead,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between w-auto px-2 h-10">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onToggleExpanded} className="p-2">
          {isExpanded ? <SidebarCloseIcon className="h-4 w-4" /> : <SidebarOpenIcon className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <h2 className="text-lg font-semibold text-foreground">{viewLabels[currentView]}</h2>
      </div>

      <div className="flex items-center px-0 space-x-6">
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAsUnread={onMarkAsUnread}
          onDismiss={onDismiss}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      </div>
    </header>
  )
}
