"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { priorityColors } from "@/lib/data"
import type { EnhancedIssue, IssueStatus, Sprint } from "@/types"

interface KanbanBoardProps {
  sprint: Sprint
  issues: EnhancedIssue[]
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
}

const statuses: IssueStatus[] = ["To Do", "In Progress", "Done"]

export function KanbanBoard({ sprint, issues, onUpdateIssueStatus }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false)
  const [sprintIssues, setSprintIssues] = useState<EnhancedIssue[]>([])

  useEffect(() => {
    setMounted(true)
    setSprintIssues(issues)
  }, [issues])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    if (source.droppableId === destination.droppableId) return

    const sourceColumn = sprintIssues.filter((issue) => issue.status === source.droppableId)
    const destinationColumn = sprintIssues.filter((issue) => issue.status === destination.droppableId)

    const sourceIndex = source.index
    const destinationIndex = destination.index

    const [removed] = sourceColumn.splice(sourceIndex, 1)
    removed.status = destination.droppableId as IssueStatus
    destinationColumn.splice(destinationIndex, 0, removed)

    setSprintIssues([
      ...sprintIssues.filter((issue) => issue.status !== source.droppableId),
      ...sourceColumn,
      ...destinationColumn,
    ])

    onUpdateIssueStatus(removed.id, removed.status)
  }

  if (!mounted) return null

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {statuses.map((status) => (
        <div key={status} className="mb-4">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{status}</h2>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {sprintIssues.filter((issue) => issue.status === status).length}
            </Badge>
          </CardHeader>
          <Droppable droppableId={status}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 gap-4">
                {sprintIssues
                  .filter((issue) => issue.status === status)
                  .map((issue, index) => (
                    <Draggable key={issue.id} draggableId={issue.id} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="bg-white rounded-lg shadow-md p-4"
                        >
                          <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          <Badge
                            variant="outline"
                            className={`bg-${priorityColors[issue.priority]}-100 text-${priorityColors[issue.priority]}-800`}
                          >
                            {issue.priority}
                          </Badge>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </DragDropContext>
  )
}
