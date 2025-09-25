"use client"

import { useState, useEffect, useCallback } from "react"
import type { Notification, EnhancedIssue, Team, TeamMember } from "@/types"

interface UseNotificationsProps {
  issues: EnhancedIssue[]
  teams: Team[]
  teamMembers: TeamMember[]
  initialNotifications?: Notification[]
}

export function useNotifications({ issues, teams, teamMembers, initialNotifications = [] }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  // Generate smart notifications based on current state
  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = []

    // Blocker alerts
    const blockedIssues = issues.filter((issue) => issue.blockedReason)
    blockedIssues.forEach((issue) => {
      const existingBlockerNotif = notifications.find((n) => n.type === "blocker" && n.relatedEntityId === issue.id)

      if (!existingBlockerNotif) {
        newNotifications.push({
          id: `blocker-${issue.id}-${Date.now()}`,
          type: "blocker",
          title: "Task Blocked",
          message: `${issue.title} is blocked: ${issue.blockedReason}`,
          status: "unread",
          recipientIds: [issue.assignee],
          relatedEntityId: issue.id,
          relatedEntityType: "issue",
          createdAt: new Date(),
        })
      }
    })

    // Capacity warnings
    teams.forEach((team) => {
      const teamMemberList = teamMembers.filter((member) => team.memberIds.includes(member.id))
      const totalCapacity = teamMemberList.reduce((sum, member) => sum + member.capacity, 0)
      const totalWorkload = teamMemberList.reduce((sum, member) => sum + member.currentWorkload, 0)
      const utilizationRate = totalCapacity > 0 ? totalWorkload / totalCapacity : 0

      if (utilizationRate > 0.9) {
        const existingCapacityNotif = notifications.find((n) => n.type === "capacity" && n.relatedEntityId === team.id)

        if (!existingCapacityNotif) {
          newNotifications.push({
            id: `capacity-${team.id}-${Date.now()}`,
            type: "capacity",
            title: "Team Over Capacity",
            message: `${team.name} is at ${Math.round(utilizationRate * 100)}% capacity`,
            status: "unread",
            recipientIds: [team.leadId],
            relatedEntityId: team.id,
            relatedEntityType: "team",
            createdAt: new Date(),
          })
        }
      }
    })

    // Cross-team dependency notifications
    const crossTeamIssues = issues.filter((issue) => issue.dependencies && issue.dependencies.length > 0)

    crossTeamIssues.forEach((issue) => {
      const dependentIssues = issues.filter((i) => issue.dependencies?.includes(i.id) && i.teamId !== issue.teamId)

      if (dependentIssues.length > 0) {
        const existingCrossTeamNotif = notifications.find(
          (n) => n.type === "cross_team" && n.relatedEntityId === issue.id,
        )

        if (!existingCrossTeamNotif) {
          newNotifications.push({
            id: `cross-team-${issue.id}-${Date.now()}`,
            type: "cross_team",
            title: "Cross-Team Dependency",
            message: `${issue.title} depends on tasks from other teams`,
            status: "unread",
            recipientIds: [issue.assignee],
            relatedEntityId: issue.id,
            relatedEntityType: "issue",
            createdAt: new Date(),
          })
        }
      }
    })

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev])
    }
  }, [issues, teams, teamMembers, notifications])

  // Check for new notifications periodically
  useEffect(() => {
    const interval = setInterval(generateNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [generateNotifications])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, status: "read" as const, readAt: new Date() }
          : notification,
      ),
    )
  }, [])

  const markAsUnread = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, status: "unread" as const, readAt: undefined }
          : notification,
      ),
    )
  }, [])

  const dismiss = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        status: "read" as const,
        readAt: new Date(),
      })),
    )
  }, [])

  return {
    notifications,
    markAsRead,
    markAsUnread,
    dismiss,
    markAllAsRead,
    generateNotifications,
  }
}
