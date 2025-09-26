"use client"

import type React from "react"

import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Search, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"

// Assuming these types and data structures are defined elsewhere
// For demonstration purposes, let's define them here:
type Priority = "P0" | "P1" | "P2" | "P3" | "P4"
type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done" | "Blocked"
type BusinessImpact = "Critical" | "High" | "Medium" | "Low"

interface Team {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

interface Sprint {
  id: string
  name: string
}

interface Issue {
  id: string
  title: string
  priority: Priority
  status: IssueStatus
  businessImpact: BusinessImpact
  teamId: string
  sprintId: string
  createdAt: string
  assigneeId?: string
}

interface EnhancedIssuesListProps {
  issues: Issue[]
  teams: Team[]
  teamMembers: TeamMember[]
  sprints: Sprint[]
  selectedIssues: Set<string>
  filteredAndSortedIssues: Issue[]
  searchTerm: string
  priorityFilter: Priority | "all"
  statusFilter: IssueStatus | "all"
  businessImpactFilter: BusinessImpact | "all"
  teamFilter: string
  handleSelectAll: (checked: boolean) => void
  handleSelectIssue: (issueId: string, checked: boolean) => void
  setSearchTerm: (term: string) => void
  setPriorityFilter: (priority: Priority | "all") => void
  setStatusFilter: (status: IssueStatus | "all") => void
  setBusinessImpactFilter: (impact: BusinessImpact | "all") => void
  setTeamFilter: (teamId: string) => void
  handleDeleteSelected: () => void
  handleDeleteIssue: (issueId: string) => void
  handleEditIssue: (issueId: string) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  issueToDeleteId: string | null
  confirmDeleteIssue: () => void
  setSelectedIssues: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function EnhancedIssuesList({
  issues,
  teams,
  teamMembers,
  sprints,
  selectedIssues,
  filteredAndSortedIssues,
  searchTerm,
  priorityFilter,
  statusFilter,
  businessImpactFilter,
  teamFilter,
  handleSelectAll,
  handleSelectIssue,
  setSearchTerm,
  setPriorityFilter,
  setStatusFilter,
  setBusinessImpactFilter,
  setTeamFilter,
  handleDeleteSelected,
  handleDeleteIssue,
  handleEditIssue,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  issueToDeleteId,
  confirmDeleteIssue,
  setSelectedIssues,
}: EnhancedIssuesListProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-5 py-4 border-b border-none gap-4 flex-shrink-0">
        {/* Filters and actions will go here */}
      </div>

      <div className="border rounded-lg flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12 h-10 text-sm font-medium text-foreground">
                    <Checkbox
                      checked={
                        selectedIssues.size === filteredAndSortedIssues.length && filteredAndSortedIssues.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px] h-10 text-sm font-medium text-foreground">
                    <div className="flex items-center space-x-2">
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
                  <TableHead className="min-w-[120px] h-10 text-sm font-medium text-foreground">
                    <Select
                      value={priorityFilter}
                      onValueChange={(value: Priority | "all") => setPriorityFilter(value)}
                    >
                      <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-sm font-medium text-foreground">
                        <div className="flex items-center justify-between w-full">
                          <span>Priority</span>
                          <ChevronDown className="h-3 w-3" />
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
                  <TableHead className="min-w-[120px] h-10 text-sm font-medium text-foreground">
                    <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
                      <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-sm font-medium text-foreground">
                        <div className="flex items-center justify-between w-full">
                          <span>Status</span>
                          <ChevronDown className="h-3 w-3" />
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
                  <TableHead className="min-w-[120px] h-10 text-sm font-medium text-foreground">
                    <Select
                      value={businessImpactFilter}
                      onValueChange={(value: BusinessImpact | "all") => setBusinessImpactFilter(value)}
                    >
                      <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-sm font-medium text-foreground">
                        <div className="flex items-center justify-between w-full">
                          <span>Impact</span>
                          <ChevronDown className="h-3 w-3" />
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
                  <TableHead className="min-w-[120px] h-10 text-sm font-medium text-foreground">
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 text-sm font-medium text-foreground">
                        <div className="flex items-center justify-between w-full">
                          <span>Team</span>
                          <ChevronDown className="h-3 w-3" />
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
                  <TableHead className="h-10 text-sm font-medium text-foreground">Sprint</TableHead>
                  <TableHead className="h-10 text-sm font-medium text-foreground">Created</TableHead>
                  <TableHead className="w-20 h-10 text-sm font-medium text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedIssues.map((issue) => {
                  const team = teams.find((t) => t.id === issue.teamId)
                  const assignee = teamMembers.find((m) => m.id === issue.assigneeId)
                  const sprint = sprints.find((s) => s.id === issue.sprintId)

                  return (
                    <TableRow key={issue.id}>
                      <TableCell className="w-12 p-4">
                        <Checkbox
                          checked={selectedIssues.has(issue.id)}
                          onCheckedChange={(checked) => handleSelectIssue(issue.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <Link to={`/issue/${issue.id}`} className="hover:underline">
                          {issue.title}
                        </Link>
                      </TableCell>
                      <TableCell className="p-4">{issue.priority}</TableCell>
                      <TableCell className="p-4">{issue.status}</TableCell>
                      <TableCell className="p-4">{issue.businessImpact}</TableCell>
                      <TableCell className="p-4">{team?.name}</TableCell>
                      <TableCell className="p-4">{sprint?.name}</TableCell>
                      <TableCell className="p-4">{format(new Date(issue.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditIssue(issue.id)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteIssue(issue.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedIssues(new Set())
              }}
              disabled={selectedIssues.size === 0}
            >
              Clear Selection
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={selectedIssues.size === 0}>
              Delete Selected
            </Button>
          </div>
          <div className="space-x-2 text-sm">
            <div>
              Total Issues: <span className="font-medium">{issues.length}</span>
            </div>
            <div>
              Showing: <span className="font-medium">{filteredAndSortedIssues.length}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Issue ID
              </Label>
              <Input type="text" id="name" value={issueToDeleteId} disabled className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={confirmDeleteIssue}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
