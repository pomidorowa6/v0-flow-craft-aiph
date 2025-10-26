"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Users } from "lucide-react"
import { initialTeams, enhancedInitialIssues } from "@/lib/data"

// Analytics data calculations
const calculateTeamMetrics = () => {
  return initialTeams.map((team) => {
    const teamIssues = enhancedInitialIssues.filter((issue) => issue.teamId === team.id)

    const completedIssues = teamIssues.filter((issue) => issue.status === "Done")
    const blockedIssues = teamIssues.filter((issue) => issue.blockedReason)
    const highImpactIssues = teamIssues.filter(
      (issue) => issue.businessImpact === "High" || issue.businessImpact === "Critical",
    )

    const completionRate = teamIssues.length > 0 ? (completedIssues.length / teamIssues.length) * 100 : 0
    const velocityTrend = Math.random() > 0.5 ? "up" : "down" // Simulated
    const burndownHealth = team.healthStatus === "healthy" ? 85 : team.healthStatus === "at_risk" ? 60 : 35

    // Calculate capacity utilization from team members
    const capacityUtilization = Math.floor(Math.random() * 40) + 60 // Simulated 60-100%

    return {
      ...team,
      completionRate,
      velocityTrend,
      burndownHealth,
      capacityUtilization,
      totalIssues: teamIssues.length,
      completedIssues: completedIssues.length,
      blockedIssues: blockedIssues.length,
      highImpactIssues: highImpactIssues.length,
      health: team.healthStatus,
    }
  })
}

// Performance trend data (simulated)
const performanceTrendData = [
  { month: "Jan", velocity: 45, quality: 92, satisfaction: 88 },
  { month: "Feb", velocity: 52, quality: 89, satisfaction: 91 },
  { month: "Mar", velocity: 48, quality: 94, satisfaction: 87 },
  { month: "Apr", velocity: 58, quality: 91, satisfaction: 93 },
  { month: "May", velocity: 61, quality: 96, satisfaction: 89 },
  { month: "Jun", velocity: 55, quality: 93, satisfaction: 95 },
]

// Predictive analytics data
const predictiveData = [
  { sprint: "Current", projected: 85, actual: 82 },
  { sprint: "Next", projected: 88, actual: null },
  { sprint: "Sprint+2", projected: 91, actual: null },
  { sprint: "Sprint+3", projected: 87, actual: null },
]

export default function AdvancedAnalytics() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("6months")
  const [riskColors, setRiskColors] = useState({
    low: "hsl(142, 76%, 36%)", // Green for low risk
    medium: "hsl(38, 92%, 50%)", // Amber for medium risk
    high: "hsl(0, 72%, 51%)", // Red for high risk
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)

      // Get the solid color variants for the chart
      const lowColor = computedStyle.getPropertyValue("--risk-low-solid").trim()
      const mediumColor = computedStyle.getPropertyValue("--risk-medium-solid").trim()
      const highColor = computedStyle.getPropertyValue("--risk-high-solid").trim()

      // Convert OKLCH to usable colors if needed, otherwise use defaults
      if (lowColor && mediumColor && highColor) {
        setRiskColors({
          low: lowColor,
          medium: mediumColor,
          high: highColor,
        })
      }
    }
  }, [])

  const teamMetrics = calculateTeamMetrics()
  const filteredMetrics = selectedTeam === "all" ? teamMetrics : teamMetrics.filter((team) => team.id === selectedTeam)

  const riskData = [
    { name: "Low Risk", value: 65, color: riskColors.low },
    { name: "Medium Risk", value: 25, color: riskColors.medium },
    { name: "High Risk", value: 10, color: riskColors.high },
  ]

  return (
    <div className="space-y-6">
      {/* Header with filters */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Performance Trends with reduced height */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="satisfaction" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Velocity</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">58.2</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93.4%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Satisfaction</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.7%</div>
                <p className="text-xs text-muted-foreground">-1.3% from last month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Risk Assessment</CardTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <Badge variant="secondary">Medium Risk</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {riskData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t text-center">
              <p className="text-sm text-muted-foreground">3 high-risk items require attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Overview Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Performance Overview</CardTitle>
            <div className="flex gap-4">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {initialTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Team</th>
                  <th className="text-left py-3 px-4 font-medium">Members</th>
                  <th className="text-left py-3 px-4 font-medium">Health</th>
                  <th className="text-right py-3 px-4 font-medium">Completion</th>
                  <th className="text-right py-3 px-4 font-medium">Blocked</th>
                  <th className="text-right py-3 px-4 font-medium">High Impact</th>
                  <th className="text-center py-3 px-4 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((team) => (
                  <tr key={team.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="font-medium">{team.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-muted-foreground">{team.memberIds.length}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          team.health === "healthy"
                            ? "default"
                            : team.health === "at_risk"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {team.health}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">{team.completionRate.toFixed(1)}%</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">{team.blockedIssues}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">{team.highImpactIssues}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {team.velocityTrend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
