"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, Trash2, Loader2 } from "lucide-react"

type CreateMissingPostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateMissingPostDialog({ open, onOpenChange, onSuccess }: CreateMissingPostDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    country: "",
    city: "",
    area: "",
    species: "",
    breed: "",
    age: "",
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Please select an image smaller than 5MB.")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please select an image file.")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!previewImage) {
      toast.error("Please upload an image of the missing pet")
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        toast.error("You must be logged in to create a post")
        return
      }

      const response = await fetch("/api/users/missingposts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageBase64: previewImage,
          age: Number.parseInt(formData.age),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create missing pet post")
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        country: "",
        city: "",
        area: "",
        species: "",
        breed: "",
        age: "",
      })
      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Missing pet post created successfully")
      onSuccess()
    } catch (error: any) {
      console.error("Error creating missing pet post:", error)
      toast.error(error.message || "Failed to create missing pet post")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-accent max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Missing Pet</DialogTitle>
          <DialogDescription>
            Fill out the form below to report a missing pet. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 md:col-span-1">
              <div>
                <Label className="mb-2" htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Missing Siamese Cat in Downtown"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the pet, when and where it was last seen, and any distinguishing features"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-2" htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Neighborhood/Area"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-1">
              <div>
                <Label className="mb-2">Pet Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-1">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-40 cursor-pointer"
                      onClick={handleUploadClick}
                    >
                      <Upload className="h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-2" htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                    placeholder="E.g., Dog, Cat"
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="E.g., Siamese, Labrador"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2" htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age in years"
                  required
                />
              </div>
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
                "Report Missing Pet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}