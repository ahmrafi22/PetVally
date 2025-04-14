"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
    stock: number
  }
  totalPrice: number
}

type Cart = {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchCart()
  })

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch cart")
      }

      const data = await response.json()
      setCart(data.cart)
    } catch (err: any) {
      console.error("Error fetching cart:", err)
      setError(err.message || "An error occurred while fetching your cart")
    } finally {
      setLoading(false)
    }
  }

  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }))

      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/cart/item", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartItemId,
          quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update item quantity")
      }

      // Refresh cart data
      fetchCart()

      if (quantity === 0) {
        toast.success("Item removed from cart")
      }
    } catch (error: any) {
      console.error("Error updating item quantity:", error)
      toast.error(error.message || "Failed to update item quantity")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }))
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }))

      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/cart/item?id=${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove item from cart")
      }

      // Refresh cart data
      fetchCart()
      toast.success("Item removed from cart")
    } catch (error: any) {
      console.error("Error removing item from cart:", error)
      toast.error(error.message || "Failed to remove item from cart")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }))
    }
  }

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    router.push("/cart/checkout")
  }

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex border-b pb-4">
              <Skeleton className="h-24 w-24 rounded mr-4" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex justify-between items-end">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/store")}>Return to Store</Button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ShoppingCart className="mr-2 h-6 w-6" />
        Shopping Cart
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 mb-6">Looks like you haven&apos;t added any products to your cart yet.</p>
          <Link href="/store">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row border-b pb-4">
                  <div className="h-24 w-24 bg-gray-200 rounded overflow-hidden mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                    <img
                      src={item.product.image || "/placeholder.svg?height=96&width=96"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">${item.product.price.toFixed(2)} each</p>

                    <div className="flex flex-wrap justify-between items-end gap-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems[item.id] || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="h-8 px-4 flex items-center justify-center border-y">
                          {updatingItems[item.id] ? <span className="animate-pulse">...</span> : item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems[item.id] || item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems[item.id]}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>

              <Button className="w-full" size="lg" onClick={proceedToCheckout}>
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-4">
                <Link href="/user/store">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
