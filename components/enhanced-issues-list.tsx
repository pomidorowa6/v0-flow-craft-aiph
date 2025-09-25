"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [bulkSprintId, setBulkSprintId] = useState<string>("")
  const [bulkAssigneeId, setBulkAssigneeId] = useState<string>("")

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
    if (!bulkSprintId) return
    selectedIssues.forEach((issueId) => {
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        onEditIssue({ ...issue, sprintId: bulkSprintId })
      }
    })
    setSelectedIssues(new Set())
    setBulkSprintId("")
  }

  const handleBulkAssignPerson = () => {
    if (!bulkAssigneeId) return
    selectedIssues.forEach((issueId) => {
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        onEditIssue({ ...issue, assigneeId: bulkAssigneeId })
      }
    })
    setSelectedIssues(new Set())
    setBulkAssigneeId("")
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-b border-none">
        <div className="text-center">
          <div className="text-2xl font-bold">{issues.length}</div>
          <div className="text-muted-foreground text-sm">Total Issues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{blockedIssuesCount}</div>
          <div className="text-muted-foreground text-sm">Blocked Issues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{highImpactCount}</div>
          <div className="text-muted-foreground text-sm">High Impact</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {issues.filter((issue) => issue.status === "Done").length}
          </div>
          <div className="text-muted-foreground text-sm">Completed</div>
        </div>
        <div className="flex items-center space-x-3">
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

      <div className="border rounded-lg">
        {/* Search and Actions Row */}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center p-4 border-b bg-muted/20 justify-stretch gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: Priority | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Priority" />
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

          <Select
            value={businessImpactFilter}
            onValueChange={(value: BusinessImpact | "all") => setBusinessImpactFilter(value)}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Business Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Team" />
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

          <Select
            value={sortBy}
            onValueChange={(value: "priority" | "businessImpact" | "created" | "updated") => setSortBy(value)}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="businessImpact">Business Impact</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="updated">Updated Date</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showBlockedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBlockedOnly(!showBlockedOnly)}
            className="h-10"
          >
            Blocked Only
          </Button>
        </div>

        {selectedIssues.size > 0 && (
          <div className="flex items-center justify-between p-4 border-b bg-blue-50 dark:bg-blue-950/20">
            <span className="text-sm font-medium">
              {selectedIssues.size} issue{selectedIssues.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-2">
              <Select value={bulkSprintId} onValueChange={setBulkSprintId}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Assign to Sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleBulkAssignSprint} disabled={!bulkSprintId}>
                <Calendar className="h-3 w-3 mr-1" />
                Assign Sprint
              </Button>

              <Select value={bulkAssigneeId} onValueChange={setBulkAssigneeId}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Assign to Person" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleBulkAssignPerson} disabled={!bulkAssigneeId}>
                <Users className="h-3 w-3 mr-1" />
                Assign Person
              </Button>

              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Selected
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
              <TableHead>Business Impact</TableHead>
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
                  <TableCell>{sprint?.name || "No Sprint"}</TableCell>
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
