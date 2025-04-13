"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Trash2, Upload, PlusCircle, RefreshCw, AlertTriangle } from "lucide-react"
import type { Pet } from "@/types"

export default function PetAddPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "1",
    price: "",
    bio: "",
    description: "",
    energyLevel: "3",
    spaceRequired: "3",
    maintenance: "3",
    childFriendly: true,
    allergySafe: false,
    neutered: false,
    vaccinated: false,
    tags: "",
  })

  // Fetch available pets
  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/pets?onlyAvailable=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch pets")
      }

      const data = await response.json()
      setPets(data.pets)
    } catch (error) {
      console.error("Error fetching pets:", error)
      toast.error("Failed to load pets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    fileInputRef.current?.click()
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, tags: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!previewImage) {
      toast.error("Please upload an image for the pet")
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("adminToken")

      // Process tags - split by comma and trim whitespace
      const processedTags = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : []

      const response = await fetch("/api/admin/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          age: Number.parseInt(formData.age),
          price: Number.parseFloat(formData.price),
          energyLevel: Number.parseInt(formData.energyLevel),
          spaceRequired: Number.parseInt(formData.spaceRequired),
          maintenance: Number.parseInt(formData.maintenance),
          imageBase64: previewImage,
          tags: processedTags,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add pet")
      }

      // Reset form
      setFormData({
        name: "",
        breed: "",
        age: "1",
        price: "",
        bio: "",
        description: "",
        energyLevel: "3",
        spaceRequired: "3",
        maintenance: "3",
        childFriendly: true,
        allergySafe: false,
        neutered: false,
        vaccinated: false,
        tags: "",
      })
      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Pet added successfully")

      // Refresh pet list
      fetchPets()
    } catch (error: any) {
      console.error("Error adding pet:", error)
      toast.error(error.message || "Failed to add pet")
    } finally {
      setSubmitting(false)
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (pet: Pet) => {
    setPetToDelete(pet)
    setDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!petToDelete) return

    setDeleting(petToDelete.id)
    setDeleteDialogOpen(false)

    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`/api/admin/pets/${petToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete pet")
      }

      toast.success("Pet deleted successfully")

      // Refresh pet list
      fetchPets()
    } catch (error: any) {
      console.error("Error deleting pet:", error)
      toast.error(error.message || "Failed to delete pet")
    } finally {
      setDeleting(null)
      setPetToDelete(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto ">
      <h1 className="text-3xl font-bold mb-8 text-purple-800">Pet Management</h1>

      {/* Add Pet Form */}
      <div className="bg-[#ebebf5ef] shadow-lg rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6 flex items-center text-purple-700">
          <PlusCircle className="mr-3 h-6 w-6 text-purple-500" />
          Add New Pet
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              {/* Basic Information */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Pet Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="breed" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Breed/Species
                </Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Age (years)
                  </Label>
                  <Select value={formData.age} onValueChange={handleSelectChange("age")}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Short Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  placeholder="A brief description of the pet"
                  className="resize-none h-20 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Detailed information about the pet"
                  className="resize-none h-32 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="e.g., dog, friendly, playful, trained"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add descriptive tags separated by commas (e.g., dog, friendly, playful)
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block text-gray-700">Pet Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                  {previewImage ? (
                    <div className="relative w-full h-52 mb-4">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
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
                    <div className="text-center cursor-pointer py-6" onClick={handleUploadClick}>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleUploadClick}>
                        Select Image
                      </Button>
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

              {/* Compatibility Attributes */}
              <h3 className="font-medium text-gray-700 mb-3 mt-6">Compatibility Attributes</h3>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="energyLevel" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Energy Level
                  </Label>
                  <Select value={formData.energyLevel} onValueChange={handleSelectChange("energyLevel")}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very Low</SelectItem>
                      <SelectItem value="2">2 - Low</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="spaceRequired" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Space Required
                  </Label>
                  <Select value={formData.spaceRequired} onValueChange={handleSelectChange("spaceRequired")}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very Small</SelectItem>
                      <SelectItem value="2">2 - Small</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - Large</SelectItem>
                      <SelectItem value="5">5 - Very Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="maintenance" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Maintenance Level
                </Label>
                <Select value={formData.maintenance} onValueChange={handleSelectChange("maintenance")}>
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-6">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="childFriendly"
                    checked={formData.childFriendly}
                    onCheckedChange={handleSwitchChange("childFriendly")}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor="childFriendly" className="text-sm font-medium text-gray-700">
                    Child Friendly
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="allergySafe"
                    checked={formData.allergySafe}
                    onCheckedChange={handleSwitchChange("allergySafe")}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor="allergySafe" className="text-sm font-medium text-gray-700">
                    Allergy Safe
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="neutered" checked={formData.neutered} onCheckedChange={handleSwitchChange("neutered")} />
                  <Label htmlFor="neutered">Neutered/Spayed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vaccinated"
                    checked={formData.vaccinated}
                    onCheckedChange={handleSwitchChange("vaccinated")}
                  />
                  <Label htmlFor="vaccinated">Vaccinated</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-[200px]  bg-purple-600 hover:bg-purple-700 mt-8 py-4 text-lg font-medium"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Adding Pet...
                </>
              ) : (
                "Add Pet"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Available Pets List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-purple-800">Available Pets</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPets}
            className="flex items-center border-purple-300 hover:bg-purple-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            No pets available. Add a new pet above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200">
                  <img
                    src={pet.images || "/placeholder.svg?height=200&width=200"}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{pet.name}</h3>
                    <span className="text-green-600 font-bold">${pet.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600">{pet.breed}</p>
                  <p className="text-gray-500 text-sm">
                    Age: {pet.age} {pet.age === 1 ? "year" : "years"}
                  </p>

                  {/* Health status */}
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${pet.vaccinated ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${pet.neutered ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {pet.neutered ? "Neutered" : "Not Neutered"}
                    </span>
                  </div>

                  {/* Tags */}
                  {pet.tags && pet.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pet.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {pet.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          +{pet.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(pet)}
                      disabled={deleting === pet.id}
                      className="flex items-center"
                    >
                      {deleting === pet.id ? (
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-3 w-3" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {petToDelete && (
            <div className="flex items-center gap-4 py-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={petToDelete.images || "/placeholder.svg?height=64&width=64"}
                  alt={petToDelete.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{petToDelete.name}</h4>
                <p className="text-sm text-gray-500">{petToDelete.breed}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
