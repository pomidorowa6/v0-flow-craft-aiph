"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { Button } from "@/components/ui/button"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, TrendingDown, AlertTriangle, Activity, FileText, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeamMember, Team, EnhancedIssue, Sprint } from "@/types"

interface PeopleCapacityViewProps {
  teamMembers: TeamMember[]
  teams: Team[]
  issues: EnhancedIssue[]
  sprints: Sprint[]
}

interface MemberStats {
  totalIssues: number
  completedIssues: number
  inProgressIssues: number
  blockedIssues: number
  avgCompletionTime: number
  utilizationRate: number
  performanceScore: number
}

/**
 * PeopleCapacityView - Consolidated team capacity overview
 *
 * Connected Components:
 * - Uses @/components/ui/table for capacity table
 * - Uses @/components/ui/popover and @/components/ui/checkbox for multi-select filters
 * - Uses side panel overlay for skills matrix
 * - Integrates with team and member data
 *
 * Structure:
 * - Top: Team stats summary cards
 * - Main: Capacity table with filterable headers and capacity bars
 * - Side Panel: Skills matrix overlay (triggered by icon click)
 */
export function PeopleCapacityView({ teamMembers, teams, issues, sprints }: PeopleCapacityViewProps) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(teams.map((t) => t.id))
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "Overloaded",
    "At Capacity",
    "Optimal",
    "Underutilized",
  ])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isSkillsPanelOpen, setIsSkillsPanelOpen] = useState(false)

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const getMemberStats = (member: TeamMember): MemberStats => {
    const memberIssues = issues.filter((issue) => issue.assignee === member.name)
    const sprintIssues = memberIssues.filter((issue) => issue.sprintId === activeSprint?.id)

    const completedIssues = memberIssues.filter((issue) => issue.status === "Done")
    const inProgressIssues = memberIssues.filter((issue) => issue.status === "In Progress")
    const blockedIssues = memberIssues.filter((issue) => issue.blockedReason)

    const utilizationRate = member.capacity > 0 ? (member.currentWorkload / member.capacity) * 100 : 0

    const completionRate = memberIssues.length > 0 ? (completedIssues.length / memberIssues.length) * 100 : 0
    const performanceScore = Math.min(100, completionRate * 0.6 + Math.min(utilizationRate, 100) * 0.4)

    return {
      totalIssues: memberIssues.length,
      completedIssues: completedIssues.length,
      inProgressIssues: inProgressIssues.length,
      blockedIssues: blockedIssues.length,
      avgCompletionTime: 2.5, // Mock data
      utilizationRate,
      performanceScore,
    }
  }

  const getCapacityStatus = (utilizationRate: number) => {
    if (utilizationRate >= 100)
      return {
        status: "Overloaded",
        variant: "default" as const,
        className:
          "bg-[var(--capacity-overloaded-bg)] text-[var(--capacity-overloaded-text)] border-[var(--capacity-overloaded-border)]",
      }
    if (utilizationRate >= 85)
      return {
        status: "At Capacity",
        variant: "default" as const,
        className:
          "bg-[var(--capacity-at-capacity-bg)] text-[var(--capacity-at-capacity-text)] border-[var(--capacity-at-capacity-border)]",
      }
    if (utilizationRate >= 60)
      return {
        status: "Optimal",
        variant: "default" as const,
        className:
          "bg-[var(--capacity-optimal-bg)] text-[var(--capacity-optimal-text)] border-[var(--capacity-optimal-border)]",
      }
    return {
      status: "Underutilized",
      variant: "secondary" as const,
      className:
        "bg-[var(--capacity-underutilized-bg)] text-[var(--capacity-underutilized-text)] border-[var(--capacity-underutilized-border)]",
    }
  }

  const filteredMembers = teamMembers.filter((member) => {
    const memberTeam = teams.find((t) => t.memberIds.includes(member.id))
    const stats = getMemberStats(member)
    const capacityStatus = getCapacityStatus(stats.utilizationRate)

    const teamMatch = !memberTeam || selectedTeamIds.includes(memberTeam.id)
    const statusMatch = selectedStatuses.includes(capacityStatus.status)

    return teamMatch && statusMatch
  })

  const teamStats = {
    totalMembers: filteredMembers.length,
    overloadedMembers: filteredMembers.filter((m) => getMemberStats(m).utilizationRate >= 100).length,
    underutilizedMembers: filteredMembers.filter((m) => getMemberStats(m).utilizationRate < 60).length,
    avgUtilization:
      filteredMembers.reduce((sum, m) => sum + getMemberStats(m).utilizationRate, 0) / filteredMembers.length || 0,
  }

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]))
  }

  const toggleAllTeams = () => {
    setSelectedTeamIds((prev) => (prev.length === teams.length ? [] : teams.map((t) => t.id)))
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleAllStatuses = () => {
    const allStatuses = ["Overloaded", "At Capacity", "Optimal", "Underutilized"]
    setSelectedStatuses((prev) => (prev.length === allStatuses.length ? [] : allStatuses))
  }

  const handleOpenSkillsPanel = (member: TeamMember) => {
    setSelectedMember(member)
    setIsSkillsPanelOpen(true)
  }

  const handleCloseSkillsPanel = () => {
    setIsSkillsPanelOpen(false)
    setTimeout(() => setSelectedMember(null), 300)
  }

  return (
    <div className="space-y-6">
      {/* === HEADER SECTION === */}
      

      {/* === TEAM OVERVIEW STATS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
                <div className="text-xs text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{teamStats.overloadedMembers}</div>
                <div className="text-xs text-muted-foreground">Overloaded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{teamStats.underutilizedMembers}</div>
                <div className="text-xs text-muted-foreground">Underutilized</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(teamStats.avgUtilization)}%</div>
                <div className="text-xs text-muted-foreground">Avg Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === CAPACITY OVERVIEW TABLE === */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Capacity Overview</h3>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Team Member</TableHead>

                  <TableHead>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto px-0 py-0 font-medium hover:bg-transparent">
                          Team
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3" align="start">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Filter by Team</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-2 py-1 text-xs"
                              onClick={toggleAllTeams}
                            >
                              {selectedTeamIds.length === teams.length ? "Deselect All" : "Select All"}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {teams.map((team) => (
                              <div key={team.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`team-${team.id}`}
                                  checked={selectedTeamIds.includes(team.id)}
                                  onCheckedChange={() => toggleTeam(team.id)}
                                />
                                <label
                                  htmlFor={`team-${team.id}`}
                                  className="flex items-center space-x-2 text-sm cursor-pointer flex-1"
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                                  <span>{team.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableHead>

                  <TableHead>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto px-0 py-0 font-medium hover:bg-transparent">
                          Status
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3" align="start">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Filter by Status</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-2 py-1 text-xs"
                              onClick={toggleAllStatuses}
                            >
                              {selectedStatuses.length === 4 ? "Deselect All" : "Select All"}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {["Overloaded", "At Capacity", "Optimal", "Underutilized"].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`status-${status}`}
                                  checked={selectedStatuses.includes(status)}
                                  onCheckedChange={() => toggleStatus(status)}
                                />
                                <label htmlFor={`status-${status}`} className="text-sm cursor-pointer flex-1">
                                  {status}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableHead>

                  <TableHead className="w-[300px]">Capacity</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Blocked</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const stats = getMemberStats(member)
                  const capacityStatus = getCapacityStatus(stats.utilizationRate)
                  const memberTeam = teams.find((team) => team.memberIds.includes(member.id))

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {memberTeam && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: memberTeam.color }} />
                            <span className="text-sm">{memberTeam.name}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", capacityStatus.className)}>
                          {capacityStatus.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {member.currentWorkload}/{member.capacity}h used - {Math.round(stats.utilizationRate)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(stats.utilizationRate, 100)}
                            className={cn(
                              "h-2",
                              stats.utilizationRate >= 100 && "[&>div]:bg-[var(--progress-danger)]",
                              stats.utilizationRate >= 85 &&
                                stats.utilizationRate < 100 &&
                                "[&>div]:bg-[var(--progress-warning)]",
                            )}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{stats.inProgressIssues}</span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-green-600">{stats.completedIssues}</span>
                      </TableCell>

                      <TableCell className="text-center">
                        {stats.blockedIssues > 0 ? (
                          <div className="flex items-center justify-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-[var(--health-blocked-text)]" />
                            <span className="text-sm font-medium text-[var(--health-blocked-text)]">
                              {stats.blockedIssues}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenSkillsPanel(member)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View skills matrix</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* === SKILLS MATRIX SIDE PANEL === */}
      {isSkillsPanelOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={handleCloseSkillsPanel} />

          {/* Side Panel */}
          <div
            className={cn(
              "fixed right-0 top-0 h-full w-full md:w-[500px] bg-card border-l shadow-lg z-50",
              "transform transition-transform duration-300 ease-in-out",
              isSkillsPanelOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            {selectedMember && (
              <div className="flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedMember.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCloseSkillsPanel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Team Info */}
                  {(() => {
                    const memberTeam = teams.find((team) => team.memberIds.includes(selectedMember.id))
                    return memberTeam ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Team</h4>
                        <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: memberTeam.color }} />
                          <span className="text-sm font-medium">{memberTeam.name}</span>
                        </div>
                      </div>
                    ) : null
                  })()}

                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Skills</h4>
                    <div className="space-y-3">
                      {selectedMember.skills.map((skill) => (
                        <div key={skill.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-muted-foreground">{skill.level}/5</span>
                          </div>
                          <Progress value={(skill.level / 5) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Availability</h4>
                    <Badge
                      variant={selectedMember.availability === "Available" ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {selectedMember.availability}
                    </Badge>
                  </div>

                  {/* Current Capacity Stats */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Current Workload</h4>
                    <div className="space-y-2">
                      {(() => {
                        const stats = getMemberStats(selectedMember)
                        return (
                          <>
                            <div className="flex justify-between text-sm p-2 bg-muted rounded">
                              <span>Total Issues</span>
                              <span className="font-medium">{stats.totalIssues}</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 bg-muted rounded">
                              <span>In Progress</span>
                              <span className="font-medium text-blue-600">{stats.inProgressIssues}</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 bg-muted rounded">
                              <span>Completed</span>
                              <span className="font-medium text-green-600">{stats.completedIssues}</span>
                            </div>
                            {stats.blockedIssues > 0 && (
                              <div className="flex justify-between text-sm p-2 bg-[var(--health-blocked-bg)] border border-[var(--health-blocked-border)] rounded">
                                <span className="text-[var(--health-blocked-text)]">Blocked</span>
                                <span className="font-medium text-[var(--health-blocked-text)]">
                                  {stats.blockedIssues}
                                </span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
