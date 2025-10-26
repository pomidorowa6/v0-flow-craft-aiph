"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EnhancedIssuesList } from "./enhanced-issues-list"
import { SprintsView } from "./sprints-view"
import { EnhancedIssueForm } from "./enhanced-issue-form"
import { SprintForm } from "./sprint-form"
import type { EnhancedIssue, Sprint, Team, TeamMember } from "@/types"

interface BacklogSprintsViewProps {
  issues: EnhancedIssue[]
  sprints: Sprint[]
  teams: Team[]
  teamMembers: TeamMember[]
  onCreateIssue: (issueData: Partial<EnhancedIssue>) => void
  onEditIssue: (issue: EnhancedIssue) => void
  onDeleteIssue: (issueId: string) => void
  onCreateSprint: (sprintData: Partial<Sprint>) => void
  onEditSprint: (sprint: Sprint) => void
  onStartSprint: (sprintId: string) => void
  onEndSprint: (sprintId: string) => void
}

/**
 * BacklogSprintsView - Combined view for managing issues and sprints
 *
 * Connected Components:
 * - Uses EnhancedIssuesList for issues/backlog management
 * - Uses SprintsView for sprint management
 * - Uses @/components/ui/tabs for view switching
 *
 * Features:
 * - Tabbed interface to switch between Issues and Sprints
 * - Unified action buttons in statistics section
 * - Consistent styling across both views
 */
export function BacklogSprintsView({
  issues,
  sprints,
  teams,
  teamMembers,
  onCreateIssue,
  onEditIssue,
  onDeleteIssue,
  onCreateSprint,
  onEditSprint,
  onStartSprint,
  onEndSprint,
}: BacklogSprintsViewProps) {
  const [activeTab, setActiveTab] = useState<"issues" | "sprints">("issues")

  const blockedIssuesCount = issues.filter((issue) => issue.status === "Blocked").length
  const highImpactCount = issues.filter(
    (issue) => issue.businessImpact === "Critical" || issue.businessImpact === "High",
  ).length

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      {/* === STATISTICS OVERVIEW === */}
      {/* Summary cards showing key metrics and action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 py-4 border-b border-none gap-4 flex-shrink-0">
        <div className="text-center my-0">
          <div className="text-2xl font-bold">{issues.length}</div>
          <div className="text-muted-foreground text-sm">Total Issues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{blockedIssuesCount}</div>
          <div className="text-muted-foreground text-sm">Blocked Issues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{highImpactCount}</div>
          <div className="text-muted-foreground text-sm">High Impact</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {issues.filter((issue) => issue.status === "Done").length}
          </div>
          <div className="text-muted-foreground text-sm">Completed</div>
        </div>
        
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "issues" | "sprints")}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex flex-col md:flex-row border-none gap-4 flex-shrink-0">
          <TabsList className="flex-1">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="sprints">Sprints</TabsTrigger>
          </TabsList>
          <div className="flex shrink-0 flex-row gap-2">
            <EnhancedIssueForm
              sprints={sprints}
              teams={teams}
              teamMembers={teamMembers}
              onSubmit={onCreateIssue}
              onCancel={() => {}}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Issue
                </Button>
              }
            />
            <SprintForm
              sprints={sprints}
              onSubmit={onCreateSprint}
              trigger={
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Sprint
                </Button>
              }
            />
          </div>
        </div>
        <TabsContent value="issues" className="flex-1 min-h-0 mt-4">
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 border border-border rounded-lg relative overflow-hidden">
              <EnhancedIssuesList
                issues={issues}
                sprints={sprints}
                teams={teams}
                teamMembers={teamMembers}
                onCreateIssue={onCreateIssue}
                onEditIssue={onEditIssue}
                onDeleteIssue={onDeleteIssue}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="flex-1 min-h-0 mt-4">
          <SprintsView
            sprints={sprints}
            issues={issues}
            onCreateSprint={onCreateSprint}
            onEditSprint={onEditSprint}
            onStartSprint={onStartSprint}
            onEndSprint={onEndSprint}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
