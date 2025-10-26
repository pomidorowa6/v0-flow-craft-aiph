"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Clock, TrendingUp, ChevronDown, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label, Pie, PieChart } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Team, TeamMember, EnhancedIssue, Sprint, TeamHealthStatus } from "@/types"
import { teamHealthColors } from "@/lib/data"

interface ManagementCapacityViewProps {
  teams: Team[]
  teamMembers: TeamMember[]
  issues: EnhancedIssue[]
  sprints: Sprint[]
}

interface TeamStats {
  totalIssues: number
  completedIssues: number
  blockedIssues: number
  capacityUtilization: number
  avgCompletionTime: number
  trend: "up" | "down" | "stable"
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
 * ManagementCapacityView - Combined management dashboard and team capacity overview
 *
 * Connected Components:
 * - Uses donut chart for team member capacity status visualization
 * - Uses donut chart for team health status visualization
 * - Uses @/components/ui/table for capacity overview (styled like backlog table)
 * - Integrates team cards from management dashboard
 *
 * Structure:
 * - Top: KPIs and Charts (Donut for capacity, Donut for team health, remaining KPI cards)
 * - Middle: Team cards with detailed stats
 * - Bottom: Capacity overview table with same styling as backlog
 */
export function ManagementCapacityView({ teams, teamMembers, issues, sprints }: ManagementCapacityViewProps) {
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>(teams.map((t) => t.id))
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([
    "Overloaded",
    "At Capacity",
    "Optimal",
    "Underutilized",
  ])
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null)
  const [isSkillsPanelOpen, setIsSkillsPanelOpen] = React.useState(false)

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const getComputedColor = (variable: string): string => {
    if (typeof window === "undefined") return "#000000"
    const color = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    return color || "#000000"
  }

  const getTeamStats = (team: Team): TeamStats => {
    const teamIssues = issues.filter((issue) => issue.teamId === team.id)
    const sprintIssues = teamIssues.filter((issue) => issue.sprintId === activeSprint?.id)
    const teamMemberList = teamMembers.filter((member) => team.memberIds.includes(member.id))

    const totalCapacity = teamMemberList.reduce((sum, member) => sum + member.capacity, 0)
    const totalWorkload = teamMemberList.reduce((sum, member) => sum + member.currentWorkload, 0)

    return {
      totalIssues: sprintIssues.length,
      completedIssues: sprintIssues.filter((issue) => issue.status === "Done").length,
      blockedIssues: sprintIssues.filter((issue) => issue.blockedReason).length,
      capacityUtilization: totalCapacity > 0 ? (totalWorkload / totalCapacity) * 100 : 0,
      avgCompletionTime: 3.2,
      trend: Math.random() > 0.5 ? "up" : "down",
    }
  }

