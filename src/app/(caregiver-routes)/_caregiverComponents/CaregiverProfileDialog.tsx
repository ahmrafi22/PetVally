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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { toast } from "@/components/ui/use-toast"
import type { Caregiver } from "@/types"

type CaregiverProfileDialogProps = {
  isOpen: boolean
  onClose: () => void
  caregiver: Caregiver | null
  onUpdate: (updatedCaregiver: Caregiver) => void
}

export default function CaregiverProfileDialog({ isOpen, onClose, caregiver, onUpdate }: CaregiverProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    area: "",
    bio: "",
    hourlyRate: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (caregiver) {
      setFormData({
        name: caregiver.name || "",
        country: caregiver.country || "",
        city: caregiver.city || "",
        area: caregiver.area || "",
        bio: caregiver.bio || "",
        hourlyRate: caregiver.hourlyRate?.toString() || "",
      })
    }
  }, [caregiver])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!caregiver) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("caregiverToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/caregivers/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: caregiver.id,
          name: formData.name,
          country: formData.country,
          city: formData.city,
          area: formData.area,
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      const data = await response.json()

      // Call the onUpdate callback with the updated caregiver data
      onUpdate(data.caregiver)

    //   toast({
    //     title: "Profile Updated",
    //     description: "Your profile has been updated successfully.",
    //   })

      onClose()
    } catch (error: any) {
      console.error("Error updating profile:", error)
    //   toast({
    //     title: "Error",
    //     description: error.message || "An error occurred while updating your profile.",
    //     variant: "destructive",
    //   })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Caregiver Profile</DialogTitle>
          <DialogDescription>Update your profile information here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Area
              </Label>
              <Input id="area" name="area" value={formData.area} onChange={handleChange} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate ($)
              </Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="bio" className="text-right pt-2">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="col-span-3 min-h-[100px]"
                placeholder="Tell us about yourself, your experience, and what makes you a great caregiver."
              />
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

