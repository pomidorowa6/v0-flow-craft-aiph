"use client"

import { Button } from "@/components/ui/button"
import { SprintCard } from "./sprint-card"
import { SprintForm } from "./sprint-form"
import { Plus } from "lucide-react"
import type { Sprint, Issue } from "@/types"

interface SprintsViewProps {
  sprints: Sprint[]
  issues: Issue[]
  onCreateSprint: (sprintData: Partial<Sprint>) => void
  onEditSprint: (sprint: Sprint) => void
  onStartSprint: (sprintId: string) => void
  onEndSprint: (sprintId: string) => void
}

export function SprintsView({
  sprints,
  issues,
  onCreateSprint,
  onEditSprint,
  onStartSprint,
  onEndSprint,
}: SprintsViewProps) {
  const hasActiveSprint = sprints.some((sprint) => sprint.status === "Active")

  // Sort sprints: Active first, then Planned, then Completed
  const sortedSprints = [...sprints].sort((a, b) => {
    const statusOrder = { Active: 0, Planned: 1, Completed: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold">Sprints</h1>
        <SprintForm
          onSubmit={onCreateSprint}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          }
        />
      </div>

      {hasActiveSprint && (
        <div className="bg-accent/50 border border-accent rounded-lg p-4">
          <p className="text-sm text-accent-foreground">
            <strong>Note:</strong> Only one sprint can be active at a time. End the current active sprint before
            starting a new one.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedSprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            issues={issues}
            onEdit={onEditSprint}
            onStart={onStartSprint}
            onEnd={onEndSprint}
            canStart={!hasActiveSprint}
          />
        ))}
      </div>

      {sprints.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sprints created yet. Create your first sprint to get started.</p>
        </div>
      )}
    </div>
  )
}
