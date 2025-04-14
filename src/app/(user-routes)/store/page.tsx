"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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
  createdAt: string
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const router = useRouter()

  // Fetch all products on initial load
  useEffect(() => {
    fetchProducts()
    fetchFeaturedProducts()
  }, [])

  // Fetch products based on category filter
  useEffect(() => {
    if (activeCategory) {
      fetchProductsByCategory(activeCategory)
    } else {
      fetchProducts()
    }
  }, [activeCategory])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/store", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products)
      setLoading(false)
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setError(err.message || "An error occurred while fetching products")
      setLoading(false)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/store?featured=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch featured products")
      }

      const data = await response.json()
      setFeaturedProducts(data.products)
    } catch (err: any) {
      console.error("Error fetching featured products:", err)
    }
  }

  const fetchProductsByCategory = async (category: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/store?category=${category}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} products`)
      }

      const data = await response.json()
      setProducts(data.products)
      setLoading(false)
    } catch (err: any) {
      console.error(`Error fetching ${category} products:`, err)
      setError(err.message || `An error occurred while fetching ${category} products`)
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add product to cart")
      }

      toast.success("Product added to cart!", {
        description: "View your cart to checkout.",
      })
    } catch (err: any) {
      console.error("Error adding product to cart:", err)
      toast.error(err.message || "Failed to add product to cart")
    }
  }

  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category)
  }

  // Function to render a product card
  const renderProductCard = (product: Product) => {
    return (
      <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <Link href={`/store/${product.id}`} className="block">
          <div className="h-48 bg-gray-200 relative">
            <img
              src={product.image || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        <div className="p-4">
          <Link href={`/store/${product.id}`} className="block">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <span className="text-green-600 font-bold">${product.price.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 text-sm">Category: {product.category}</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <Star className={`h-4 w-4 ${product.avgRating > 0 ? "text-yellow-400" : "text-gray-300"}`} />
                <span className="ml-1 text-sm">
                  {product.avgRating > 0 ? product.avgRating.toFixed(1) : "No ratings"}
                </span>
              </div>
              {product.ratingCount > 0 && (
                <span className="text-xs text-gray-500 ml-2">({product.ratingCount} reviews)</span>
              )}
            </div>
          </Link>
          <div className="mt-4 flex justify-between items-center">
            <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
            <Button
              size="sm"
              onClick={() => handleAddToCart(product.id)}
              disabled={product.stock === 0}
              className="flex items-center"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Skeleton loader for product cards
  const renderSkeletonCard = () => (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Pet Shop Store</h1>
      <p className="text-gray-600 mb-6 text-center">
        Find the best products for your pet! Browse our selection of food, toys, and medicine.
      </p>

      {/* Category Filter Buttons */}
      <div className="flex justify-center mb-8 space-x-4">
        <Button variant={activeCategory === null ? "default" : "outline"} onClick={() => handleCategoryClick(null)}>
          All Products
        </Button>
        <Button variant={activeCategory === "food" ? "default" : "outline"} onClick={() => handleCategoryClick("food")}>
          Food
        </Button>
        <Button variant={activeCategory === "toy" ? "default" : "outline"} onClick={() => handleCategoryClick("toy")}>
          Toys
        </Button>
        <Button
          variant={activeCategory === "medicine" ? "default" : "outline"}
          onClick={() => handleCategoryClick("medicine")}
        >
          Medicine
        </Button>
      </div>

      {/* Featured Products Section */}
      {!activeCategory && featuredProducts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
            <span className="mr-2">⭐</span> Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredProducts.map((product) => renderProductCard(product))}
          </div>
        </div>
      )}

      {/* All Products Section */}
      <h2 className="text-xl font-semibold mb-4 text-center">
        {activeCategory
          ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Products`
          : "All Products"}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>{renderSkeletonCard()}</div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-red-600">Error loading products</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => renderProductCard(product))}
        </div>
      )}
    </div>
  )
}
