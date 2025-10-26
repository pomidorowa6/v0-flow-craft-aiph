"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SprintForm } from "./sprint-form"
import { Play, CheckCircle, Edit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Sprint, Issue } from "@/types"
import { format } from "date-fns"

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
  const [activationDialog, setActivationDialog] = useState<{
    open: boolean
    sprintToActivate: Sprint | null
    activeSprint: Sprint | null
  }>({
    open: false,
    sprintToActivate: null,
    activeSprint: null,
  })

  const [completionDialog, setCompletionDialog] = useState<{
    open: boolean
    sprintToComplete: Sprint | null
  }>({
    open: false,
    sprintToComplete: null,
  })

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  // Sort sprints: Active first, then Planned, then Completed
  const sortedSprints = [...sprints].sort((a, b) => {
    const statusOrder = { Active: 0, Planned: 1, Completed: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  const handleActivateClick = (sprint: Sprint) => {
    if (activeSprint) {
      setActivationDialog({
        open: true,
        sprintToActivate: sprint,
        activeSprint: activeSprint,
      })
    } else {
      onStartSprint(sprint.id)
    }
  }

  const handleConfirmActivation = () => {
    if (activationDialog.activeSprint) {
      onEndSprint(activationDialog.activeSprint.id)
    }
    if (activationDialog.sprintToActivate) {
      onStartSprint(activationDialog.sprintToActivate.id)
    }
    setActivationDialog({ open: false, sprintToActivate: null, activeSprint: null })
  }

  const handleCompleteClick = (sprint: Sprint) => {
    setCompletionDialog({
      open: true,
      sprintToComplete: sprint,
    })
  }

  const handleConfirmCompletion = () => {
    if (completionDialog.sprintToComplete) {
      onEndSprint(completionDialog.sprintToComplete.id)
    }
    setCompletionDialog({ open: false, sprintToComplete: null })
  }

  const getStatusColor = (status: Sprint["status"]) => {
    switch (status) {
      case "Active":
        return "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]"
      case "Planned":
        return "bg-[var(--status-todo-bg)] text-[var(--status-todo-text)]"
      case "Completed":
        return "bg-[var(--status-done-bg)] text-[var(--status-done-text)]"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader
            className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm"
            style={{
              borderBottom: "1px solid hsl(var(--border))",
              position: "sticky",
              top: 0,
            }}
          >
            <TableRow className="bg-background/95 backdrop-blur-sm">
              <TableHead className="px-4 py-0">
                <span className="text-xs font-medium text-foreground">Sprint name</span>
              </TableHead>
              <TableHead className="px-4 py-0">
                <span className="text-xs font-medium text-foreground">Status</span>
              </TableHead>
              <TableHead className="px-4 py-0">
                <span className="text-xs font-medium text-foreground">Start Date</span>
              </TableHead>
              <TableHead className="px-4 py-0">
                <span className="text-xs font-medium text-foreground">End Date</span>
              </TableHead>
              <TableHead className="px-4 py-0">
                <span className="text-xs font-medium text-foreground">Issues</span>
              </TableHead>
              <TableHead className="px-4 py-0 text-right">
                <span className="text-xs font-medium text-foreground">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSprints.map((sprint) => {
              const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.id)
              const isEditable = sprint.status !== "Completed"

              return (
                <TableRow key={sprint.id} className="border-b border-border bg-background">
                  <TableCell className="px-4 py-3 bg-background font-medium">
                    {sprint.no} - {sprint.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 bg-background">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(sprint.status)}`}
                    >
                      {sprint.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 bg-background text-muted-foreground">
                    {format(new Date(sprint.startDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-3 bg-background text-muted-foreground">
                    {format(new Date(sprint.endDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-3 bg-background text-muted-foreground">
                    {sprintIssues.length} {sprintIssues.length === 1 ? "issue" : "issues"}
                  </TableCell>
                  <TableCell className="px-4 py-3 bg-background text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Activate button for Planned sprints */}
                      {sprint.status === "Planned" && (
                        <Button size="sm" variant="secondary" onClick={() => handleActivateClick(sprint)}>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}

                      {/* Complete button for Active sprints */}
                      {sprint.status === "Active" && (
                        <Button size="sm" variant="secondary" onClick={() => handleCompleteClick(sprint)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      {/* Edit button for Planned and Active sprints */}
                      {isEditable && (
                        <SprintForm
                          sprints={sprints}
                          sprint={sprint}
                          onSubmit={(data) => onEditSprint({ ...sprint, ...data })}
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label={`Edit sprint ${sprint.title}`}
                            >
                              <Edit className="h-3 w-3 text-foreground" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {sprints.length === 0 && (
          <div className="text-center py-12 border-t border-border">
            <p className="text-muted-foreground">No sprints created yet. Create your first sprint to get started.</p>
          </div>
        )}
      </div>

      <AlertDialog
        open={activationDialog.open}
        onOpenChange={(open) =>
          !open && setActivationDialog({ open: false, sprintToActivate: null, activeSprint: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Active Sprint Detected</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                You already have an active sprint:{" "}
                <strong>
                  {activationDialog.activeSprint?.no} - {activationDialog.activeSprint?.title}
                </strong>
              </div>
              <div>
                Only one sprint can be active at a time. Would you like to complete the current sprint and activate{" "}
                <strong>
                  {activationDialog.sprintToActivate?.no} - {activationDialog.sprintToActivate?.title}
                </strong>
                ?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmActivation}>Complete Current & Activate New</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={completionDialog.open}
        onOpenChange={(open) => !open && setCompletionDialog({ open: false, sprintToComplete: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete{" "}
              <strong>
                {completionDialog.sprintToComplete?.no} - {completionDialog.sprintToComplete?.title}
              </strong>
              ? This action will mark the sprint as completed and move any unfinished issues back to the backlog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCompletion}>Complete Sprint</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
