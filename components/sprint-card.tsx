"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Play, Square, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SprintForm } from "./sprint-form"
import type { Sprint, Issue } from "@/types"

interface SprintCardProps {
  sprint: Sprint
  issues: Issue[]
  onEdit: (sprint: Sprint) => void
  onStart: (sprintId: string) => void
  onEnd: (sprintId: string) => void
  canStart: boolean
}

export function SprintCard({ sprint, issues, onEdit, onStart, onEnd, canStart }: SprintCardProps) {
  const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.id)
  const completedIssues = sprintIssues.filter((issue) => issue.status === "Done")

  const getStatusColor = () => {
    switch (sprint.status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Planned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-0 my-0">
        <div className="flex items-start justify-between gap-0">
          <div className="space-y-1">
            <div className="flex flex-col items-start my-0 gap-4 py-0">
              <Badge className={getStatusColor()} variant="outline">
                {sprint.status}
              </Badge>
              <h3 className="font-medium">{sprint.name}</h3>
              
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SprintForm
                sprint={sprint}
                onSubmit={onEdit}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              {sprint.status === "Planned" && (
                <DropdownMenuItem onClick={() => onStart(sprint.id)} disabled={!canStart}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Sprint
                </DropdownMenuItem>
              )}
              {sprint.status === "Active" && (
                <DropdownMenuItem onClick={() => onEnd(sprint.id)}>
                  <Square className="h-4 w-4 mr-2" />
                  End Sprint
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Issues</span>
            <span className="font-medium">
              {completedIssues.length} / {sprintIssues.length} completed
            </span>
          </div>
          {sprintIssues.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedIssues.length / sprintIssues.length) * 100}%`,
                }}
              />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {sprintIssues.length === 0 ? "No issues assigned" : `${sprintIssues.length} issues in this sprint`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
