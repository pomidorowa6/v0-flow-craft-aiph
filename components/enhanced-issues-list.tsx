"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import { EnhancedIssueCard } from "./enhanced-issue-card"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Issues</h2>
          <p className="text-muted-foreground">Manage issues with business context and dependencies</p>
        </div>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{issues.length}</div>
          <div className="text-sm text-muted-foreground">Total Issues</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">{blockedIssuesCount}</div>
          <div className="text-sm text-muted-foreground">Blocked Issues</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{highImpactCount}</div>
          <div className="text-sm text-muted-foreground">High Impact</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {issues.filter((issue) => issue.status === "Done").length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant={showBlockedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBlockedOnly(!showBlockedOnly)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Blocked Only
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="businessImpact">Business Impact</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="updated">Updated Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedIssues.map((issue) => (
          <EnhancedIssueCard
            key={issue.id}
            issue={issue}
            sprints={sprints}
            teamMembers={teamMembers}
            onEdit={onEditIssue}
            onDelete={onDeleteIssue}
          />
        ))}
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No issues found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
