"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react"
import { EnhancedIssueForm } from "./enhanced-issue-form"
import type { EnhancedIssue, Sprint, Team, TeamMember, Priority, IssueStatus, BusinessImpact } from "@/types"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EnhancedIssuesListProps {
  issues: EnhancedIssue[]
  sprints: Sprint[]
  teams: Team[]
  teamMembers: TeamMember[]
  onCreateIssue: (issueData: Partial<EnhancedIssue>) => void
  onEditIssue: (issue: EnhancedIssue) => void
  onDeleteIssue: (issueId: string) => void
}

export function EnhancedIssuesList({
  issues,
  sprints,
  teams,
  teamMembers,
  onCreateIssue,
  onEditIssue,
  onDeleteIssue,
}: EnhancedIssuesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [businessImpactFilter, setBusinessImpactFilter] = useState<BusinessImpact | "all">("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"priority" | "businessImpact" | "created" | "updated">("priority")
  const [showBlockedOnly, setShowBlockedOnly] = useState(false)
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set())
  const [assignSprintModalOpen, setAssignSprintModalOpen] = useState(false)
  const [assignPersonModalOpen, setAssignPersonModalOpen] = useState(false)
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const [selectedPersonId, setSelectedPersonId] = useState<string>("")

  const filteredAndSortedIssues = issues
    .filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter
      const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
      const matchesBusinessImpact = businessImpactFilter === "all" || issue.businessImpact === businessImpactFilter
      const matchesTeam = teamFilter === "all" || issue.teamId === teamFilter
      const matchesBlocked = !showBlockedOnly || issue.blockedReason

      return matchesSearch && matchesStatus && matchesPriority && matchesBusinessImpact && matchesTeam && matchesBlocked
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case "businessImpact":
          const impactOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
          return impactOrder[a.businessImpact] - impactOrder[b.businessImpact]
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

  const blockedIssuesCount = issues.filter((issue) => issue.blockedReason).length
  const highImpactCount = issues.filter(
    (issue) => issue.businessImpact === "Critical" || issue.businessImpact === "High",
  ).length
  const completedCount = issues.filter((issue) => issue.status === "Done").length

  const chartData = [
    { category: "total", count: issues.length, fill: "hsl(var(--chart-1) / 0.5)" },
    { category: "blocked", count: blockedIssuesCount, fill: "hsl(var(--chart-2) / 0.5)" },
    { category: "highImpact", count: highImpactCount, fill: "hsl(var(--chart-3) / 0.5)" },
    { category: "completed", count: completedCount, fill: "hsl(var(--chart-4) / 0.5)" },
  ]

  const chartConfig = {
    count: {
      label: "Count",
    },
    total: {
      label: "Total Issues",
      color: "hsl(var(--chart-1))",
    },
    blocked: {
      label: "Blocked Issues",
      color: "hsl(var(--chart-2))",
    },
    highImpact: {
      label: "High Impact",
      color: "hsl(var(--chart-3))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(new Set(filteredAndSortedIssues.map((issue) => issue.id)))
    } else {
      setSelectedIssues(new Set())
    }
  }

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    const newSelected = new Set(selectedIssues)
    if (checked) {
      newSelected.add(issueId)
    } else {
      newSelected.delete(issueId)
    }
    setSelectedIssues(newSelected)
  }

  const handleBulkDelete = () => {
    selectedIssues.forEach((issueId) => onDeleteIssue(issueId))
    setSelectedIssues(new Set())
  }

  const handleBulkAssignSprint = () => {
    if (!selectedSprintId) return
    selectedIssues.forEach((issueId) => {
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        onEditIssue({ ...issue, sprintId: selectedSprintId })
      }
    })
    setSelectedIssues(new Set())
    setSelectedSprintId("")
    setAssignSprintModalOpen(false)
  }

  const handleBulkAssignPerson = () => {
    if (!selectedPersonId) return
    selectedIssues.forEach((issueId) => {
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        onEditIssue({ ...issue, assigneeId: selectedPersonId })
      }
    })
    setSelectedIssues(new Set())
    setSelectedPersonId("")
    setAssignPersonModalOpen(false)
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "P0":
        return "bg-red-600 text-white"
      case "P1":
        return "bg-red-500 text-white"
      case "P2":
        return "bg-orange-500 text-white"
      case "P3":
        return "bg-yellow-500 text-black"
      case "P4":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getImpactColor = (impact: BusinessImpact) => {
    switch (impact) {
      case "Critical":
        return "bg-red-600 text-white"
      case "High":
        return "bg-orange-500 text-white"
      case "Medium":
        return "bg-yellow-500 text-black"
      case "Low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 py-4 border-b border-none">
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Issues Overview</CardTitle>
              <CardDescription>Current status of all issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{
                    left: 0,
                  }}
                >
                  <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" layout="vertical" radius={5} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="flex-shrink-0">
          <EnhancedIssueForm
            sprints={sprints}
            teams={teams}
            teamMembers={teamMembers}
            onSubmit={onCreateIssue}
            onCancel={() => {}}
            trigger={
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Issue
              </Button>
            }
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b bg-muted/20">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selectedIssues.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-primary/10 dark:bg-primary/20">
            <span className="text-sm font-medium text-foreground">
              {selectedIssues.size} issue{selectedIssues.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-2">
              <Dialog open={assignSprintModalOpen} onOpenChange={setAssignSprintModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                    <Calendar className="h-3 w-3 mr-1" />
                    Assign Sprint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                    <DialogTitle className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Assign to Sprint
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {sprints.map((sprint) => (
                        <div
                          key={sprint.id}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                            selectedSprintId === sprint.id ? "bg-primary/10 border-primary" : ""
                          }`}
                          onClick={() => setSelectedSprintId(sprint.id)}
                        >
                          <div className="font-medium">Sprint {sprint.no}</div>
                          <div className="text-sm text-muted-foreground">{sprint.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setAssignSprintModalOpen(false)} size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAssignSprint} disabled={!selectedSprintId} size="sm">
                      Assign
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={assignPersonModalOpen} onOpenChange={setAssignPersonModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                    <Users className="h-3 w-3 mr-1" />
                    Assign Person
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                    <DialogTitle className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Assign to Person
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {teamMembers.map((member) => {
                        const memberTeam = teams.find((t) => t.id === member.teamId)
                        return (
                          <div
                            key={member.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 flex items-center space-x-3 ${
                              selectedPersonId === member.id ? "bg-primary/10 border-primary" : ""
                            }`}
                            onClick={() => setSelectedPersonId(member.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{memberTeam?.name || "No Team"}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setAssignPersonModalOpen(false)} size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAssignPerson} disabled={!selectedPersonId} size="sm">
                      Assign
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8 text-xs ml-auto">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIssues.size === filteredAndSortedIssues.length && filteredAndSortedIssues.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Team/Assignee</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedIssues.map((issue) => {
              const team = teams.find((t) => t.id === issue.teamId)
              const assignee = teamMembers.find((m) => m.id === issue.assigneeId)
              const sprint = sprints.find((s) => s.id === issue.sprintId)

              return (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIssues.has(issue.id)}
                      onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm text-muted-foreground">{issue.id}</div>
                      {issue.blockedReason && (
                        <Badge variant="destructive" className="mt-1">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{issue.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(issue.businessImpact)}>{issue.businessImpact}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{team?.name || "Unassigned"}</div>
                      <div className="text-sm text-muted-foreground">{assignee?.name || "Unassigned"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sprint ? (
                      <div>
                        {console.log("[v0] Sprint data:", sprint)}
                        <div className="font-medium">{sprint.no}</div>
                        <div className="text-sm text-muted-foreground">{sprint.title}</div>
                      </div>
                    ) : (
                      "No Sprint"
                    )}
                  </TableCell>
                  <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <EnhancedIssueForm
                        issue={issue}
                        sprints={sprints}
                        teams={teams}
                        teamMembers={teamMembers}
                        onSubmit={onEditIssue}
                        onCancel={() => {}}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDeleteIssue(issue.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No issues found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
