"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { HeaderBar } from "@/components/header-bar"
import { CurrentSprintView } from "@/components/current-sprint-view"
import { SprintsView } from "@/components/sprints-view"
import { ManagementDashboard } from "@/components/management-dashboard"
import { EnhancedIssuesList } from "@/components/enhanced-issues-list"
import { PeopleCapacityView } from "@/components/people-capacity-view"
import { DependenciesView } from "@/components/dependencies-view"
import AdvancedAnalytics from "@/components/advanced-analytics"
import { useNotifications } from "@/hooks/use-notifications"
import {
  initialIssues,
  initialSprints,
  generateTaskId,
  initialTeams,
  initialTeamMembers,
  enhancedInitialIssues,
  initialNotifications,
} from "@/lib/data"
import type { Issue, Sprint, ViewType, IssueStatus, Team, TeamMember, EnhancedIssue } from "@/types"

export default function TaskFlowApp() {
  const [currentView, setCurrentView] = useState<ViewType>("issues")
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints)
  const [teams] = useState<Team[]>(initialTeams)
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [enhancedIssues, setEnhancedIssues] = useState<EnhancedIssue[]>(enhancedInitialIssues)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const { notifications, markAsRead, markAsUnread, dismiss, markAllAsRead } = useNotifications({
    issues: enhancedIssues,
    teams,
    teamMembers,
    initialNotifications,
  })

  const handleCreateIssue = (issueData: Partial<Issue>) => {
    const newIssue: Issue = {
      id: generateTaskId(issues),
      title: issueData.title || "",
      description: issueData.description || "",
      priority: issueData.priority || "P3",
      status: issueData.status || "Todo",
      assignee: issueData.assignee || "",
      sprintId: issueData.sprintId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setIssues([...issues, newIssue])
  }

  const handleCreateEnhancedIssue = (issueData: Partial<EnhancedIssue>) => {
    const newIssue: EnhancedIssue = {
      id: generateTaskId(enhancedIssues),
      title: issueData.title || "",
      description: issueData.description || "",
      priority: issueData.priority || "P3",
      status: issueData.status || "Todo",
      assignee: issueData.assignee || "",
      sprintId: issueData.sprintId,
      businessImpact: issueData.businessImpact || "Medium",
      stakeholders: issueData.stakeholders || [],
      dependencies: issueData.dependencies || [],
      estimatedHours: issueData.estimatedHours,
      teamId: issueData.teamId,
      tags: issueData.tags || [],
      blockedReason: issueData.blockedReason,
      blockedAt: issueData.blockedReason ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEnhancedIssues([...enhancedIssues, newIssue])
  }

  const handleEditEnhancedIssue = (updatedIssue: EnhancedIssue) => {
    setEnhancedIssues(
      enhancedIssues.map((issue) =>
        issue.id === updatedIssue.id
          ? {
              ...issue,
              ...updatedIssue,
              blockedAt:
                updatedIssue.blockedReason && !issue.blockedReason
                  ? new Date()
                  : !updatedIssue.blockedReason
                    ? undefined
                    : issue.blockedAt,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleDeleteEnhancedIssue = (issueId: string) => {
    setEnhancedIssues(enhancedIssues.filter((issue) => issue.id !== issueId))
  }

  const handleEditIssue = (updatedIssue: Issue) => {
    setIssues(
      issues.map((issue) =>
        issue.id === updatedIssue.id
          ? {
              ...issue,
              ...updatedIssue,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleDeleteIssue = (issueId: string) => {
    setIssues(issues.filter((issue) => issue.id !== issueId))
  }

  const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleAssignToSprint = (issueId: string, sprintId: string | undefined) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              sprintId,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleCreateSprint = (sprintData: Partial<Sprint>) => {
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: sprintData.name || "",
      status: "Planned",
      startDate: sprintData.startDate || new Date(),
      endDate: sprintData.endDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSprints([...sprints, newSprint])
  }

  const handleEditSprint = (updatedSprint: Sprint) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === updatedSprint.id
          ? {
              ...sprint,
              ...updatedSprint,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleStartSprint = (sprintId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Active" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleEndSprint = (sprintId: string) => {
    const unfinishedIssues = issues.filter((issue) => issue.sprintId === sprintId && issue.status !== "Done")

    setIssues(
      issues.map((issue) =>
        unfinishedIssues.some((ui) => ui.id === issue.id)
          ? {
              ...issue,
              sprintId: undefined,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )

    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Completed" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const renderCurrentView = () => {
    switch (currentView) {
      case "issues":
        return (
          <EnhancedIssuesList
            issues={enhancedIssues}
            sprints={sprints}
            teams={teams}
            teamMembers={teamMembers}
            onCreateIssue={handleCreateEnhancedIssue}
            onEditIssue={handleEditEnhancedIssue}
            onDeleteIssue={handleDeleteEnhancedIssue}
          />
        )
      case "current-sprint":
        return (
          <CurrentSprintView
            sprint={activeSprint || null}
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
          />
        )
      case "sprints":
        return (
          <SprintsView
            sprints={sprints}
            issues={issues}
            onCreateSprint={handleCreateSprint}
            onEditSprint={handleEditSprint}
            onStartSprint={handleStartSprint}
            onEndSprint={handleEndSprint}
          />
        )
      case "management":
        return <ManagementDashboard teams={teams} teamMembers={teamMembers} issues={enhancedIssues} sprints={sprints} />
      case "people":
        return <PeopleCapacityView teamMembers={teamMembers} teams={teams} issues={enhancedIssues} sprints={sprints} />
      case "dependencies":
        return <DependenciesView issues={enhancedIssues} teams={teams} teamMembers={teamMembers} sprints={sprints} />
      case "analytics":
        return <AdvancedAnalytics />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        issues={issues}
        sprints={sprints}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onDismiss={dismiss}
        onMarkAllAsRead={markAllAsRead}
        isExpanded={isSidebarExpanded}
        onToggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      <div className={`transition-all duration-300 ${isSidebarExpanded ? "ml-60" : "ml-16"}`}>
        <div className="p-4 min-h-screen">
          <main className="bg-background rounded-xl shadow-lg border border-border h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <HeaderBar
              currentView={currentView}
              isExpanded={isSidebarExpanded}
              onToggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onDismiss={dismiss}
              onMarkAllAsRead={markAllAsRead}
            />

            <div className="flex-1 overflow-auto p-6">{renderCurrentView()}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
