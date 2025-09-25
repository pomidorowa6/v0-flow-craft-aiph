"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, TrendingUp, TrendingDown, AlertTriangle, Star, Target, Activity } from "lucide-react"
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

export function PeopleCapacityView({ teamMembers, teams, issues, sprints }: PeopleCapacityViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const getMemberStats = (member: TeamMember): MemberStats => {
    const memberIssues = issues.filter((issue) => issue.assignee === member.name)
    const sprintIssues = memberIssues.filter((issue) => issue.sprintId === activeSprint?.id)

    const completedIssues = memberIssues.filter((issue) => issue.status === "Done")
    const inProgressIssues = memberIssues.filter((issue) => issue.status === "In Progress")
    const blockedIssues = memberIssues.filter((issue) => issue.blockedReason)

    const utilizationRate = member.capacity > 0 ? (member.currentWorkload / member.capacity) * 100 : 0

    // Mock performance score based on completion rate and utilization
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
    if (utilizationRate >= 100) return { status: "overloaded", color: "text-red-500", bg: "bg-red-50 border-red-200" }
    if (utilizationRate >= 85)
      return { status: "at_capacity", color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" }
    if (utilizationRate >= 60) return { status: "optimal", color: "text-green-500", bg: "bg-green-50 border-green-200" }
    return { status: "underutilized", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" }
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "text-green-600", icon: Star }
    if (score >= 75) return { level: "Good", color: "text-blue-600", icon: TrendingUp }
    if (score >= 60) return { level: "Average", color: "text-yellow-600", icon: Target }
    return { level: "Needs Attention", color: "text-red-600", icon: AlertTriangle }
  }

  const filteredMembers =
    selectedTeam === "all"
      ? teamMembers
      : teamMembers.filter((member) => {
          const team = teams.find((t) => t.memberIds.includes(member.id))
          return team?.id === selectedTeam
        })

  const teamStats = {
    totalMembers: filteredMembers.length,
    overloadedMembers: filteredMembers.filter((m) => getMemberStats(m).utilizationRate >= 100).length,
    underutilizedMembers: filteredMembers.filter((m) => getMemberStats(m).utilizationRate < 60).length,
    avgUtilization:
      filteredMembers.reduce((sum, m) => sum + getMemberStats(m).utilizationRate, 0) / filteredMembers.length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">People & Capacity</h2>
          <p className="text-muted-foreground">Monitor team member workloads and performance</p>
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
        </div>
      </div>

      {/* Team Overview Stats */}
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

      <Tabs defaultValue="capacity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="capacity">Capacity Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="capacity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const stats = getMemberStats(member)
              const capacityStatus = getCapacityStatus(stats.utilizationRate)
              const memberTeam = teams.find((team) => team.memberIds.includes(member.id))

              return (
                <Card key={member.id} className={cn("hover:shadow-md transition-shadow", capacityStatus.bg)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {memberTeam && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: memberTeam.color }} />
                            <span className="text-xs text-muted-foreground">{memberTeam.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Capacity Utilization */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Capacity</span>
                        <span className={capacityStatus.color}>{Math.round(stats.utilizationRate)}%</span>
                      </div>
                      <Progress
                        value={Math.min(stats.utilizationRate, 100)}
                        className={cn(
                          "h-2",
                          stats.utilizationRate >= 100 && "[&>div]:bg-red-500",
                          stats.utilizationRate >= 85 && stats.utilizationRate < 100 && "[&>div]:bg-yellow-500",
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{member.currentWorkload}h used</span>
                        <span>{member.capacity}h total</span>
                      </div>
                    </div>

                    {/* Current Work Status */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold">{stats.totalIssues}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{stats.inProgressIssues}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{stats.completedIssues}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="outline" className={cn("w-full justify-center", capacityStatus.color)}>
                      {capacityStatus.status.replace("_", " ").toUpperCase()}
                    </Badge>

                    {/* Blocked Issues Warning */}
                    {stats.blockedIssues > 0 && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-800">
                          {stats.blockedIssues} blocked issue{stats.blockedIssues > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const stats = getMemberStats(member)
              const performance = getPerformanceLevel(stats.performanceScore)
              const PerformanceIcon = performance.icon
              const memberTeam = teams.find((team) => team.memberIds.includes(member.id))

              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {memberTeam && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: memberTeam.color }} />
                            <span className="text-xs text-muted-foreground">{memberTeam.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Performance Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{Math.round(stats.performanceScore)}</div>
                      <div className="flex items-center justify-center space-x-1">
                        <PerformanceIcon className={cn("h-4 w-4", performance.color)} />
                        <span className={cn("text-sm font-medium", performance.color)}>{performance.level}</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span>
                            {stats.totalIssues > 0 ? Math.round((stats.completedIssues / stats.totalIssues) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={stats.totalIssues > 0 ? (stats.completedIssues / stats.totalIssues) * 100 : 0}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{stats.avgCompletionTime}d</div>
                          <div className="text-xs text-muted-foreground">Avg Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{Math.round(stats.utilizationRate)}%</div>
                          <div className="text-xs text-muted-foreground">Utilization</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const memberTeam = teams.find((team) => team.memberIds.includes(member.id))

              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {memberTeam && (
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: memberTeam.color }} />
                            <span className="text-xs text-muted-foreground">{memberTeam.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Skills */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skills</h4>
                      <div className="space-y-2">
                        {member.skills.map((skill) => (
                          <div key={skill.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{skill.name}</span>
                              <span className="text-muted-foreground">{skill.level}/5</span>
                            </div>
                            <Progress value={(skill.level / 5) * 100} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Availability</span>
                        <Badge
                          variant={member.availability === "Available" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {member.availability}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
