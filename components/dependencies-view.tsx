"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitBranch, AlertTriangle, Clock, ArrowRight, Target, CheckCircle, XCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EnhancedIssue, Team, TeamMember, Sprint } from "@/types"

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

export function DependenciesView({ issues, teams, teamMembers, sprints }: DependenciesViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [selectedSprint, setSelectedSprint] = useState<string>("all")

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

  const crossTeamDependencies = getCrossTeamDependencies()
  const dependencyChains = getDependencyChains()

  const filteredDependencies = crossTeamDependencies.filter((dep) => {
    const teamMatch =
      selectedTeam === "all" || dep.dependentTeam.id === selectedTeam || dep.dependsOnTeam.id === selectedTeam
    const sprintMatch =
      selectedSprint === "all" ||
      dep.dependentIssue.sprintId === selectedSprint ||
      dep.dependsOnIssue.sprintId === selectedSprint
    return teamMatch && sprintMatch
  })

  const filteredDependencyChains = dependencyChains.filter((chain) => {
    const teamMatch = selectedTeam === "all" || chain.teams.some((team) => team.id === selectedTeam)
    const sprintMatch = selectedSprint === "all" || chain.issues.some((issue) => issue.sprintId === selectedSprint)
    return teamMatch && sprintMatch
  })

  const filteredCriticalChains = filteredDependencyChains.filter((chain) => chain.criticalPath)

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
        return "text-red-500 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200"
      default:
        return "text-green-500 bg-green-50 border-green-200"
    }
  }

  const getChainStatusColor = (status: string) => {
    switch (status) {
      case "blocked":
        return "text-red-500 bg-red-50 border-red-200"
      case "at_risk":
        return "text-yellow-500 bg-yellow-50 border-yellow-200"
      default:
        return "text-green-500 bg-green-50 border-green-200"
    }
  }

  const dependencyStats = {
    total: crossTeamDependencies.length,
    blocked: crossTeamDependencies.filter((d) => d.status === "blocked").length,
    atRisk: crossTeamDependencies.filter((d) => d.riskLevel === "high").length,
    completed: crossTeamDependencies.filter((d) => d.status === "completed").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cross-Team Dependencies</h2>
          <p className="text-muted-foreground">Track and manage dependencies between teams</p>
        </div>
        <div className="flex items-center space-x-4">
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
      </div>

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

      <Tabs defaultValue="dependencies" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="dependencies">Dependencies Map</TabsTrigger>
            <TabsTrigger value="chains">Dependency Chains</TabsTrigger>
            <TabsTrigger value="critical">Critical Path</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dependencies" className="space-y-4">
          <div className="space-y-4">
            {filteredDependencies.map((dependency, index) => {
              const dependentAssignee = teamMembers.find((m) => m.name === dependency.dependentIssue.assignee)
              const dependsOnAssignee = teamMembers.find((m) => m.name === dependency.dependsOnIssue.assignee)

              return (
                <Card key={index} className={cn("border-l-4", getRiskColor(dependency.riskLevel))}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                dependency.dependentIssue.priority === "P0" && "bg-red-500",
                                dependency.dependentIssue.priority === "P1" && "bg-orange-500",
                                dependency.dependentIssue.priority === "P2" && "bg-yellow-500",
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
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>

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
                                dependency.dependsOnIssue.status === "Done" && "bg-green-500",
                                dependency.dependsOnIssue.status === "In Progress" && "bg-blue-500",
                                dependency.dependsOnIssue.status === "Todo" && "bg-gray-500",
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
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-800">
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

            {filteredDependencies.length === 0 && (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cross-team dependencies found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <div className="space-y-4">
            {filteredDependencyChains.map((chain) => (
              <Card key={chain.id} className={cn("border-l-4", getChainStatusColor(chain.status))}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{chain.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {chain.criticalPath && (
                        <Badge variant="destructive" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Critical Path
                        </Badge>
                      )}
                      <Badge variant="outline" className={getChainStatusColor(chain.status)}>
                        {chain.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teams Involved */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Teams Involved</h4>
                    <div className="flex space-x-2">
                      {chain.teams.map((team) => (
                        <Badge key={team.id} variant="secondary" className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                          <span>{team.name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Chain Issues */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Issue Chain ({chain.issues.length} issues)</h4>
                    <div className="space-y-2">
                      {chain.issues.map((issue, index) => {
                        const team = teams.find((t) => t.id === issue.teamId)
                        const assignee = teamMembers.find((m) => m.name === issue.assignee)

                        return (
                          <div key={issue.id} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-md">
                            <div className="text-sm font-mono text-muted-foreground">{index + 1}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {issue.id}
                                </Badge>
                                {team && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                                    <span className="text-xs text-muted-foreground">{team.name}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-medium">{issue.title}</p>
                              {assignee && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Avatar className="h-4 w-4">
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
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                issue.status === "Done" && "bg-green-100 text-green-800",
                                issue.status === "In Progress" && "bg-blue-100 text-blue-800",
                                issue.blockedReason && "bg-red-100 text-red-800",
                              )}
                            >
                              {issue.blockedReason ? "Blocked" : issue.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Duration Estimate */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Estimated Duration</span>
                    <span className="text-sm font-medium">{chain.estimatedDuration}h</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDependencyChains.length === 0 && (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No dependency chains found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="space-y-4">
            {filteredCriticalChains.map((chain) => (
              <Card key={chain.id} className="border-l-4 border-l-red-500 bg-red-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Target className="h-5 w-5 text-red-500" />
                      <span>{chain.name}</span>
                    </CardTitle>
                    <Badge variant="destructive">Critical Path</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{chain.issues.length}</div>
                      <div className="text-xs text-muted-foreground">Issues in Chain</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{chain.teams.length}</div>
                      <div className="text-xs text-muted-foreground">Teams Involved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{chain.estimatedDuration}h</div>
                      <div className="text-xs text-muted-foreground">Est. Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCriticalChains.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No critical path dependencies identified.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
