"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Tag, ArrowUpRight, ChevronLeft, ChevronRight, Search, ToyBrick, BriefcaseMedical, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { AddToCartButton } from "./_components/add-to-cart"
import { useCartStore } from "@/stores/cart-store"
import { Badge } from "@/components/ui/badge"
import { ReactLenis, useLenis } from 'lenis/react'

import type { Product } from "@/types"

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { cart } = useCartStore()
  
  // Featured products slider state
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideInterval = useRef<NodeJS.Timeout | null>(null)
  const productsPerSlide = 4
  const autoSlideTime = 3000

  const lenis = useLenis(({ scroll }) => {
  })
  

  // Fetch all products on initial load
  useEffect(() => {
    fetchProducts()
    fetchFeaturedProducts()
  }, [])

  // Initialize cart data
  useEffect(() => {
    const { fetchCart } = useCartStore.getState()
    fetchCart().catch(console.error)
  }, [])

  // Fetch products based on category filter
  useEffect(() => {
    if (activeCategory) {
      fetchProductsByCategory(activeCategory)
    } else {
      fetchProducts()
    }
  }, [activeCategory])

  // Filter products based on search term
  useEffect(() => {
    if (products.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredProducts(products)
      } else {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredProducts(filtered)
      }
    }
  }, [searchTerm, products])

  // Auto slide functionality
  useEffect(() => {
    if (featuredProducts.length > productsPerSlide) {
      startSlideTimer()
      
      return () => {
        if (slideInterval.current) {
          clearInterval(slideInterval.current)
        }
      }
    }
  }, [featuredProducts, currentSlide])

  const startSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current)
    }
    
    slideInterval.current = setInterval(() => {
      goToNextSlide()
    }, autoSlideTime)
  }

  const resetSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current)
      startSlideTimer()
    }
  }

  const goToPrevSlide = () => {
    setCurrentSlide(prev => {
      const maxSlide = Math.ceil(featuredProducts.length / productsPerSlide) - 1
      return prev === 0 ? maxSlide : prev - 1
    })
    resetSlideTimer()
  }

  const goToNextSlide = () => {
    setCurrentSlide(prev => {
      const maxSlide = Math.ceil(featuredProducts.length / productsPerSlide) - 1
      return prev === maxSlide ? 0 : prev + 1
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
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
      setFilteredProducts(data.products)
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
      setFilteredProducts(data.products)
      setLoading(false)
    } catch (err: any) {
      console.error(`Error fetching ${category} products:`, err)
      setError(err.message || `An error occurred while fetching ${category} products`)
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string | null) => {
    setActiveCategory(category)
    setSearchTerm("")
  }

  // Function to render a product card
  const renderProductCard = (product: Product) => {
    const isInCart = cart?.items.some(item => item.product.id === product.id)
    
    return (
      <div key={product.id} className="bg-white border hover:scale-105 duration-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <Link href={`/store/${product.id}`} className="block relative">
          <div className="h-70 relative overflow-hidden">
            <img
              src={product.image || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="absolute top-2 right-2 bg-amber-500">
                Low Stock: {product.stock}
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">Out of Stock</span>
              </div>
            )}
          </div>
          
          <Badge 
            className="absolute top-2 left-2 capitalize" 
            variant="outline"
          >
            {product.category}
          </Badge>
        </Link>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Link href={`/store/${product.id}`} className="block">
              <h2 className="text-lg font-semibold hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h2>
            </Link>
            <span className="text-green-600 font-bold whitespace-nowrap">${product.price.toFixed(2)}</span>
          </div>

          <div className="flex items-center mb-3 text-sm">
            <div className="flex items-center">
              <Star className={`h-4 w-4 ${product.avgRating > 0 ? "text-yellow-400" : "text-gray-300"} fill-current`} />
              <span className="ml-1">
                {product.avgRating > 0 ? product.avgRating.toFixed(1) : "No ratings"}
              </span>
            </div>
            {product.ratingCount > 0 && (
              <span className="text-gray-500 ml-2">({product.ratingCount})</span>
            )}
          </div>
          
          <div className="flex justify-between items-center gap-2 mt-auto">
            <Link 
              href={`/store/${product.id}`}
              className="text-blue-600 text-sm flex items-center hover:underline"
            >
              View Details
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
            <AddToCartButton 
              productId={product.id}
              disabled={product.stock === 0}
              className={`${isInCart ? "bg-green-600 hover:bg-green-700" : ""} cursor-pointer`}
            />
          </div>
        </div>
      </div>
    )
  }

  // Skeleton loader for product cards
  const renderSkeletonCard = () => (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="h-70 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )

  return (
    <ReactLenis root>
    <div className="container mx-auto px-4 py-8"> 
      {/* Search Bar */}


      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <p className="text-gray-700 text-center text-lg">
          Find the best products for your pet! Browse our selection of food, toys, and medicine.
        </p>
        

        <div className="mb-4 mt-6">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by name"
            className="pl-10 py-2 border-2 border-blue-300 rounded-full focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center mt-4 gap-3">
          <Button 
            variant={activeCategory === null ? "default" : "outline"} 
            onClick={() => handleCategoryClick(null)}
            className="min-w-20"
          >
            <Tag className="mr-2 h-4 w-4" />All Products
          </Button>
          <Button 
            variant={activeCategory === "food" ? "default" : "outline"} 
            onClick={() => handleCategoryClick("food")}
            className="min-w-20"
          >
            <Cookie className="mr-2 h-4 w-4" /> Food
          </Button>
          <Button 
            variant={activeCategory === "toy" ? "default" : "outline"} 
            onClick={() => handleCategoryClick("toy")}
            className="min-w-20"
          >
            <ToyBrick className="mr-2 h-4 w-4" /> Toys
          </Button>
          <Button
            variant={activeCategory === "medicine" ? "default" : "outline"}
            onClick={() => handleCategoryClick("medicine")}
            className="min-w-20"
          >
            <BriefcaseMedical className="mr-2 h-4 w-4" /> Medicine
          </Button>
        </div>
      </div>

      {/* Featured Products Section with Slider */}
      {!activeCategory && !searchTerm && featuredProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-4 border-b pb-2">
            <Star className="text-yellow-500 h-6 w-6 fill-current animate-bounce mr-2" />
            <h2 className="text-xl flex font-semibold text-blue-700">Featured Products</h2>
          </div>
          
          <div className="relative overflow-hidden">
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-transform duration-1400 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 33.33}%)`,
                display: 'flex',
                width: `${Math.ceil(featuredProducts.length / productsPerSlide) * 100}%` 
              }}
            >
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-full" style={{ flexBasis: `${100 / productsPerSlide}%` }}>
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Slider Controls */}
          {featuredProducts.length > productsPerSlide && (
            <div className="flex justify-center mt-6 gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevSlide}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(featuredProducts.length / productsPerSlide) }).map((_, index) => (
                  <span 
                    key={index}
                    className={`block h-2 w-2 rounded-full ${
                      currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextSlide}
                className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </section>
      )}

      {/* All Products Section */}
      <section>
        <div className="flex items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-blue-700">
            {searchTerm 
              ? `Search Results for "${searchTerm}"` 
              : activeCategory
                ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Products`
                : "All Products"}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i}>{renderSkeletonCard()}</div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error loading products</h3>
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchProducts} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No products found matching "${searchTerm}".` 
                : "No products found in this category."}
            </p>
            {(activeCategory || searchTerm) && (
              <Button onClick={() => {
                handleCategoryClick(null);
                setSearchTerm("");
              }}>
                View All Products
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => renderProductCard(product))}
          </div>
        )}
      </section>
    </div>
    </ReactLenis>
  )
}