"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IssueForm } from "./issue-form"
import { IssueAssignmentDialog } from "./issue-assignment-dialog"
import { priorityColors, statusColors } from "@/lib/data"
import type { Issue, Sprint } from "@/types"

interface IssueCardProps {
  issue: Issue
  sprints: Sprint[]
  onEdit: (issue: Issue) => void
  onDelete: (issueId: string) => void
  onAssignToSprint: (issueId: string, sprintId: string | undefined) => void
  showSprint?: boolean
}

export function IssueCard({ issue, sprints, onEdit, onDelete, onAssignToSprint, showSprint = true }: IssueCardProps) {
  const sprint = sprints.find((s) => s.id === issue.sprintId)

  return (
    <Card className="bg-background hover:bg-card hover:shadow-md transition-all duration-200 my-0">
      <CardHeader className="pb-0">
        <div className="flex justify-between flex-row items-start">
          <div className="space-y-4">
            <div className="flex gap-2 items-center justify-start my-1 flex-row">
              <span className="text-sm font-mono text-muted-foreground">{issue.id}</span>
              <Badge className={priorityColors[issue.priority]} variant="secondary">
                {issue.priority}
              </Badge>
              <Badge className={statusColors[issue.status]} variant="outline">
                {issue.status}
              </Badge>
            </div>
            <h3 className="font-medium leading-tight pt-4">{issue.title}</h3>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <IssueForm
                  issue={issue}
                  sprints={sprints}
                  onSubmit={onEdit}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <IssueAssignmentDialog
                  issue={issue}
                  sprints={sprints}
                  onAssign={onAssignToSprint}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Assign to Sprint
                    </DropdownMenuItem>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{issue.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(issue.id)} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 my-0">
        {issue.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{issue.description}</p>}
        {issue.assignee && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground">Assigned to: {issue.assignee}</span>
          </div>
        )}
        {showSprint && (
          <div className="flex items-center gap-2">
            {sprint ? (
              <Badge variant="secondary" className="text-xs">
                {sprint.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Backlog
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
