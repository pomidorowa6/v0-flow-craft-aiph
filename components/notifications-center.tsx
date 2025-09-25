"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, AlertTriangle, Users, Clock, Mail, X, Check, Filter, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Notification, NotificationType, NotificationStatus } from "@/types"

interface NotificationsCenterProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAsUnread: (notificationId: string) => void
  onDismiss: (notificationId: string) => void
  onMarkAllAsRead: () => void
}

const notificationTypeIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  blocker: AlertTriangle,
  capacity: Users,
  cross_team: Mail,
  weekly_digest: Clock,
}

const notificationTypeColors: Record<NotificationType, string> = {
  blocker: "text-red-500 bg-red-50 border-red-200",
  capacity: "text-yellow-500 bg-yellow-50 border-yellow-200",
  cross_team: "text-blue-500 bg-blue-50 border-blue-200",
  weekly_digest: "text-green-500 bg-green-50 border-green-200",
}

export function NotificationsCenter({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDismiss,
  onMarkAllAsRead,
}: NotificationsCenterProps) {
  const [filter, setFilter] = useState<NotificationStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")

  const filteredNotifications = notifications.filter((notification) => {
    const statusMatch = filter === "all" || notification.status === filter
    const typeMatch = typeFilter === "all" || notification.type === typeFilter
    return statusMatch && typeMatch
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getNotificationIcon = (type: NotificationType) => {
    const IconComponent = notificationTypeIcons[type]
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                {filter === "all" ? "All" : filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>Unread</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("read")}>Read</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {typeFilter === "all" ? "All Types" : typeFilter.replace("_", " ")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("blocker")}>Blockers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("capacity")}>Capacity</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("cross_team")}>Cross-team</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("weekly_digest")}>Weekly Digest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications found</div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                      notification.status === "unread" && "bg-blue-50/50 border-l-2 border-l-blue-500",
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-1.5 rounded-full border", notificationTypeColors[notification.type])}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={cn(
                              "text-sm font-medium truncate",
                              notification.status === "unread" && "font-semibold",
                            )}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1 ml-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {notification.status === "unread" ? (
                                  <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                                    <Check className="h-3 w-3 mr-2" />
                                    Mark as read
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => onMarkAsUnread(notification.id)}>
                                    <Bell className="h-3 w-3 mr-2" />
                                    Mark as unread
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onDismiss(notification.id)} className="text-red-600">
                                  <X className="h-3 w-3 mr-2" />
                                  Dismiss
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace("_", " ")}
                          </Badge>
                          {notification.status === "unread" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
