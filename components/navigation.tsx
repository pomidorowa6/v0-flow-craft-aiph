"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { List, Kanban, Calendar, BarChart3, Users, GitBranch, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notification-bell"
import type { ViewType, Issue, Sprint, Notification } from "@/types"

interface NavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  issues: Issue[]
  sprints: Sprint[]
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAsUnread: (notificationId: string) => void
  onDismiss: (notificationId: string) => void
  onMarkAllAsRead: () => void
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function Navigation({
  currentView,
  onViewChange,
  issues,
  sprints,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDismiss,
  onMarkAllAsRead,
  isExpanded,
  onToggleExpanded,
}: NavigationProps) {
  const [isHovered, setIsHovered] = useState(false)
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")
  const activeSprintIssues = issues.filter((issue) => issue.sprintId === activeSprint?.id)

  const navItems = [
    {
      id: "issues" as ViewType,
      label: "Issues",
      icon: List,
      count: issues.length,
    },
    {
      id: "current-sprint" as ViewType,
      label: "Current Sprint",
      icon: Kanban,
      count: activeSprintIssues.length,
      disabled: !activeSprint,
    },
    {
      id: "sprints" as ViewType,
      label: "Sprints",
      icon: Calendar,
      count: sprints.length,
    },
    {
      id: "management" as ViewType,
      label: "Management",
      icon: BarChart3,
      count: 3,
    },
    {
      id: "people" as ViewType,
      label: "People",
      icon: Users,
      count: 5,
    },
    {
      id: "dependencies" as ViewType,
      label: "Dependencies",
      icon: GitBranch,
      count: 2,
    },
    {
      id: "analytics" as ViewType,
      label: "Analytics",
      icon: TrendingUp,
      count: 4,
    },
  ]

  const shouldShowExpanded = isExpanded || isHovered

  return (
    <>
      {shouldShowExpanded && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onToggleExpanded} />}

      <nav
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-all duration-300 ease-in-out",
          shouldShowExpanded ? "w-60" : "w-16",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <img src="/flowcraft-logo.png" alt="FlowCraft Logo" className="w-8 h-8 flex-shrink-0" />
              {shouldShowExpanded && <h1 className="text-lg font-semibold whitespace-nowrap">FlowCraft</h1>}
            </div>
          </div>

          <div className="flex-1 py-4">
            <div className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                const isDisabled = item.disabled

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => !isDisabled && onViewChange(item.id)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full justify-start h-10 px-3",
                      isActive && "bg-secondary text-secondary-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      !shouldShowExpanded && "px-3 justify-center",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {shouldShowExpanded && (
                      <>
                        <span className="ml-3 truncate">{item.label}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.count}
                        </Badge>
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-border p-2">
            <div className="flex flex-col space-y-2">
              <div className={cn("flex", shouldShowExpanded ? "justify-start" : "justify-center")}>
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAsUnread={onMarkAsUnread}
                  onDismiss={onDismiss}
                  onMarkAllAsRead={onMarkAllAsRead}
                />
              </div>

              <div
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer",
                  !shouldShowExpanded && "justify-center",
                )}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  U
                </div>
                {shouldShowExpanded && <span className="text-sm font-medium truncate">User</span>}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
