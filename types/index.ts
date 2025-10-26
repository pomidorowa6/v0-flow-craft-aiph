export type Priority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5"
export type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done" | "Blocked"
export type SprintStatus = "Planned" | "Active" | "Completed"

export interface Issue {
  id: string
  title: string
  description: string
  priority: Priority
  status: IssueStatus
  assignee: string
  sprintId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Sprint {
  id: string
  no: string | number
  title: string
  name: string // keeping for backward compatibility
  status: SprintStatus
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export type BusinessImpact = "Critical" | "High" | "Medium" | "Low"
export type NotificationType = "blocker" | "capacity" | "cross_team" | "weekly_digest"
export type NotificationStatus = "unread" | "read" | "dismissed"
export type TeamHealthStatus = "healthy" | "at_risk" | "blocked"
export type DependencyStatus = "pending" | "in_progress" | "completed" | "blocked"

export interface Team {
  id: string
  name: string
  description: string
  color: string
  leadId: string
  memberIds: string[]
  healthStatus: TeamHealthStatus
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  skills: string[]
  capacity: number // hours per sprint
  currentWorkload: number // current hours assigned
  teamIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface EnhancedIssue extends Issue {
  businessImpact: BusinessImpact
  stakeholders: string[]
  dependencies: string[]
  estimatedHours?: number
  actualHours?: number
  teamId?: string
  tags: string[]
  blockedReason?: string
  blockedAt?: Date
}

export interface Dependency {
  id: string
  fromIssueId: string
  toIssueId: string
  type: "blocks" | "depends_on"
  status: DependencyStatus
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  status: NotificationStatus
  recipientIds: string[]
  relatedEntityId?: string
  relatedEntityType?: "issue" | "sprint" | "team"
  createdAt: Date
  readAt?: Date
}

export interface TeamMetrics {
  teamId: string
  sprintId: string
  totalIssues: number
  completedIssues: number
  blockedIssues: number
  averageCompletionTime: number
  capacityUtilization: number
  burndownData: { date: Date; remaining: number }[]
  createdAt: Date
}

export type ViewType =
  | "issues"
  | "current-sprint"
  | "sprints"
  | "management"
  | "team-capacity" // Renamed from "people" to "team-capacity"
  | "dependencies"
  | "analytics"
  | "reports"
