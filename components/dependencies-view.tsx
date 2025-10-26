"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  GitBranch,
  AlertTriangle,
  Clock,
  ArrowRight,
  Target,
  CheckCircle,
  XCircle,
  Circle,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EnhancedIssue, Team, TeamMember, Sprint } from "@/types"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface DependenciesViewProps {
  issues: EnhancedIssue[]
  teams: Team[]
  teamMembers: TeamMember[]
  sprints: Sprint[]
}

interface DependencyChain {
  id: string
  name: string
  issues: EnhancedIssue[]
  teams: Team[]
  status: "on_track" | "at_risk" | "blocked"
  criticalPath: boolean
  estimatedDuration: number
  actualDuration?: number
}

interface CrossTeamDependency {
  dependentIssue: EnhancedIssue
  dependsOnIssue: EnhancedIssue
  dependentTeam: Team
  dependsOnTeam: Team
  status: "pending" | "in_progress" | "completed" | "blocked"
  riskLevel: "low" | "medium" | "high"
}

interface RiskTimelineData {
  month: string
  critical: number
  high: number
  medium: number
  low: number
  criticalTasks: EnhancedIssue[]
  highTasks: EnhancedIssue[]
  mediumTasks: EnhancedIssue[]
  lowTasks: EnhancedIssue[]
}

