"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Users, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Team, TeamMember, EnhancedIssue, Sprint, TeamHealthStatus } from "@/types"
import { teamHealthColors } from "@/lib/data"

interface ManagementDashboardProps {
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

export function ManagementDashboard({ teams, teamMembers, issues, sprints }: ManagementDashboardProps) {
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

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
      avgCompletionTime: 3.2, // Mock data - would be calculated from actual completion times
      trend: Math.random() > 0.5 ? "up" : "down", // Mock trend data
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

  return (
    <div className="space-y-6">
      
 {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{teams.length}</div>
                <div className="text-xs text-muted-foreground">Active Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{teams.filter((t) => t.healthStatus === "healthy").length}</div>
                <div className="text-xs text-muted-foreground">Healthy Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{issues.filter((issue) => issue.blockedReason).length}</div>
                <div className="text-xs text-muted-foreground">Blocked Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
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
      {/* Team Status Grid */}
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

     
    </div>
  )
}
