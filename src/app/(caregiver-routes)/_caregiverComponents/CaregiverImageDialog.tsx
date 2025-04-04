"use client"

import type React from "react"

import { useState, useRef } from "react"
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
// import { toast } from "@/components/ui/use-toast"
import { Camera, Upload } from "lucide-react"
import type { Caregiver } from "@/types"

type CaregiverImageDialogProps = {
  isOpen: boolean
  onClose: () => void
  caregiver: Caregiver | null
  onUpdate: (updatedCaregiver: Caregiver) => void
}

export default function CaregiverImageDialog({ isOpen, onClose, caregiver, onUpdate }: CaregiverImageDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
    //   toast({
    //     title: "File too large",
    //     description: "Please select an image smaller than 5MB.",
    //     variant: "destructive",
    //   })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
    //   toast({
    //     title: "Invalid file type",
    //     description: "Please select an image file.",
    //     variant: "destructive",
    //   })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!caregiver || !previewImage) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("caregiverToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/caregivers/update-image", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: caregiver.id,
          imageBase64: previewImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile image")
      }

      const data = await response.json()

      // Call the onUpdate callback with the updated caregiver data
      onUpdate(data.caregiver)

    //   toast({
    //     title: "Profile Image Updated",
    //     description: "Your profile image has been updated successfully.",
    //   })

      onClose()
    } catch (error: any) {
      console.error("Error updating profile image:", error)
    //   toast({
    //     title: "Error",
    //     description: error.message || "An error occurred while updating your profile image.",
    //     variant: "destructive",
    //   })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>Upload a new profile picture.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                {previewImage ? (
                  <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                ) : caregiver?.image ? (
                  <img
                    src={caregiver.image || "/placeholder.svg"}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Camera size={40} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <Label
                  htmlFor="picture"
                  className="cursor-pointer px-4 py-2 bg-green-50 text-green-600 rounded-md flex items-center gap-2 hover:bg-green-100"
                >
                  <Upload size={16} />
                  Choose Image
                </Label>
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !previewImage} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Uploading..." : "Upload Image"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

