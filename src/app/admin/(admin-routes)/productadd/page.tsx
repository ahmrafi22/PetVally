"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Trash2, Upload, PlusCircle, RefreshCw, AlertTriangle, Edit, Check } from "lucide-react"
import type { Product } from "@/types"

export default function ProductAddPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "food", // Default category
  })

  //  state for the update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null)
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "food",
  })
  const [updatePreviewImage, setUpdatePreviewImage] = useState<string | null>(null)
  const updateFileInputRef = useRef<HTMLInputElement>(null)
  const [updating, setUpdating] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
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

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!previewImage) {
      toast.error("Please upload an image for the product")
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          imageBase64: previewImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add product")
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "food",
      })
      setPreviewImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Product added successfully")

      // Refresh product list
      fetchProducts()
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast.error(error.message || "Failed to add product")
    } finally {
      setSubmitting(false)
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  //  function to open the update dialog
  const openUpdateDialog = (product: Product) => {
    setProductToUpdate(product)
    setUpdateFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    })
    setUpdatePreviewImage(product.image ?? null)
    setUpdateDialogOpen(true)
  }

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!productToDelete) return

    setDeleting(productToDelete.id)
    setDeleteDialogOpen(false)

    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete product")
      }

      toast.success("Product deleted successfully")

      // Refresh product list
      fetchProducts()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast.error(error.message || "Failed to delete product")
    } finally {
      setDeleting(null)
      setProductToDelete(null)
    }
  }

  //  function to handle update form input changes
  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUpdateFormData((prev) => ({ ...prev, [name]: value }))
  }

  //  function to handle update form select changes
  const handleUpdateSelectChange = (name: string) => (value: string) => {
    setUpdateFormData((prev) => ({ ...prev, [name]: value }))
  }

  //  function to handle update form file changes
  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUpdatePreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // function to handle update form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productToUpdate) return

    setUpdating(true)

    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`/api/admin/products/${productToUpdate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateFormData,
          price: Number.parseFloat(updateFormData.price),
          stock: Number.parseInt(updateFormData.stock),
          imageBase64: updatePreviewImage !== productToUpdate.image ? updatePreviewImage : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update product")
      }

      toast.success("Product updated successfully")
      setUpdateDialogOpen(false)

      // Refresh product list
      fetchProducts()
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setUpdating(false)
    }
  }

  // function to handle update image upload click
  const handleUpdateUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation() 
    updateFileInputRef.current?.click()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-purple-800">Product Management</h1>

      {/* Add Product Form */}
      <div className="bg-[#ebebf5ef] shadow-lg rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6 flex items-center text-purple-700">
          <PlusCircle className="mr-3 h-6 w-6 text-purple-500" />
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              {/* Basic Information */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Product Name
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
                <Label htmlFor="description" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Detailed description of the product"
                  className="resize-none h-32 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
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

                <div>
                  <Label htmlFor="stock" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-1.5 block text-gray-700">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={handleSelectChange("category")}>
                  <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="toy">Toy</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-5">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block text-gray-700">Product Image</Label>
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
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-[200px] bg-purple-600 hover:bg-purple-700 mt-8 py-4 text-lg font-medium"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-purple-800">Products</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            No products available. Add a new product above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=200"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-green-600 font-bold">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">Category: {product.category}</p>
                  <p className="text-gray-500 text-sm mt-1">Stock: {product.stock} units</p>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>

                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateDialog(product)}
                      className="flex items-center"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(product)}
                      disabled={deleting === product.id}
                      className="flex items-center"
                    >
                      {deleting === product.id ? (
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
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {productToDelete && (
            <div className="flex items-center gap-4 py-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={productToDelete.image || "/placeholder.svg?height=64&width=64"}
                  alt={productToDelete.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{productToDelete.name}</h4>
                <p className="text-sm text-gray-500">${productToDelete.price.toFixed(2)}</p>
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

      {/* Update Product Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Edit className="h-5 w-5" />
              Update Product
            </DialogTitle>
            <DialogDescription>
              Update the details of this product. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update-name" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Product Name *
                  </Label>
                  <Input
                    id="update-name"
                    name="name"
                    value={updateFormData.name}
                    onChange={handleUpdateInputChange}
                    className="focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="update-description" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Description *
                  </Label>
                  <Textarea
                    id="update-description"
                    name="description"
                    value={updateFormData.description}
                    onChange={handleUpdateInputChange}
                    required
                    className="resize-none h-32 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="update-price" className="text-sm font-medium mb-1.5 block text-gray-700">
                      Price ($) *
                    </Label>
                    <Input
                      id="update-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={updateFormData.price}
                      onChange={handleUpdateInputChange}
                      className="focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="update-stock" className="text-sm font-medium mb-1.5 block text-gray-700">
                      Stock Quantity *
                    </Label>
                    <Input
                      id="update-stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={updateFormData.stock}
                      onChange={handleUpdateInputChange}
                      className="focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="update-category" className="text-sm font-medium mb-1.5 block text-gray-700">
                    Category *
                  </Label>
                  <Select value={updateFormData.category} onValueChange={handleUpdateSelectChange("category")}>
                    <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="toy">Toy</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium mb-1.5 block text-gray-700">Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {updatePreviewImage ? (
                    <div className="relative w-full h-40 mb-4">
                      <img
                        src={updatePreviewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setUpdatePreviewImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer py-6" onClick={handleUpdateUploadClick}>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleUpdateUploadClick}
                  >
                    {updatePreviewImage ? "Change Image" : "Select Image"}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpdateFileChange}
                    className="hidden"
                    ref={updateFileInputRef}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Leave unchanged to keep the current image</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={updating}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating} className="bg-purple-600 hover:bg-purple-700">
                {updating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
