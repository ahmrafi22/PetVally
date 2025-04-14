"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, ShoppingCart, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type ProductRating = {
  id: string
  rating: number
  comment: string | null
  userId: string
  productId: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  category: string
  avgRating: number
  ratingCount: number
  ratings: ProductRating[]
  createdAt: string
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cartLoading, setCartLoading] = useState(false)

  const id = params.id as string

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("userToken")
        if (!token) {
          router.push("/userlogin")
          return
        }

        const response = await fetch(`/api/users/store/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.message || "Failed to fetch product details")
        }

        const data = await response.json()
        setProduct(data.product)
      } catch (err: any) {
        console.error("Error fetching product details:", err)
        setError(err.message || "An error occurred while fetching product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      // Add loading state
      setCartLoading(true)

      const response = await fetch("/api/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add product to cart")
      }

      toast.success(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`, {
      })
    } catch (err: any) {
      console.error("Error adding product to cart:", err)
      toast.error(err.message || "Failed to add product to cart")
    } finally {
      setCartLoading(false)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image Skeleton */}
          <Skeleton className="h-64 md:h-full w-full" />

          {/* Product Details Skeleton */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>

            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-8 w-32" />

            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>

            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading product details</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Shop
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Product not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested product could not be found.</p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image */}
        <div className="h-64 md:h-full bg-gray-200 relative">
          <img
            src={product.image || "/placeholder.svg?height=500&width=500"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
          </div>

          <p className="text-xl text-gray-700 mt-1">Category: {product.category}</p>

          <div className="flex items-center mt-2">
            {renderStars(product.avgRating)}
            <span className="ml-2">
              {product.avgRating > 0 ? `${product.avgRating.toFixed(1)} stars` : "No ratings yet"}
              {product.ratingCount > 0 && ` (${product.ratingCount} reviews)`}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-2 text-gray-700">{product.description}</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <span className={`text-${product.stock > 0 ? "green" : "red"}-600 font-medium`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center">
              <span className="mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="px-3 py-1 border-r hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1 border-l hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={handleAddToCart}
              className="w-full py-6 text-lg flex items-center justify-center"
              disabled={product.stock === 0 || cartLoading}
            >
              {cartLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="p-6 border-t mt-6">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

        {product.ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="space-y-6">
            {product.ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {rating.user.image ? (
                        <img
                          src={rating.user.image || "/placeholder.svg"}
                          alt={rating.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{rating.user.name}</p>
                      <div className="flex items-center">{renderStars(rating.rating)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(rating.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                {rating.comment && (
                  <div className="mt-3 ml-13">
                    <p className="text-gray-700">{rating.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
