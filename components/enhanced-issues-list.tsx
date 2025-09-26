"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react"
import { EnhancedIssueForm } from "./enhanced-issue-form"
import type { EnhancedIssue, Sprint, Team, TeamMember, Priority, IssueStatus, BusinessImpact } from "@/types"

interface EnhancedIssuesListProps {
  issues: EnhancedIssue[]
  sprints: Sprint[]
  teams: Team[]
  teamMembers: TeamMember[]
  onCreateIssue: (issueData: Partial<EnhancedIssue>) => void
  onEditIssue: (issue: EnhancedIssue) => void
  onDeleteIssue: (issueId: string) => void
}

/**
 * EnhancedIssuesList - Comprehensive issue management interface with filtering and bulk operations
 *
 * Connected Components:
 * - Uses @/components/ui/data-table for tabular display
 * - Uses @/components/ui/alert-dialog for destructive action confirmations
 * - Integrates with EnhancedIssueForm for create/edit operations
 * - Uses semantic design tokens for WCAG AA compliance
 *
 * Props:
 * - issues: Array of enhanced issues to display
 * - sprints: Available sprints for assignment
 * - teams: Team data for filtering and assignment
 * - teamMembers: Team member data for assignment
 * - onCreateIssue: Handler for creating new issues
 * - onEditIssue: Handler for editing existing issues
 * - onDeleteIssue: Handler for deleting issues
 */
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

      return matchesSearch && matchesStatus && matchesPriority && matchesBusinessImpact && matchesTeam
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

  const blockedIssuesCount = issues.filter((issue) => issue.status === "Blocked").length
  const highImpactCount = issues.filter(
    (issue) => issue.businessImpact === "Critical" || issue.businessImpact === "High",
  ).length

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
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      case "P1":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      case "P2":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
      case "P3":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      case "P4":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    }
  }

  const getImpactColor = (impact: BusinessImpact) => {
    switch (impact) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      case "High":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "Low":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    }
  }

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case "Todo":
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "In Review":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
      case "Done":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
      case "Blocked":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    }
  }

  return (
    <div className="h-full w-full flex flex-col space-y-4">
  {/* === STATISTICS OVERVIEW === */}
  {/* Summary cards showing key metrics */}
  <div className="grid grid-cols-1 md:grid-cols-5 py-4 border-b border-none gap-4 flex-shrink-0">
    <div className="text-center">
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
    <div className="flex items-center space-x-2 text-right flex-row justify-end">
      <EnhancedIssueForm
        sprints={sprints}
        teams={teams}
        teamMembers={teamMembers}
        onSubmit={onCreateIssue}
        onCancel={() => {}}
        trigger={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        }
      />
    </div>
  </div>

  {/* === ISSUES TABLE === */}
  {/* Main data table with integrated filters and sticky header */}
  <div className="flex-1 min-h-0 border rounded-lg flex flex-col">
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 border-b">
          <TableRow>
            <TableHead className="w-12 bg-background">
              <Checkbox
                checked={
                  selectedIssues.size === filteredAndSortedIssues.length && filteredAndSortedIssues.length > 0
                }
                onCheckedChange={handleSelectAll}
                aria-label="Select all issues"
              />
            </TableHead>
            <TableHead className="min-w-[200px] bg-background">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 min-w-[150px]">
                  <Input
                    placeholder="Issue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs font-medium border-none bg-transparent hover:bg-muted/50 focus:bg-background"
                    aria-label="Search issues"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] bg-background">
              <Select value={priorityFilter} onValueChange={(value: Priority | "all") => setPriorityFilter(value)}>
                <SelectTrigger
                  className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium"
                  aria-label="Filter by priority"
                >
                  <div className="flex items-center">
                    <span>Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="P0">P0 - Critical</SelectItem>
                  <SelectItem value="P1">P1 - High</SelectItem>
                  <SelectItem value="P2">P2 - Medium</SelectItem>
                  <SelectItem value="P3">P3 - Low</SelectItem>
                  <SelectItem value="P4">P4 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="min-w-[120px] bg-background">
              <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
                <SelectTrigger
                  className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium"
                  aria-label="Filter by status"
                >
                  <div className="flex items-center">
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="min-w-[120px] bg-background">
              <Select
                value={businessImpactFilter}
                onValueChange={(value: BusinessImpact | "all") => setBusinessImpactFilter(value)}
              >
                <SelectTrigger
                  className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium"
                  aria-label="Filter by business impact"
                >
                  <div className="flex items-center">
                    <span>Impact</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="min-w-[120px] bg-background">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger
                  className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium"
                  aria-label="Filter by team"
                >
                  <div className="flex items-center">
                    <span>Team</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>
            <TableHead className="bg-background">
              <span className="text-xs font-medium text-foreground">Sprint</span>
            </TableHead>
            <TableHead className="bg-background">
              <span className="text-xs font-medium text-foreground">Created</span>
            </TableHead>
            <TableHead className="w-20 bg-background">
              <span className="text-xs font-medium text-foreground">Actions</span>
            </TableHead>
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
                    aria-label={`Select issue ${issue.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-muted-foreground">{issue.id}</div>
                    {issue.status === "Blocked" && (
                      <Badge className={getStatusColor("Blocked")} variant="outline">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(issue.priority)} variant="outline">
                    {issue.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(issue.status)} variant="outline">
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getImpactColor(issue.businessImpact)} variant="outline">
                    {issue.businessImpact}
                  </Badge>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Edit issue ${issue.title}`}
                        >
                          <Edit className="h-3 w-3 text-foreground" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          aria-label={`Delete issue ${issue.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete "{issue.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction>Cancel</AlertDialogAction>
                          <AlertDialogCancel onClick={() => onDeleteIssue(issue.id)}>
                            Delete</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>

    {/* === BULK OPERATIONS BAR === */}
    {/* Appears when issues are selected, provides bulk actions */}
    {selectedIssues.size > 0 && (
      <div className="flex items-center justify-between px-4 py-2 border-t bg-primary/10 dark:bg-primary/20 flex-shrink-0">
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs ml-auto"
                disabled={selectedIssues.size === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Selected ({selectedIssues.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Multiple Issues</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to delete {selectedIssues.size} issues. This action cannot be undone.
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Issues to delete:</strong>
                    <ul className="mt-1 list-disc pl-4">
                      {Array.from(selectedIssues)
                        .slice(0, 3)
                        .map((issueId) => {
                          const issue = issues.find((i) => i.id === issueId)
                          return issue ? <li key={issue.id}>{issue.title}</li> : null
                        })}
                      {selectedIssues.size > 3 && <li>...and {selectedIssues.size - 3} more</li>}
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )}
  </div>

  {/* === EMPTY STATE === */}
  {/* Shown when no issues match current filters */}
  {filteredAndSortedIssues.length === 0 && (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No issues found matching your filters.</p>
    </div>
  )}
</div>

  )
}
