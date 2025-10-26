"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Target } from "lucide-react"
import { KanbanBoard } from "./kanban-board"
import type { Issue, Sprint, IssueStatus } from "@/types"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CurrentSprintViewProps {
  sprint: Sprint | null
  issues: Issue[]
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
}

export function CurrentSprintView({ sprint, issues, onUpdateIssueStatus }: CurrentSprintViewProps) {
  if (!sprint) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Current Sprint</h1>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Target className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Active Sprint</h3>
          <p className="text-muted-foreground">Start a sprint from the Sprints view to see the kanban board here.</p>
        </div>
      </div>
    )
  }

  const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.id)
  const completedIssues = sprintIssues.filter((issue) => issue.status === "Done")
  const inProgressIssues = sprintIssues.filter((issue) => issue.status === "In Progress")
  const inReviewIssues = sprintIssues.filter((issue) => issue.status === "In Review")
  const todoIssues = sprintIssues.filter((issue) => issue.status === "Todo")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
  
  const chartConfig = {
    count: {
      label: "Count",
      // color: "rgba(113, 113, 122, 0.5)",
    },
    label: {
      color: "var(--background)",
    },
  } satisfies ChartConfig

  const chartData = [
    { category: "To Do", count: todoIssues.length, fill: "rgba(75, 85, 99, 0.5)" },
    { category: "In Progress", count: inProgressIssues.length, fill: "rgba(37, 99, 235, 0.5)" },
    { category: "In Review", count: inReviewIssues.length, fill: "rgba(202, 138, 4, 0.5)" },
    { category: "Completed", count: completedIssues.length, fill: "rgba(22, 163, 74, 0.5)" },
  ]

  const getDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(sprint.endDate)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex flex-row w-full items-center gap-3 justify-between">
              <Target className="h-5 w-5" /> 
              <div className="flex flex-col w-full items-start gap-1">
                Sprint {sprint.no} - {sprint.title}
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                Active
              </Badge>
            </div>
          </CardTitle>
          <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedIssues.length / sprintIssues.length) * 100}%`,
                  }}
                />
              </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            
      
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* First div - fits content and sets the height reference */}
              <div className="flex flex-col gap-4 md:min-w-fit">
                
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {completedIssues.length} / {sprintIssues.length} Complete - {Math.round((completedIssues.length / sprintIssues.length) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </p>
                  </div>
                </div>

                {/* Remaining */}
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time Remaining</p>
                    <p className="text-sm text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days left` : "Sprint ended"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Graph div - responsive chart */}
              <div className="flex-1 w-full min-w-0">
                <div className="h-[180px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      layout="vertical"
                      margin={{
                        left: 0,
                        right: 60,
                        top: 12,
                        bottom: 12,
                      }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        hide
                      />
                      <XAxis dataKey="count" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Bar
                        dataKey="count"
                        layout="vertical"
                        radius={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="category"
                          position="insideLeft"
                          offset={8}
                          className="fill-foreground"
                          fontSize={12}
                          fontWeight="medium"
                        />
                        <LabelList
                          dataKey="count"
                          position="right"
                          offset={8}
                          className="fill-foreground"
                          fontSize={12}
                          fontWeight="medium"
                          formatter={(value) => value > 0 ? value : ''}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>

          </div>
        </CardContent>

      </Card>

      <KanbanBoard sprint={sprint} issues={issues} onUpdateIssueStatus={onUpdateIssueStatus} />
    </div>
  )
}
