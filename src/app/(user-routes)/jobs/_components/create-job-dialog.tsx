"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateJobDialog({ open, onOpenChange, onSubmit }: CreateJobDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    country: "",
    city: "",
    area: "",
    priceRangeLow: "",
    priceRangeHigh: "",
    startDate: new Date().toISOString().split('T')[0], 
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    currentTag: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
   
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.currentTag.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(formData.currentTag.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, prev.currentTag.trim()],
          currentTag: "",
        }))
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.tags.length === 0) newErrors.tags = "At least one tag is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.area.trim()) newErrors.area = "Area is required"
    if (!formData.priceRangeLow.trim()) newErrors.priceRangeLow = "Minimum price is required"
    if (!formData.priceRangeHigh.trim()) newErrors.priceRangeHigh = "Maximum price is required"

    const lowPrice = Number.parseFloat(formData.priceRangeLow)
    const highPrice = Number.parseFloat(formData.priceRangeHigh)

    if (isNaN(lowPrice) || lowPrice <= 0) newErrors.priceRangeLow = "Please enter a valid price"
    if (isNaN(highPrice) || highPrice <= 0) newErrors.priceRangeHigh = "Please enter a valid price"
    if (lowPrice >= highPrice) newErrors.priceRangeHigh = "Maximum price must be greater than minimum price"

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (isNaN(startDate.getTime())) newErrors.startDate = "Please enter a valid start date"
    if (isNaN(endDate.getTime())) newErrors.endDate = "Please enter a valid end date"

    if (startDate >= endDate) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const { currentTag, ...dataToSubmit } = formData
      onSubmit({
        ...dataToSubmit,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        priceRangeLow: Number(formData.priceRangeLow),
        priceRangeHigh: Number(formData.priceRangeHigh)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Pet Care Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Dog Walker Needed for Weekdays"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the job requirements, pet details, and any special instructions"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Service Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
            <Input
              id="currentTag"
              name="currentTag"
              placeholder="Add tags (e.g., walking, feeding) and press Enter"
              value={formData.currentTag}
              onChange={handleChange}
              onKeyDown={handleAddTag}
            />
            {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
              />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area/Neighborhood</Label>
              <Input id="area" name="area" placeholder="Area" value={formData.area} onChange={handleChange} />
              {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceRangeLow">Minimum Budget ($)</Label>
              <Input
                id="priceRangeLow"
                name="priceRangeLow"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min $"
                value={formData.priceRangeLow}
                onChange={handleChange}
              />
              {errors.priceRangeLow && <p className="text-sm text-red-500">{errors.priceRangeLow}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRangeHigh">Maximum Budget ($)</Label>
              <Input
                id="priceRangeHigh"
                name="priceRangeHigh"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max $"
                value={formData.priceRangeHigh}
                onChange={handleChange}
              />
              {errors.priceRangeHigh && <p className="text-sm text-red-500">{errors.priceRangeHigh}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Post Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}