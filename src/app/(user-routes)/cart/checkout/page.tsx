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
import { User,PaymentInfo,ShippingInfo,Cart } from "@/types"
import { useUserStore } from "@/stores/user-store"

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [processing, setProcessing] = useState(false)
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [userDataLoading, setUserDataLoading] = useState(false)
  const { userData, isLoading, fetchUserData } = useUserStore();

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

  useEffect(() => {

    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    setUserDataLoading(true)
    try {
      if (userData.id) {
        setShippingInfo(prev => ({
          ...prev,
          name: userData.name || "",
          address: userData.area || "",
          city: userData.city || "",
          country: userData.country || "",
        }));
      } 
      
    } catch (error) {
      console.log(error);
      
    } finally {
      setUserDataLoading(false)
    }

  }, [userData]);



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
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 my-10">
        <Skeleton className="h-10 w-72 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-md mb-8" />
          <div className="space-y-5">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
          <div className="flex justify-between mt-8 pt-4">
            <Skeleton className="h-12 w-36 rounded-md" />
            <Skeleton className="h-12 w-36 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 my-10">
        <h1 className="text-2xl font-bold mb-6">Checkout Error</h1>
        <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-6">
          <p className="text-lg">{error}</p>
        </div>
        <Button className="mt-4 px-6 py-2.5" onClick={() => router.push("/user/cart")}>Return to Cart</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 my-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {step === "shipping" && "Shipping Information"}
        {step === "payment" && "Payment Information"}
        {step === "confirmation" && "Order Confirmation"}
      </h1>

      {step === "shipping" && (
        <>
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm">
            <h2 className="font-semibold text-xl mb-4 text-gray-700">Order Summary</h2>
            <div className="flex justify-between items-center mb-3 text-gray-700">
              <span>Subtotal ({cart?.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span className="font-medium">${cart?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3 text-gray-700">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold text-gray-800 text-lg mt-3">
              <span>Total</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {userDataLoading ? (
            <div className="space-y-6 my-8">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleShippingSubmit} className="space-y-6 mt-8">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={shippingInfo.name} 
                    onChange={handleShippingChange} 
                    required 
                    className="h-12 px-4"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-700 font-medium mb-2 block">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    required
                    className="h-12 px-4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city" className="text-gray-700 font-medium mb-2 block">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={shippingInfo.city} 
                      onChange={handleShippingChange} 
                      required 
                      className="h-12 px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-700 font-medium mb-2 block">State/Province</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={shippingInfo.state} 
                      onChange={handleShippingChange} 
                      required 
                      className="h-12 px-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="zip" className="text-gray-700 font-medium mb-2 block">Postal/ZIP Code</Label>
                    <Input 
                      id="zip" 
                      name="zip" 
                      value={shippingInfo.zip} 
                      onChange={handleShippingChange} 
                      required 
                      className="h-12 px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-gray-700 font-medium mb-2 block">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      required
                      className="h-12 px-4"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/cart")}
                  className="h-12 px-6"
                >
                  <ArrowLeft className="mr-3 h-5 w-5" />
                  Back to Cart
                </Button>
                <Button 
                  type="submit"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      {step === "payment" && (
        <>
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm">
            <h2 className="font-semibold text-xl mb-4 text-gray-700">Order Summary</h2>
            <div className="flex justify-between items-center mb-3 text-gray-700">
              <span>Subtotal ({cart?.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span className="font-medium">${cart?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3 text-gray-700">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold text-gray-800 text-lg mt-3">
              <span>Total</span>
              <span>${cart?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-6 mt-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="cardNumber" className="text-gray-700 font-medium mb-2 block">Card Number</Label>
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
                  className="h-12 px-4"
                />
                <p className="text-xs text-gray-500 mt-2 ml-1">For testing, use any 16-digit number</p>
              </div>

              <div>
                <Label htmlFor="cardholderName" className="text-gray-700 font-medium mb-2 block">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  value={paymentInfo.cardholderName || shippingInfo.name} // Default to shipping name if not set
                  onChange={handlePaymentChange}
                  required
                  className="h-12 px-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="expiryDate" className="text-gray-700 font-medium mb-2 block">Expiry Date (MM/YY)</Label>
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
                    className="h-12 px-4"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">Any future date</p>
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-gray-700 font-medium mb-2 block">CVV</Label>
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
                    className="h-12 px-4"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">3 or 4 digits</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-gray-700">Shipping Address</h3>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium">{shippingInfo.name}</p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                </p>
                <p>{shippingInfo.country}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep("shipping")}
                className="h-12 px-6"
              >
                <ArrowLeft className="mr-3 h-5 w-5" />
                Back to Shipping
              </Button>
              <Button 
                type="submit" 
                disabled={processing} 
                className="h-12 px-8 bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-3">⟳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-3 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      {step === "confirmation" && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 text-lg mb-3">Thank you for your purchase. We&apos;ll send you a confirmation email soon.</p>
          <p className="text-gray-600 mb-8 text-lg">
            Your order number is: <span className="font-semibold">{orderId}</span>
          </p>

          <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto mb-10 text-left shadow-sm">
            <h3 className="font-medium text-lg mb-4 text-gray-700">Shipping Address</h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">{shippingInfo.name}</p>
              <p>{shippingInfo.address}</p>
              <p>
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
              </p>
              <p>{shippingInfo.country}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <Link href="/store">
              <Button 
                variant="outline"
                className="h-12 px-6 text-lg"
              >
                Continue Shopping
              </Button>
            </Link>
            <Link href="/myorders">
              <Button className="h-12 px-6 text-lg bg-blue-600 hover:bg-blue-700">
                <ShoppingBag className="mr-3 h-5 w-5" />
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}