export function DependenciesView({ issues, teams, teamMembers, sprints }: DependenciesViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [selectedSprint, setSelectedSprint] = useState<string>("all")
  const [selectedRiskData, setSelectedRiskData] = useState<{
    month: string
    riskLevel: string
    tasks: EnhancedIssue[]
  } | null>(null)

  // Find cross-team dependencies
  const getCrossTeamDependencies = (): CrossTeamDependency[] => {
    const dependencies: CrossTeamDependency[] = []

    issues.forEach((issue) => {
      if (issue.dependencies.length > 0) {
        issue.dependencies.forEach((depId) => {
          const dependsOnIssue = issues.find((i) => i.id === depId)
          if (dependsOnIssue && dependsOnIssue.teamId !== issue.teamId) {
            const dependentTeam = teams.find((t) => t.id === issue.teamId)
            const dependsOnTeam = teams.find((t) => t.id === dependsOnIssue.teamId)

            if (dependentTeam && dependsOnTeam) {
              const status =
                dependsOnIssue.status === "Done"
                  ? "completed"
                  : dependsOnIssue.blockedReason
                    ? "blocked"
                    : dependsOnIssue.status === "In Progress"
                      ? "in_progress"
                      : "pending"

              const riskLevel = dependsOnIssue.blockedReason
                ? "high"
                : dependsOnIssue.businessImpact === "Critical"
                  ? "high"
                  : dependsOnIssue.businessImpact === "High"
                    ? "medium"
                    : "low"

              dependencies.push({
                dependentIssue: issue,
                dependsOnIssue: dependsOnIssue,
                dependentTeam,
                dependsOnTeam,
                status,
                riskLevel,
              })
            }
          }
        })
      }
    })

    return dependencies
  }

  // Generate dependency chains
  const getDependencyChains = (): DependencyChain[] => {
    const chains: DependencyChain[] = []
    const processedIssues = new Set<string>()

    issues.forEach((issue) => {
      if (!processedIssues.has(issue.id) && issue.dependencies.length > 0) {
        const chainIssues = [issue]
        const chainTeams = new Set<Team>()
        let currentIssue = issue

        // Follow the dependency chain
        while (currentIssue.dependencies.length > 0) {
          const nextIssueId = currentIssue.dependencies[0] // Simplified: take first dependency
          const nextIssue = issues.find((i) => i.id === nextIssueId)
          if (nextIssue && !chainIssues.find((ci) => ci.id === nextIssue.id)) {
            chainIssues.push(nextIssue)
            currentIssue = nextIssue
          } else {
            break
          }
        }

        // Add teams involved
        chainIssues.forEach((ci) => {
          const team = teams.find((t) => t.id === ci.teamId)
          if (team) chainTeams.add(team)
        })

        if (chainIssues.length > 1 && chainTeams.size > 1) {
          const hasBlockedIssues = chainIssues.some((ci) => ci.blockedReason)
          const hasHighRiskIssues = chainIssues.some((ci) => ci.businessImpact === "Critical")

          const status = hasBlockedIssues ? "blocked" : hasHighRiskIssues ? "at_risk" : "on_track"

          chains.push({
            id: `chain-${issue.id}`,
            name: `${issue.title} Chain`,
            issues: chainIssues,
            teams: Array.from(chainTeams),
            status,
            criticalPath: chainIssues.some((ci) => ci.businessImpact === "Critical"),
            estimatedDuration: chainIssues.reduce((sum, ci) => sum + (ci.estimatedHours || 0), 0),
          })

          chainIssues.forEach((ci) => processedIssues.add(ci.id))
        }
      }
    })

    return chains
  }

  const getRiskTimelineData = (): RiskTimelineData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const timelineData: RiskTimelineData[] = []

    months.forEach((month, index) => {
      // Simulate risk distribution over time based on issue data
      const monthIssues = issues.filter((issue) => {
        // Simple simulation: distribute issues across months
        const issueMonth = new Date(issue.createdAt || Date.now()).getMonth()
        return issueMonth === index
      })

      const criticalTasks = monthIssues.filter((i) => i.businessImpact === "Critical" || i.blockedReason)
      const highTasks = monthIssues.filter((i) => i.businessImpact === "High" && !i.blockedReason)
      const mediumTasks = monthIssues.filter((i) => i.businessImpact === "Medium")
      const lowTasks = monthIssues.filter((i) => i.businessImpact === "Low")

      timelineData.push({
        month,
        critical: criticalTasks.length,
        high: highTasks.length,
        medium: mediumTasks.length,
        low: lowTasks.length,
        criticalTasks,
        highTasks,
        mediumTasks,
        lowTasks,
      })
    })

    return timelineData
  }

  const crossTeamDependencies = getCrossTeamDependencies()
  const dependencyChains = getDependencyChains()
  const riskTimelineData = getRiskTimelineData()

  const filteredDependencies = crossTeamDependencies.filter((dep) => {
    const teamMatch =
      selectedTeam === "all" || dep.dependentTeam.id === selectedTeam || dep.dependsOnTeam.id === selectedTeam
    const sprintMatch =
      selectedSprint === "all" ||
      dep.dependentIssue.sprintId === selectedSprint ||
      dep.dependsOnIssue.sprintId === selectedSprint
    return teamMatch && sprintMatch
  })

  const sortedDependencies = [...filteredDependencies].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1
    if (a.status !== "completed" && b.status === "completed") return -1
    if (a.status === "blocked" && b.status !== "blocked") return -1
    if (a.status !== "blocked" && b.status === "blocked") return 1
    return 0
  })

  const filteredDependencyChains = dependencyChains.filter((chain) => {
    const teamMatch = selectedTeam === "all" || chain.teams.some((team) => team.id === selectedTeam)
    const sprintMatch = selectedSprint === "all" || chain.issues.some((issue) => issue.sprintId === selectedSprint)
    return teamMatch && sprintMatch
  })

  const criticalPathChains = filteredDependencyChains.filter((chain) => chain.criticalPath)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-[var(--risk-high-bg)] text-[var(--risk-high-text)] border-[var(--risk-high-border)]"
      case "medium":
        return "bg-[var(--risk-medium-bg)] text-[var(--risk-medium-text)] border-[var(--risk-medium-border)]"
      default:
        return "bg-[var(--risk-low-bg)] text-[var(--risk-low-text)] border-[var(--risk-low-border)]"
    }
  }

  const getChainStatusColor = (status: string) => {
    switch (status) {
      case "blocked":
        return "bg-[var(--health-blocked-bg)] text-[var(--health-blocked-text)] border-[var(--health-blocked-border)]"
      case "at_risk":
        return "bg-[var(--health-at-risk-bg)] text-[var(--health-at-risk-text)] border-[var(--health-at-risk-border)]"
      default:
        return "bg-[var(--health-healthy-bg)] text-[var(--health-healthy-text)] border-[var(--health-healthy-border)]"
    }
  }

  const getImpactAnalysis = (chain: DependencyChain) => {
    const blockedIssues = chain.issues.filter((i) => i.blockedReason)
    const affectedIssues = chain.issues.length - blockedIssues.length
    const affectedTeams = chain.teams.length

    if (blockedIssues.length > 0) {
      return `${blockedIssues.length} blocked task(s) affecting ${affectedIssues} downstream task(s) across ${affectedTeams} team(s)`
    }

    const avgDelay = 2 // Example: 2 days delay
    return `If any task delays ${avgDelay} days, affects ${affectedIssues} task(s) across ${affectedTeams} team(s)`
  }

  const dependencyStats = {
    total: crossTeamDependencies.length,
    blocked: crossTeamDependencies.filter((d) => d.status === "blocked").length,
    atRisk: crossTeamDependencies.filter((d) => d.riskLevel === "high").length,
    completed: crossTeamDependencies.filter((d) => d.status === "completed").length,
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RiskTimelineData
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{data.month}</p>
          <div className="space-y-1 text-sm">
            {data.critical > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-red-600">Critical:</span>
                <span className="font-medium">{data.critical} tasks</span>
              </div>
            )}
            {data.high > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-orange-600">High:</span>
                <span className="font-medium">{data.high} tasks</span>
              </div>
            )}
            {data.medium > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-yellow-600">Medium:</span>
                <span className="font-medium">{data.medium} tasks</span>
              </div>
            )}
            {data.low > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-green-600">Low:</span>
                <span className="font-medium">{data.low} tasks</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const handleAreaClick = (data: any, riskLevel: string) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload as RiskTimelineData
      let tasks: EnhancedIssue[] = []

      switch (riskLevel) {
        case "critical":
          tasks = payload.criticalTasks
          break
        case "high":
          tasks = payload.highTasks
          break
        case "medium":
          tasks = payload.mediumTasks
          break
        case "low":
          tasks = payload.lowTasks
          break
      }

      if (tasks.length > 0) {
        setSelectedRiskData({
          month: payload.month,
          riskLevel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
          tasks,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{dependencyStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Dependencies</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{dependencyStats.blocked}</div>
                <div className="text-xs text-muted-foreground">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{dependencyStats.atRisk}</div>
                <div className="text-xs text-muted-foreground">At Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{dependencyStats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4 justify-end">
        <h3 className="w-full text-lg font-semibold mx-0">Dependencies Map</h3>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                  <span>{team.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSprint} onValueChange={setSelectedSprint}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select sprint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sprints</SelectItem>
            {sprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.id}>
                {sprint.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dependency Graph (2/3 width) - Sorted with incomplete first */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {sortedDependencies.map((dependency, index) => {
              const dependentAssignee = teamMembers.find((m) => m.name === dependency.dependentIssue.assignee)
              const dependsOnAssignee = teamMembers.find((m) => m.name === dependency.dependsOnIssue.assignee)
              const isCompleted = dependency.status === "completed"

              return (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4 transition-opacity",
                    isCompleted && "opacity-50",
                    dependency.status === "blocked" && "border-l-red-500",
                    dependency.status !== "blocked" && getRiskColor(dependency.riskLevel),
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(dependency.status)}
                        <Badge variant="outline" className={getRiskColor(dependency.riskLevel)}>
                          {dependency.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {dependency.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      {/* Dependent Issue */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dependency.dependentTeam.color }}
                          />
                          <span className="font-medium text-sm">{dependency.dependentTeam.name}</span>
                          <span className="text-xs text-muted-foreground">waiting for</span>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {dependency.dependentIssue.id}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                dependency.dependentIssue.priority === "P0" &&
                                  "bg-[var(--priority-p0-bg)] text-[var(--priority-p0-text)]",
                                dependency.dependentIssue.priority === "P1" &&
                                  "bg-[var(--priority-p1-bg)] text-[var(--priority-p1-text)]",
                                dependency.dependentIssue.priority === "P2" &&
                                  "bg-[var(--priority-p2-bg)] text-[var(--priority-p2-text)]",
                              )}
                            >
                              {dependency.dependentIssue.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-2">{dependency.dependentIssue.title}</h4>
                          {dependentAssignee && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={dependentAssignee.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {dependentAssignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{dependentAssignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />

                      {/* Dependency Issue */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dependency.dependsOnTeam.color }}
                          />
                          <span className="font-medium text-sm">{dependency.dependsOnTeam.name}</span>
                          <span className="text-xs text-muted-foreground">to deliver</span>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {dependency.dependsOnIssue.id}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                dependency.dependsOnIssue.status === "Done" &&
                                  "bg-[var(--status-done-bg)] text-[var(--status-done-text)]",
                                dependency.dependsOnIssue.status === "In Progress" &&
                                  "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]",
                                dependency.dependsOnIssue.status === "Todo" &&
                                  "bg-[var(--status-todo-bg)] text-[var(--status-todo-text)]",
                              )}
                            >
                              {dependency.dependsOnIssue.status}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-2">{dependency.dependsOnIssue.title}</h4>
                          {dependsOnAssignee && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={dependsOnAssignee.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {dependsOnAssignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{dependsOnAssignee.name}</span>
                            </div>
                          )}
                          {dependency.dependsOnIssue.blockedReason && (
                            <div className="mt-2 p-2 bg-[var(--health-blocked-bg)] border border-[var(--health-blocked-border)] rounded-md">
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3 text-[var(--health-blocked-text)]" />
                                <span className="text-xs text-[var(--health-blocked-text)]">
                                  Blocked: {dependency.dependsOnIssue.blockedReason}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {sortedDependencies.length === 0 && (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cross-team dependencies found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-500" />
                <span>Risk Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Click on any area to see tasks at that risk level
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={riskTimelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(data) => {
                    // Determine which area was clicked based on the data
                    if (data && data.activePayload) {
                      const payload = data.activePayload[0].payload as RiskTimelineData
                      // Show dialog with all risk levels for this month
                      const allTasks = [
                        ...payload.criticalTasks,
                        ...payload.highTasks,
                        ...payload.mediumTasks,
                        ...payload.lowTasks,
                      ]
                      if (allTasks.length > 0) {
                        setSelectedRiskData({
                          month: payload.month,
                          riskLevel: "All",
                          tasks: allTasks,
                        })
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Stacked areas for each risk level */}
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                    onClick={(data) => handleAreaClick(data, "low")}
                    style={{ cursor: "pointer" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    onClick={(data) => handleAreaClick(data, "medium")}
                    style={{ cursor: "pointer" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.6}
                    onClick={(data) => handleAreaClick(data, "high")}
                    style={{ cursor: "pointer" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    stackId="1"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.6}
                    onClick={(data) => handleAreaClick(data, "critical")}
                    style={{ cursor: "pointer" }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                  <span>Low Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                  <span>Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                  <span>High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
                  <span>Critical</span>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {riskTimelineData.reduce((sum, d) => sum + d.critical + d.high, 0)} high-priority tasks tracked
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedRiskData} onOpenChange={() => setSelectedRiskData(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRiskData?.riskLevel} Risk Tasks - {selectedRiskData?.month}
            </DialogTitle>
            <DialogDescription>{selectedRiskData?.tasks.length} task(s) at this risk level</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedRiskData?.tasks.map((task) => {
              const assignee = teamMembers.find((m) => m.name === task.assignee)
              const team = teams.find((t) => t.id === task.teamId)

              return (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {task.id}
                        </Badge>
                        {team && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                            <span className="text-xs text-muted-foreground">{team.name}</span>
                          </div>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "text-xs",
                          task.priority === "P0" && "bg-[var(--priority-p0-bg)] text-[var(--priority-p0-text)]",
                          task.priority === "P1" && "bg-[var(--priority-p1-bg)] text-[var(--priority-p1-text)]",
                          task.priority === "P2" && "bg-[var(--priority-p2-bg)] text-[var(--priority-p2-text)]",
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>

                    <div className="flex items-center justify-between">
                      {assignee && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {assignee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{assignee.name}</span>
                        </div>
                      )}

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          task.status === "Done" && "bg-[var(--status-done-bg)] text-[var(--status-done-text)]",
                          task.status === "In Progress" &&
                            "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]",
                          task.status === "Todo" && "bg-[var(--status-todo-bg)] text-[var(--status-todo-text)]",
                        )}
                      >
                        {task.status}
                      </Badge>
                    </div>

                    {task.blockedReason && (
                      <div className="mt-2 p-2 bg-[var(--health-blocked-bg)] border border-[var(--health-blocked-border)] rounded-md">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3 text-[var(--health-blocked-text)]" />
                          <span className="text-xs text-[var(--health-blocked-text)]">
                            Blocked: {task.blockedReason}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
