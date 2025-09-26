"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { List, Kanban, Calendar, BarChart3, Users, GitBranch, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewType, Issue, Sprint, Notification } from "@/types"
import Image from "next/image"

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
  isMobile?: boolean
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
  isMobile = false,
}: NavigationProps) {
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")
  const activeSprintIssues = issues.filter((issue) => issue.sprintId === activeSprint?.id)

  const navItems = [
    {
      id: "issues" as ViewType,
      label: "Backlog",
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

  return (
    <TooltipProvider>
      <nav
        className={cn(
          "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out bg-muted border-sidebar-border border-r-0",
          isMobile ? (isExpanded ? "w-64 translate-x-0" : "w-64 -translate-x-full") : isExpanded ? "w-64" : "w-16",
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "flex items-center h-[72px] px-4 text-left justify-start mx-0",
              isMobile || isExpanded ? "w-full" : "w-16",
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8">
                <Image src="/images/flowcraft-logo.png" alt="FlowCraft" width={32} height={32} className="rounded-lg" />
              </div>
              {(isMobile || isExpanded) && (
                <h1 className="text-lg font-semibold whitespace-nowrap text-sidebar-foreground">FlowCraft</h1>
              )}
            </div>
          </div>

          <div className="flex-1 py-4">
            <div className="space-y-2 text-left px-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                const isDisabled = item.disabled

                const buttonContent = (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!isDisabled) {
                        onViewChange(item.id)
                        if (isMobile) {
                          onToggleExpanded()
                        }
                      }
                    }}
                    disabled={isDisabled}
                    className={cn(
                      "w-full justify-start h-10 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                      isActive && "bg-sidebar-accent text-sidebar-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      !isMobile && !isExpanded && "px-3 justify-center",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {(isMobile || isExpanded) && (
                      <>
                        <span className="ml-3 truncate">{item.label}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.count}
                        </Badge>
                      </>
                    )}
                  </Button>
                )

                if (!isMobile && !isExpanded) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2">
                        <span>{item.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return buttonContent
              })}
            </div>
          </div>

          <div className="p-4 text-left px-4 py-4">
            <div
              className={cn(
                "flex space-x-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer py-0 px-0 text-left items-center",
                !isMobile && !isExpanded && "justify-center",
              )}
            >
              <div className="w-8 bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium flex-shrink-0 text-left rounded-md h-8">
                JD
              </div>
              {(isMobile || isExpanded) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate text-sidebar-foreground">John Doe</span>
                  <span className="text-xs text-sidebar-foreground/70 truncate">john.doe@xyz.com</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  )
}
