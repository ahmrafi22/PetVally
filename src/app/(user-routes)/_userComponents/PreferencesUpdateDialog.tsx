"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { toast } from "@/components/ui/use-toast"
import type { User } from "@/types"

type PreferencesUpdateDialogProps = {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUpdate: (updatedUser: User) => void
}

export default function PreferencesUpdateDialog({ isOpen, onClose, user, onUpdate }: PreferencesUpdateDialogProps) {
  const [formData, setFormData] = useState({
    dailyAvailability: "2",
    hasOutdoorSpace: false,
    hasChildren: false,
    hasAllergies: false,
    experienceLevel: "2",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        dailyAvailability: user.dailyAvailability.toString(),
        hasOutdoorSpace: user.hasOutdoorSpace,
        hasChildren: user.hasChildren,
        hasAllergies: user.hasAllergies,
        experienceLevel: user.experienceLevel.toString(),
      })
    }
  }, [user])

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("userToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/users/update-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id,
          dailyAvailability: formData.dailyAvailability,
          hasOutdoorSpace: formData.hasOutdoorSpace,
          hasChildren: formData.hasChildren,
          hasAllergies: formData.hasAllergies,
          experienceLevel: formData.experienceLevel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update preferences")
      }

      const data = await response.json()

      // Call the onUpdate callback with the updated user data
      onUpdate(data.user)

      // toast({
      //   title: "Preferences Updated",
      //   description: "Your preferences have been updated successfully.",
      // })

      onClose()
    } catch (error: any) {
      console.error("Error updating preferences:", error)
      // toast({
      //   title: "Error",
      //   description: error.message || "An error occurred while updating your preferences.",
      //   variant: "destructive",
      // })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Preferences</DialogTitle>
          <DialogDescription>Update your pet care preferences here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dailyAvailability" className="text-right">
                Daily Availability
              </Label>
              <Select value={formData.dailyAvailability} onValueChange={handleSelectChange("dailyAvailability")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="5">5+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experienceLevel" className="text-right">
                Experience Level
              </Label>
              <Select value={formData.experienceLevel} onValueChange={handleSelectChange("experienceLevel")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Beginner</SelectItem>
                  <SelectItem value="2">Intermediate</SelectItem>
                  <SelectItem value="3">Advanced</SelectItem>
                  <SelectItem value="4">Expert</SelectItem>
                  <SelectItem value="5">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasOutdoorSpace" className="text-right">
                Outdoor Space
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="hasOutdoorSpace"
                  checked={formData.hasOutdoorSpace}
                  onCheckedChange={handleSwitchChange("hasOutdoorSpace")}
                />
                <Label htmlFor="hasOutdoorSpace" className="cursor-pointer">
                  {formData.hasOutdoorSpace ? "Yes" : "No"}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasChildren" className="text-right">
                Has Children
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onCheckedChange={handleSwitchChange("hasChildren")}
                />
                <Label htmlFor="hasChildren" className="cursor-pointer">
                  {formData.hasChildren ? "Yes" : "No"}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasAllergies" className="text-right">
                Has Allergies
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="hasAllergies"
                  checked={formData.hasAllergies}
                  onCheckedChange={handleSwitchChange("hasAllergies")}
                />
                <Label htmlFor="hasAllergies" className="cursor-pointer">
                  {formData.hasAllergies ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

