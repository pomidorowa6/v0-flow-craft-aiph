"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { List, Kanban, Calendar, BarChart3, Users, GitBranch, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
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
    <nav
      className={cn(
        "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
        shouldShowExpanded ? "w-60" : "w-16",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center px-4 h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0 w-10 h-10">
              F
            </div>
            {shouldShowExpanded && (
              <h1 className="text-lg font-semibold whitespace-nowrap text-foreground">FlowCraft</h1>
            )}
          </div>
        </div>

        <div className="flex-1 py-4">
          <div className="space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              const isDisabled = item.disabled

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isActive && "bg-accent text-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !shouldShowExpanded && "px-3 justify-center",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {shouldShowExpanded && (
                    <>
                      <span className="ml-3 truncate">{item.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.count}
                      </Badge>
                    </>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="p-4">
          <div
            className={cn(
              "flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer",
              !shouldShowExpanded && "justify-center",
            )}
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
              JD
            </div>
            {shouldShowExpanded && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate text-foreground">John Doe</span>
                <span className="text-xs text-muted-foreground truncate">john.doe@xyz.com</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
