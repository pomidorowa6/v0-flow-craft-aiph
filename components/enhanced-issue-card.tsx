"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, AlertTriangle, Clock, Users, Tag, TrendingUp, Link, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { priorityColors, businessImpactColors } from "@/lib/data"
import type { EnhancedIssue, Sprint, TeamMember, BusinessImpact } from "@/types"

interface EnhancedIssueCardProps {
  issue: EnhancedIssue
  sprints: Sprint[]
  teamMembers: TeamMember[]
  onEdit?: (issue: EnhancedIssue) => void
  onDelete?: (issueId: string) => void
  className?: string
}

export function EnhancedIssueCard({
  issue,
  sprints,
  teamMembers,
  onEdit,
  onDelete,
  className,
}: EnhancedIssueCardProps) {
  const sprint = sprints.find((s) => s.id === issue.sprintId)
  const assignedMember = teamMembers.find((m) => m.name === issue.assignee)
  const stakeholderMembers = teamMembers.filter((m) => issue.stakeholders.includes(m.id))

  const progressPercentage =
    issue.estimatedHours && issue.actualHours ? Math.min((issue.actualHours / issue.estimatedHours) * 100, 100) : 0

  const isOverBudget = issue.estimatedHours && issue.actualHours ? issue.actualHours > issue.estimatedHours : false

  const getBusinessImpactIcon = (impact: BusinessImpact) => {
    switch (impact) {
      case "Critical":
        return <AlertTriangle className="h-3 w-3" />
      case "High":
        return <TrendingUp className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs font-mono">
                {issue.id}
              </Badge>
              {issue.blockedReason && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-sm leading-tight">{issue.title}</h3>

            <p className="text-xs text-muted-foreground line-clamp-2">{issue.description}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={() => onEdit(issue)}>Edit Issue</DropdownMenuItem>}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(issue.id)} className="text-red-600">
                  Delete Issue
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Priority and Business Impact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", priorityColors[issue.priority])}>{issue.priority}</Badge>
            <Badge className={cn("text-xs flex items-center gap-1", businessImpactColors[issue.businessImpact])}>
              {getBusinessImpactIcon(issue.businessImpact)}
              {issue.businessImpact}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              issue.status === "Done" && "bg-green-100 text-green-800 border-green-200",
              issue.status === "In Progress" && "bg-blue-100 text-blue-800 border-blue-200",
              issue.status === "In Review" && "bg-yellow-100 text-yellow-800 border-yellow-200",
              issue.status === "Todo" && "bg-gray-100 text-gray-800 border-gray-200",
            )}
          >
            {issue.status}
          </Badge>
        </div>

        {/* Time Tracking */}
        {(issue.estimatedHours || issue.actualHours) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Time Tracking</span>
              </div>
              <span className={cn(isOverBudget && "text-red-500 font-medium")}>
                {issue.actualHours || 0}h / {issue.estimatedHours || 0}h
              </span>
            </div>
            {issue.estimatedHours && (
              <Progress value={progressPercentage} className={cn("h-1", isOverBudget && "[&>div]:bg-red-500")} />
            )}
          </div>
        )}

        {/* Blocked Status */}
        {issue.blockedReason && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-800">Blocked</p>
                <p className="text-xs text-red-600">{issue.blockedReason}</p>
                {issue.blockedAt && (
                  <p className="text-xs text-red-500 mt-1">Since {issue.blockedAt.toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {issue.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {issue.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {issue.dependencies.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Link className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dependencies</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {issue.dependencies.map((depId) => (
                <Badge key={depId} variant="outline" className="text-xs">
                  {depId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Assignee and Stakeholders */}
        <div className="space-y-3">
          {assignedMember && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignedMember.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {assignedMember.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{assignedMember.name}</p>
                <p className="text-xs text-muted-foreground">{assignedMember.role}</p>
              </div>
            </div>
          )}

          {stakeholderMembers.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Stakeholders</span>
              </div>
              <div className="flex -space-x-1">
                {stakeholderMembers.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-5 w-5 border-2 border-background">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {stakeholderMembers.length > 3 && (
                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{stakeholderMembers.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sprint Assignment */}
        {sprint && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{sprint.name}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                sprint.status === "Active" && "bg-green-100 text-green-800 border-green-200",
                sprint.status === "Planned" && "bg-blue-100 text-blue-800 border-blue-200",
                sprint.status === "Completed" && "bg-gray-100 text-gray-800 border-gray-200",
              )}
            >
              {sprint.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
