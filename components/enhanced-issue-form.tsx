"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X, Plus, Tag, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EnhancedIssue, Priority, BusinessImpact, Sprint, TeamMember, Team } from "@/types"

interface EnhancedIssueFormProps {
  issue?: EnhancedIssue
  sprints: Sprint[]
  teams: Team[]
  teamMembers: TeamMember[]
  onSubmit: (issueData: Partial<EnhancedIssue>) => void
  onCancel: () => void
  trigger?: React.ReactNode
}

export function EnhancedIssueForm({
  issue,
  sprints,
  teams,
  teamMembers,
  onSubmit,
  onCancel,
  trigger,
}: EnhancedIssueFormProps) {
  const [formData, setFormData] = useState<Partial<EnhancedIssue>>({
    title: issue?.title || "",
    description: issue?.description || "",
    priority: issue?.priority || "P3",
    status: issue?.status || "Todo",
    assignee: issue?.assignee || "",
    businessImpact: issue?.businessImpact || "Medium",
    stakeholders: issue?.stakeholders || [],
    dependencies: issue?.dependencies || [],
    estimatedHours: issue?.estimatedHours || undefined,
    teamId: issue?.teamId || "defaultTeamId", // Updated default value to be a non-empty string
    tags: issue?.tags || [],
    sprintId: issue?.sprintId || "defaultSprintId", // Updated default value to be a non-empty string
    blockedReason: issue?.blockedReason || "",
  })

  const [newTag, setNewTag] = useState("")
  const [newDependency, setNewDependency] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setIsOpen(false)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies?.includes(newDependency.trim())) {
      setFormData((prev) => ({
        ...prev,
        dependencies: [...(prev.dependencies || []), newDependency.trim()],
      }))
      setNewDependency("")
    }
  }

  const removeDependency = (depToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies?.filter((dep) => dep !== depToRemove) || [],
    }))
  }

  const toggleStakeholder = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      stakeholders: prev.stakeholders?.includes(memberId)
        ? prev.stakeholders.filter((id) => id !== memberId)
        : [...(prev.stakeholders || []), memberId],
    }))
  }

  const selectedTeam = teams.find((team) => team.id === formData.teamId)
  const availableMembers = selectedTeam
    ? teamMembers.filter((member) => selectedTeam.memberIds.includes(member.id))
    : teamMembers

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Enter issue title"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the issue in detail"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Priority) => setFormData((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P0">P0 - Critical</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
                <SelectItem value="P4">P4 - Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="businessImpact">Business Impact</Label>
            <Select
              value={formData.businessImpact}
              onValueChange={(value: BusinessImpact) => setFormData((prev) => ({ ...prev, businessImpact: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Team and Assignment */}
      <div className="space-y-4">
        <h3 className="font-medium">Team & Assignment</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="team">Team</Label>
            <Select
              value={formData.teamId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value, assignee: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
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

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={formData.assignee}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, assignee: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stakeholders */}
        <div>
          <Label>Stakeholders</Label>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              {formData.stakeholders?.map((stakeholderId) => {
                const member = teamMembers.find((m) => m.id === stakeholderId)
                return member ? (
                  <Badge key={stakeholderId} variant="secondary" className="flex items-center gap-1">
                    <Avatar className="h-3 w-3">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {member.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStakeholder(stakeholderId)} />
                  </Badge>
                ) : null
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-muted",
                    formData.stakeholders?.includes(member.id) && "bg-blue-50 border border-blue-200",
                  )}
                  onClick={() => toggleStakeholder(member.id)}
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Time and Planning */}
      <div className="space-y-4">
        <h3 className="font-medium">Time & Planning</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              value={formData.estimatedHours || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedHours: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="sprint">Sprint</Label>
            <Select
              value={formData.sprintId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, sprintId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defaultSprintId">No Sprint</SelectItem>{" "}
                {/* Updated value to be a non-empty string */}
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tags and Dependencies */}
      <div className="space-y-4">
        <h3 className="font-medium">Tags & Dependencies</h3>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <Label>Dependencies</Label>
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1">
              {formData.dependencies?.map((dep) => (
                <Badge key={dep} variant="outline" className="flex items-center gap-1">
                  {dep}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeDependency(dep)} />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                placeholder="Add dependency (e.g., TSK-001)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDependency())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addDependency}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Status */}
      {issue && (
        <>
          <Separator />
          <div>
            <Label htmlFor="blockedReason">Blocked Reason</Label>
            <Textarea
              id="blockedReason"
              value={formData.blockedReason}
              onChange={(e) => setFormData((prev) => ({ ...prev, blockedReason: e.target.value }))}
              placeholder="Describe why this issue is blocked (leave empty if not blocked)"
              rows={2}
            />
            {formData.blockedReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-800">This issue will be marked as blocked</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCancel()
            setIsOpen(false)
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{issue ? "Update Issue" : "Create Issue"}</Button>
      </div>
    </form>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{issue ? "Edit Issue" : "Create New Issue"}</DialogTitle>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{issue ? "Edit Issue" : "Create New Issue"}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormContent />
      </CardContent>
    </Card>
  )
}
