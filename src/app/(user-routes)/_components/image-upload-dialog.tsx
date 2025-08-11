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
import { Camera, Upload } from "lucide-react"
import { toast } from "sonner" 
import type { User } from "@/types"

type ImageUploadDialogProps = {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUpdate: (updatedUser: User) => void
}

export default function ImageUploadDialog({ isOpen, onClose, user, onUpdate }: ImageUploadDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Invalid file format. Please select an image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !previewImage) return

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("userToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/users/update-image", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id,
          imageBase64: previewImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile image")
      }

      const data = await response.json()

      // Create a new user object with the updated image
      const updatedUser = {
        ...user,
        image: data.imageUrl || data.user?.image || previewImage
      }

    
      onUpdate(updatedUser)
      
  
      toast.success("Profile image updated successfully", {
        description: "Your new profile picture has been saved.",
        duration: 3000,
      })

  
      setPreviewImage(null)
      onClose()
    } catch (error: any) {
      console.error("Error updating profile image:", error)
      setError(error.message || "Failed to update profile image")
      
      // Show error toast with Sonner
      toast.error("Failed to update profile image", {
        description: error.message || "Please try again later.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset error and preview when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null)
      setPreviewImage(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : user?.image ? (
                  <img
                    src={user.image}
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
                  className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-md flex items-center gap-2 hover:bg-blue-100"
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
                
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !previewImage}>
              {isLoading ? "Uploading..." : "Upload Image"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}