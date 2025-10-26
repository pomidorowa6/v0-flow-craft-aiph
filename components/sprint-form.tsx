"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Sprint } from "@/types"

interface SprintFormProps {
  sprint?: Sprint
  sprints?: Sprint[] // Added sprints array to calculate next sprint number
  onSubmit: (sprintData: Partial<Sprint>) => void
  trigger?: React.ReactNode
}

export function SprintForm({ sprint, sprints = [], onSubmit, trigger }: SprintFormProps) {
  const getNextSprintNumber = () => {
    if (sprints.length === 0) return 1
    const maxSprintNo = Math.max(
      ...sprints.map((s) => (typeof s.no === "number" ? s.no : Number.parseInt(s.no.toString()) || 0)),
    )
    return maxSprintNo + 1
  }

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    no: sprint?.no?.toString() || getNextSprintNumber().toString(), // Added sprint number field
    title: sprint?.title || "", // Added sprint title field
    name: sprint?.name || "", // Keep for backward compatibility
    startDate: sprint?.startDate ? sprint.startDate.toISOString().split("T")[0] : "",
    endDate: sprint?.endDate ? sprint.endDate.toISOString().split("T")[0] : "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.no.trim()) {
      newErrors.no = "Sprint number is required"
    } else if (isNaN(Number(formData.no)) || Number(formData.no) <= 0) {
      newErrors.no = "Sprint number must be a positive number"
    } else if (!sprint && sprints.some((s) => s.no.toString() === formData.no)) {
      newErrors.no = "Sprint number already exists"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Sprint title is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const sprintNumber = Number(formData.no)
    const generatedName = `${sprintNumber} - ${formData.title}`

    onSubmit({
      ...formData,
      no: sprintNumber,
      title: formData.title,
      name: generatedName, // Generate name in format "{no} - {title}"
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    })

    setOpen(false)
    if (!sprint) {
      // Reset form for new sprints with next number
      const nextNumber = getNextSprintNumber()
      setFormData({
        no: nextNumber.toString(),
        title: "",
        name: "",
        startDate: "",
        endDate: "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Create Sprint</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{sprint ? "Edit Sprint" : "Create New Sprint"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="no">Sprint Number</Label>
            <Input
              id="no"
              type="number"
              min="1"
              value={formData.no}
              onChange={(e) => setFormData({ ...formData, no: e.target.value })}
              placeholder="Enter sprint number"
              className={errors.no ? "border-red-500" : ""}
            />
            {errors.no && <p className="text-sm text-red-500">{errors.no}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Sprint Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter sprint title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {formData.no && formData.title && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Sprint Name Preview</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {formData.no} - {formData.title}
              </div>
            </div>
          )}

          

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={errors.startDate ? "border-red-500" : ""}
            />
            {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={errors.endDate ? "border-red-500" : ""}
            />
            {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{sprint ? "Update Sprint" : "Create Sprint"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
