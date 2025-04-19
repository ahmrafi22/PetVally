"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, UploadCloud } from "lucide-react"
import { Switch } from "@/components/ui/switch"

type DonationPost = {
  id: string
  title: string
  description: string
  images: string
  country: string
  city: string
  area: string
  isAvailable: boolean
  upvotesCount: number
  species: string
  breed: string
  gender: string
  age: number
  vaccinated: boolean
  neutered: boolean
  user: {
    id: string
    name: string
    image: string | null
  }
  comments: any[]
  adoptionForms: any[]
  _count: {
    comments: number
    adoptionForms: number
  }
  createdAt: string
}

type UpdateDonationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: DonationPost
  onSuccess: () => void
}

export function UpdateDonationDialog({ open, onOpenChange, post, onSuccess }: UpdateDonationDialogProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    imageBase64: string | null
    country: string
    city: string
    area: string
    species: string
    breed: string
    gender: string
    age: number
    vaccinated: boolean
    neutered: boolean
    isAvailable: boolean
  }>({
    title: "",
    description: "",
    imageBase64: null,
    country: "",
    city: "",
    area: "",
    species: "",
    breed: "",
    gender: "",
    age: 0,
    vaccinated: false,
    neutered: false,
    isAvailable: true,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAcceptedApplicants, setHasAcceptedApplicants] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load post data when dialog opens
  useEffect(() => {
    if (open && post) {
      setFormData({
        title: post.title || "",
        description: post.description || "",
        imageBase64: null, // We don't pre-load the image as base64
        country: post.country || "",
        city: post.city || "",
        area: post.area || "",
        species: post.species || "",
        breed: post.breed || "",
        gender: post.gender || "",
        age: post.age || 0,
        vaccinated: post.vaccinated || false,
        neutered: post.neutered || false,
        isAvailable: post.isAvailable,
      })
      setImagePreview(post.images || null)

      // Check if there are any accepted applications
      const hasAccepted = post.adoptionForms?.some(form => form.status === "ACCEPTED");
      setHasAcceptedApplicants(hasAccepted);
    }
  }, [open, post])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImagePreview(result)
      setFormData((prev) => ({
        ...prev,
        imageBase64: result,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        toast.error("You must be logged in")
        return
      }

      // Create the update data object (only send fields that have changed)
      const updateData: any = {}
      
      // Only include fields that have changed
      Object.keys(formData).forEach((key) => {
        const formKey = key as keyof typeof formData
        
        // Special case for imageBase64 - only include if it's not null
        if (key === 'imageBase64') {
          if (formData.imageBase64) {
            updateData[key] = formData.imageBase64;
          }
          return;
        }
        
        // For all other fields - include if they've changed
        if (formData[formKey] !== post[formKey as keyof typeof post]) {
          updateData[key] = formData[formKey];
        }
      });

      // Don't submit if nothing has changed
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes were made")
        onOpenChange(false)
        return
      }

      const response = await fetch(`/api/users/donation/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update donation post")
      }

      toast.success("Donation post updated successfully")
      onSuccess()
    } catch (error: any) {
      console.error("Error updating donation post:", error)
      toast.error(error.message || "Failed to update the donation post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Pet Donation Post</DialogTitle>
          <DialogDescription>
            Update the details of your pet donation post. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title*
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title of your donation post"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description*
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about the pet"
                required
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  Country*
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium">
                  City*
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="area" className="text-sm font-medium">
                  Area*
                </Label>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Area/District"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="species" className="text-sm font-medium">
                  Species*
                </Label>
                <Input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  placeholder="E.g., Dog, Cat"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="breed" className="text-sm font-medium">
                  Breed
                </Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="Breed"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium">
                  Age (years)*
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleNumberChange}
                  placeholder="Age in years"
                  required
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender*
              </Label>
              <Select value={formData.gender} onValueChange={handleSelectChange("gender")}>
                <SelectTrigger id="gender" className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="vaccinated"
                  checked={formData.vaccinated}
                  onCheckedChange={(checked) => handleCheckboxChange("vaccinated", !!checked)}
                />
                <Label htmlFor="vaccinated">Vaccinated</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="neutered"
                  checked={formData.neutered}
                  onCheckedChange={(checked) => handleCheckboxChange("neutered", !!checked)}
                />
                <Label htmlFor="neutered">Neutered/Spayed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => handleCheckboxChange("isAvailable", !!checked)}
                  disabled={hasAcceptedApplicants}
                />
                <Label 
                  htmlFor="isAvailable" 
                  className={hasAcceptedApplicants ? "text-gray-400" : ""}
                >
                  Available for Adoption
                  {hasAcceptedApplicants && (
                    <span className="block text-xs text-gray-500">
                      (Cannot change - adoption already accepted)
                    </span>
                  )}
                </Label>
              </div>
            </div>

            <div>
              <div className="mt-1 flex items-center justify-center">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 transition hover:border-gray-400">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition">
                          <p className="text-white text-center text-sm">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <UploadCloud className="h-8 w-8 mb-1" />
                        <p className="text-sm">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                    ref={fileInputRef}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max file size: 5MB. Recommended dimensions: 800x600 px.
              </p>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}