"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Package, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp, User, MapPin } from "lucide-react"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

type Order = {
  id: string
  totalPrice: number
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  shippingName: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
}

export default function OrderConfirmPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders)
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      setError(error.message || "An error occurred while fetching orders")
    } finally {
      setLoading(false)
    }
  }

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const updateOrderStatus = async (orderId: string, status: "COMPLETED" | "CANCELLED") => {
    try {
      setProcessingOrder(orderId)
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update order status")
      }

      toast.success(`Order ${status === "COMPLETED" ? "approved" : "cancelled"} successfully`)

      // Refresh orders
      fetchOrders()
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast.error(error.message || "Failed to update order status")
    } finally {
      setProcessingOrder(null)
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-6" />
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
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Order Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="flex items-center border-purple-300 hover:bg-purple-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</div>
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
                  {/* Customer Information */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer Information
                    </h3>
                    <p>
                      <span className="font-medium">Name:</span> {order.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {order.user.email}
                    </p>
                  </div>

                  {/* Shipping Information */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Shipping Information
                    </h3>
                    <p>{order.shippingName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>
                      {order.shippingCity}, {order.shippingState} {order.shippingZip}
                    </p>
                    <p>{order.shippingCountry}</p>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Items */}
                  <h3 className="font-medium mb-3 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden mr-4">
                          <img
                            src={item.product.image || "/placeholder.svg?height=64&width=64"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Total */}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>

                  {/* Order Actions */}
                  {order.status === "PENDING" && (
                    <div className="mt-6 flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        disabled={processingOrder === order.id}
                      >
                        {processingOrder === order.id ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel Order
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                        disabled={processingOrder === order.id}
                      >
                        {processingOrder === order.id ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve Order
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
