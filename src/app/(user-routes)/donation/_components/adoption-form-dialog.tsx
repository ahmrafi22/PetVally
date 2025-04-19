"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type AdoptionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  onSuccess: () => void
}

export function AdoptionFormDialog({ open, onOpenChange, postId, onSuccess }: AdoptionFormDialogProps) {
  const [description, setDescription] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !meetingDate || !meetingTime) {
      toast.error("Please fill out all fields")
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        toast.error("You must be logged in to apply")
        return
      }

      // Combine date and time into a single Date object
      const meetingSchedule = new Date(`${meetingDate}T${meetingTime}`)

      const response = await fetch(`/api/users/donation/${postId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          meetingSchedule,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit application")
      }

      // Reset form
      setDescription("")
      setMeetingDate("")
      setMeetingTime("")

      onSuccess()
    } catch (error: any) {
      console.error("Error submitting application:", error)
      toast.error(error.message || "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Adopt</DialogTitle>
          <DialogDescription>
            Tell us why you want to adopt this pet and schedule a meeting with the current owner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Why do you want to adopt this pet?
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your lifestyle, experience with pets, and why you're interested in this pet..."
              className="mt-1 min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meetingDate" className="text-sm font-medium">
                Meeting Date
              </Label>
              <input
                id="meetingDate"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="meetingTime" className="text-sm font-medium">
                Meeting Time
              </Label>
              <input
                id="meetingTime"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
