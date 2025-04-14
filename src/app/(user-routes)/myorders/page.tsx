"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Package, ArrowLeft, ChevronDown, ChevronUp, Star } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
    price: number
  }
}

type Order = {
  id: string
  totalPrice: number
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  shippingName: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
}

import { ProductRating} from "@/types"

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  // Add state for the rating dialog
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<OrderItem["product"] | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [existingRating, setExistingRating] = useState<ProductRating | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("userToken")
        if (!token) {
          router.push("/userlogin")
          return
        }

        const response = await fetch("/api/users/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setOrders(data.orders)
      } catch (err: any) {
        console.error("Error fetching orders:", err)
        setError(err.message || "An error occurred while fetching your orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Add this function to handle opening the rating dialog
  const openRatingDialog = async (product: OrderItem["product"]) => {
    setSelectedProduct(product)
    setRatingValue(0)
    setRatingComment("")
    setExistingRating(null)

    // Check if user has already rated this product
    try {
      const token = localStorage.getItem("userToken")
      const response = await fetch(`/api/users/products/rating?productId=${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.rating) {
          setExistingRating(data.rating)
          setRatingValue(data.rating.rating)
          setRatingComment(data.rating.comment || "")
        }
      }
    } catch (error) {
      console.error("Error fetching existing rating:", error)
    }

    setRatingDialogOpen(true)
  }

  // Add this function to handle submitting the rating
  const submitRating = async () => {
    if (!selectedProduct) return

    setSubmittingRating(true)

    try {
      const token = localStorage.getItem("userToken")
      const response = await fetch("/api/users/products/rating", {
        method: existingRating ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: ratingValue,
          comment: ratingComment.trim() || null,
          ratingId: existingRating?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit rating")
      }

      toast.success(existingRating ? "Rating updated successfully!" : "Rating submitted successfully!")
      setRatingDialogOpen(false)
    } catch (err: any) {
      console.error("Error submitting rating:", err)
      toast.error(err.message || "Failed to submit rating")
    } finally {
      setSubmittingRating(false)
    }
  }

  // Add this function to render the star rating component
  const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
            <Star
              className={`h-8 w-8 ${
                star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/user/store")}>Return to Store</Button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link href="/user/store">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">No orders yet</h2>
          <p className="text-gray-500 mt-2 mb-6">You haven&apos;t placed any orders yet.</p>
          <Link href="/user/store">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={`${getStatusColor(order.status)} border px-2 py-1`}>{order.status}</Badge>
                  <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                  <Button variant="ghost" size="sm" onClick={() => toggleOrderExpanded(order.id)} className="ml-auto">
                    {expandedOrders[order.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {expandedOrders[order.id] && (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p>{order.shippingName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>
                      {order.shippingCity}, {order.shippingState} {order.shippingZip}
                    </p>
                    <p>{order.shippingCountry}</p>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div
                          className="h-16 w-16 bg-gray-200 rounded overflow-hidden mr-4 cursor-pointer"
                          onClick={() => openRatingDialog(item.product)}
                        >
                          <img
                            src={item.product.image || "/placeholder.svg?height=64&width=64"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4
                            className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => openRatingDialog(item.product)}
                          >
                            {item.product.name}
                          </h4>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRatingDialog(item.product)}
                              className="text-xs"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Rate Product
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Product</DialogTitle>
            <DialogDescription>
              {existingRating ? "Update your rating for this product." : "Share your experience with this product."}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="flex items-center py-4">
              <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden mr-4">
                <img
                  src={selectedProduct.image || "/placeholder.svg?height=64&width=64"}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-500">${selectedProduct.price.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <StarRating value={ratingValue} onChange={setRatingValue} />
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this product..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="resize-none h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating} disabled={ratingValue === 0 || submittingRating}>
              {submittingRating ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {existingRating ? "Updating..." : "Submitting..."}
                </>
              ) : existingRating ? (
                "Update Rating"
              ) : (
                "Submit Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
