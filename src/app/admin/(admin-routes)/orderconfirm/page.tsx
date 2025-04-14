"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { CheckCircle, XCircle, RefreshCw, Package, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { Order } from "@/types"

export default function OrderConfirmPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

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

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))

      toast.success(`Order ${status === "COMPLETED" ? "approved" : "cancelled"} successfully`)
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast.error(error.message || "Failed to update order status")
    } finally {
      setProcessingOrder(null)
    }
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading orders</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Order Management</h1>
        <Button
          variant="outline"
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
            <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Customer: {order.shippingName} ({order.user?.email || "Unknown"})
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
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

                  <div className="flex justify-between font-medium mb-4">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>

                  {order.status === "PENDING" && (
                    <div className="flex justify-end gap-4 mt-4">
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
