"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, CheckCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

type ShippingInfo = {
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

type PaymentInfo = {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
}

type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  totalPrice: number
}

type Cart = {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [processing, setProcessing] = useState(false)
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })

  // Fetch cart data on component mount
  useEffect(() => {
    async function fetchCart() {
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

        // If cart is empty, redirect back to cart page
        if (data.cart.items.length === 0) {
          toast.error("Your cart is empty")
          router.push("/cart")
          return
        }

        setCart(data.cart)
      } catch (err: any) {
        console.error("Error fetching cart:", err)
        setError(err.message || "An error occurred while fetching your cart")
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [router])

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      // Create an order from the cart
      const response = await fetch("/api/users/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingInfo: {
            name: shippingInfo.name,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip: shippingInfo.zip,
            country: shippingInfo.country,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      const data = await response.json()
      setOrderId(data.order.id)
      setStep("confirmation")
      toast.success("Order placed successfully!")
    } catch (error: any) {
      console.error("Error creating order:", error)
      toast.error(error.message || "Failed to process payment. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return v
  }

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/user/cart")}>Return to Cart</Button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">
        {step === "shipping" && "Shipping Information"}
        {step === "payment" && "Payment Information"}
        {step === "confirmation" && "Order Confirmation"}
      </h1>

      {step === "shipping" && (
        <>
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal ({cart?.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={shippingInfo.name} onChange={handleShippingChange} required />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={shippingInfo.city} onChange={handleShippingChange} required />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" name="state" value={shippingInfo.state} onChange={handleShippingChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">Postal/ZIP Code</Label>
                  <Input id="zip" name="zip" value={shippingInfo.zip} onChange={handleShippingChange} required />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/cart")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
              <Button type="submit">Continue to Payment</Button>
            </div>
          </form>
        </>
      )}

      {step === "payment" && (
        <>
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal ({cart?.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => {
                    const formattedValue = formatCardNumber(e.target.value)
                    setPaymentInfo((prev) => ({ ...prev, cardNumber: formattedValue }))
                  }}
                  maxLength={19}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">For testing, use any 16-digit number</p>
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  value={paymentInfo.cardholderName}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => {
                      const formattedValue = formatExpiryDate(e.target.value)
                      setPaymentInfo((prev) => ({ ...prev, expiryDate: formattedValue }))
                    }}
                    maxLength={5}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Any future date</p>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="text"
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={(e) => {
                      // Only allow numbers and limit to 3-4 digits
                      const value = e.target.value.replace(/\D/g, "").substring(0, 4)
                      setPaymentInfo((prev) => ({ ...prev, cvv: value }))
                    }}
                    maxLength={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">3 or 4 digits</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <p>{shippingInfo.name}</p>
              <p>{shippingInfo.address}</p>
              <p>
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
              </p>
              <p>{shippingInfo.country}</p>
            </div>

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setStep("shipping")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipping
              </Button>
              <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      {step === "confirmation" && (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-2">Thank you for your purchase. We&apos;ll send you a confirmation email soon.</p>
          <p className="text-gray-600 mb-6">
            Your order number is: <span className="font-semibold">{orderId}</span>
          </p>

          <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto mb-8 text-left">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <p>{shippingInfo.name}</p>
            <p>{shippingInfo.address}</p>
            <p>
              {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
            </p>
            <p>{shippingInfo.country}</p>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/store">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/myorders">
              <Button>
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