  const getMemberStats = (member: TeamMember): MemberStats => {
    const memberIssues = issues.filter((issue) => issue.assignee === member.name)
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
      avgCompletionTime: 2.5,
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

  const getHealthIcon = (status: TeamHealthStatus) => {
    switch (status) {
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "at_risk":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />
    }
  }

  const getHealthIndicator = (status: TeamHealthStatus) => {
    switch (status) {
      case "healthy":
        return "🟢"
      case "at_risk":
        return "🟡"
      case "blocked":
        return "🔴"
    }
  }

  const capacityDistribution = React.useMemo(() => {
    const underutilized = teamMembers.filter((m) => {
      const stats = getMemberStats(m)
      return stats.utilizationRate < 60
    }).length
    const optimal = teamMembers.filter((m) => {
      const stats = getMemberStats(m)
      return stats.utilizationRate >= 60 && stats.utilizationRate < 85
    }).length
    const atCapacity = teamMembers.filter((m) => {
      const stats = getMemberStats(m)
      return stats.utilizationRate >= 85 && stats.utilizationRate < 100
    }).length
    const overloaded = teamMembers.filter((m) => {
      const stats = getMemberStats(m)
      return stats.utilizationRate >= 100
    }).length

    return [
      { status: "Underutilized", count: underutilized, fill: "hsl(217, 91%, 60%)" }, // Blue
      { status: "Optimal", count: optimal, fill: "hsl(142, 71%, 45%)" }, // Green
      { status: "At Capacity", count: atCapacity, fill: "hsl(38, 92%, 50%)" }, // Orange
      { status: "Overloaded", count: overloaded, fill: "hsl(0, 84%, 60%)" }, // Red
    ]
  }, [teamMembers])

  const totalMembers = React.useMemo(() => {
    return capacityDistribution.reduce((acc, curr) => acc + curr.count, 0)
  }, [capacityDistribution])

  const capacityChartConfig = {
    count: {
      label: "Members",
    },
    Underutilized: {
      label: "Underutilized",
      color: "hsl(217, 91%, 60%)",
    },
    Optimal: {
      label: "Optimal",
      color: "hsl(142, 71%, 45%)",
    },
    "At Capacity": {
      label: "At Capacity",
      color: "hsl(38, 92%, 50%)",
    },
    Overloaded: {
      label: "Overloaded",
      color: "hsl(0, 84%, 60%)",
    },
  } satisfies ChartConfig

  const teamHealthDistribution = React.useMemo(() => {
    const healthy = teams.filter((t) => t.healthStatus === "healthy").length
    const atRisk = teams.filter((t) => t.healthStatus === "at_risk").length
    const blocked = teams.filter((t) => t.healthStatus === "blocked").length

    return [
      { status: "Healthy", count: healthy, fill: "hsl(142, 71%, 45%)" }, // Green
      { status: "At Risk", count: atRisk, fill: "hsl(38, 92%, 50%)" }, // Orange
      { status: "Blocked", count: blocked, fill: "hsl(0, 84%, 60%)" }, // Red
    ]
  }, [teams])

  const totalTeams = React.useMemo(() => {
    return teamHealthDistribution.reduce((acc, curr) => acc + curr.count, 0)
  }, [teamHealthDistribution])

  const healthChartConfig = {
    count: {
      label: "Teams",
    },
    Healthy: {
      label: "Healthy",
      color: "hsl(142, 71%, 45%)",
    },
    "At Risk": {
      label: "At Risk",
      color: "hsl(38, 92%, 50%)",
    },
    Blocked: {
      label: "Blocked",
      color: "hsl(0, 84%, 60%)",
    },
  } satisfies ChartConfig

  const filteredMembers = teamMembers.filter((member) => {
    const memberTeam = teams.find((t) => t.memberIds.includes(member.id))
    const stats = getMemberStats(member)
    const capacityStatus = getCapacityStatus(stats.utilizationRate)

    const teamMatch = !memberTeam || selectedTeamIds.includes(memberTeam.id)
    const statusMatch = selectedStatuses.includes(capacityStatus.status)

    return teamMatch && statusMatch
  })

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
      {/* === KPI CARDS AND CHARTS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Team Member Capacity Chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Chart on the left */}
              <div className="flex-shrink-0">
                <ChartContainer config={capacityChartConfig} className="h-[96px] w-[96px]">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={capacityDistribution}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={40}
                      outerRadius={48}
                      strokeWidth={2}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-bold">
                                  {totalMembers}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Members
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Legend on the right */}
              <div className="flex-1 space-y-1">
                {capacityDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Health Chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Chart on the left */}
              <div className="flex-shrink-0">
                <ChartContainer config={healthChartConfig} className="h-[96px] w-[96px]">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={teamHealthDistribution}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={40}
                      outerRadius={48}
                      strokeWidth={2}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-bold">
                                  {totalTeams}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Teams
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Legend on the right */}
              <div className="flex-1 space-y-1">
                {teamHealthDistribution.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Issues KPI - vertically centered */}
        <Card>
          <CardContent className="p-4 flex items-center h-full">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{issues.filter((issue) => issue.blockedReason).length}</div>
                <div className="text-xs text-muted-foreground">Blocked Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Capacity KPI - vertically centered */}
        <Card>
          <CardContent className="p-4 flex items-center h-full">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (teamMembers.reduce((sum, member) => sum + member.currentWorkload / member.capacity, 0) /
                      teamMembers.length) *
                      100,
                  )}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Avg Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === TEAM STATUS CARDS === */}
      {/* Team cards from management dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const stats = getTeamStats(team)
          const teamLead = teamMembers.find((member) => member.id === team.leadId)
          const completionRate = stats.totalIssues > 0 ? (stats.completedIssues / stats.totalIssues) * 100 : 0

          return (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(team.healthStatus)}
                    <span className="text-lg">{getHealthIndicator(team.healthStatus)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{team.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Team Lead */}
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={teamLead?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {teamLead?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{teamLead?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Lead
                  </Badge>
                </div>

                {/* Progress Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sprint Progress</span>
                      <span>
                        {stats.completedIssues}/{stats.totalIssues}
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity</span>
                      <span
                        className={cn(
                          stats.capacityUtilization > 90
                            ? "text-red-500"
                            : stats.capacityUtilization > 75
                              ? "text-yellow-500"
                              : "text-green-500",
                        )}
                      >
                        {Math.round(stats.capacityUtilization)}%
                      </span>
                    </div>
                    <Progress
                      value={stats.capacityUtilization}
                      className={cn(
                        "h-2",
                        stats.capacityUtilization > 90 && "[&>div]:bg-red-500",
                        stats.capacityUtilization > 75 && stats.capacityUtilization <= 90 && "[&>div]:bg-yellow-500",
                      )}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{team.memberIds.length}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-lg font-semibold">{stats.blockedIssues}</span>
                      {stats.blockedIssues > 0 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground">Blocked</div>
                  </div>
                </div>

                {/* Health Status Badge */}
                <div className="pt-2">
                  <Badge variant="outline" className={cn("w-full justify-center", teamHealthColors[team.healthStatus])}>
                    {team.healthStatus.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* === CAPACITY OVERVIEW TABLE === */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Capacity Overview</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-background/95 backdrop-blur-sm">
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
        </div>
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
