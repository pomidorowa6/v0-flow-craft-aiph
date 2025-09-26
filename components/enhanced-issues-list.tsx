"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Users, Calendar, ChevronDown } from "lucide-react"
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
      <div className="grid grid-cols-1 md:grid-cols-5 py-4 border-b border-none gap-4">
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

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIssues.size === filteredAndSortedIssues.length && filteredAndSortedIssues.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Issue</span>
                    <div className="relative flex-1 min-w-[150px]">

                      <Input
                        placeholder="Issue"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-xs"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Select value={priorityFilter} onValueChange={(value: Priority | "all") => setPriorityFilter(value)}>
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium">
                      <div className="flex items-center">
                        <span>Priority</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
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
                <TableHead className="min-w-[120px]">
                  <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium">
                      <div className="flex items-center">
                        <span>Status</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
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
                <TableHead className="min-w-[120px]">
                  <Select
                    value={businessImpactFilter}
                    onValueChange={(value: BusinessImpact | "all") => setBusinessImpactFilter(value)}
                  >
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium">
                      <div className="flex items-center">
                        <span>Impact</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
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
                <TableHead className="min-w-[120px]">
                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-xs font-medium">
                      <div className="flex items-center">
                        <span>Team</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
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
                        {issue.status === "Blocked" && (
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
                              <Edit className="h-3 w-3 text-foreground" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDeleteIssue(issue.id)}
                        >
                          <Trash2 className="h-3 w-3 text-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
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
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No issues found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
