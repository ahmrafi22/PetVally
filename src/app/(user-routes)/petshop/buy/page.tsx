"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Pet, PaymentFormData } from "@/types";

export default function BuyPet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!petId) {
      router.push("/petshop");
      return;
    }

    async function fetchPet() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          router.push("/userlogin");
          return;
        }

        const response = await fetch(`/api/users/petShop/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.message || "Failed to fetch pet details");
        }

        const data = await response.json();
        console.log("Pet data for purchase:", data);

        if (!data.pet.isAvailable) {
          toast("Pet Not Available", {
            description: "This pet is no longer available for adoption.",
            icon: "🐾",
            style: {
              background: "#1e1b4b",
              color: "#facc15",
              border: "1px solid #facc15",
            },
          });

          router.push("/petshop");
          return;
        }

        setPet(data.pet);
      } catch (err: any) {
        console.error("Error fetching pet details:", err);
        setError(err.message || "An error occurred while fetching pet details");
      } finally {
        setLoading(false);
      }
    }

    fetchPet();
  }, [petId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pet || !petId) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      console.log("Submitting order for pet:", petId);

      const response = await fetch("/api/users/petShop/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ petId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order API Error:", errorData);
        throw new Error(errorData.message || "Failed to complete adoption");
      }

      const data = await response.json();
      console.log("Order response:", data);

      toast("Adoption Successful!", {
        description: `Congratulations! ${pet.name} will be delivered to your location very soon.`,
        icon: "🎉",
        style: {
          background: "#1e1b4b",
          color: "#34d399",
          border: "1px solid #34d399",
        },
      });

      // Redirect to pet shop after successful adoption
      setTimeout(() => {
        router.push("/petshop");
      }, 2000);
    } catch (err: any) {
      console.error("Error completing adoption:", err);
      toast("Error", {
        description:
          err.message || "An error occurred while completing the adoption.",
        icon: "❌",
        style: {
          background: "#1e1b4b",
          color: "#f87171",
          border: "1px solid #f87171",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/user/petshop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Pet Shop
        </button>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          Pet not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested pet could not be found.
        </p>
        <button
          onClick={() => router.push("/petshop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Pet Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Adoption</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pet Summary */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Adoption Summary</h2>

          <div className="flex items-center mb-4">
            <div className="w-35 h-35 bg-gray-200 rounded-md overflow-hidden mr-4">
              <img
                src={pet.images || "/placeholder.svg?height=100&width=100"}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">{pet.name}</h3>
              <p className="text-gray-600">{pet.breed}</p>
              <p className="text-gray-500 text-sm">
                Age: {pet.age} {pet.age === 1 ? "year" : "years"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-[250px]">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Adoption Fee:</span>
              <span className="font-medium">${pet.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-medium">$25.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${(pet.price + 25).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="cardNumber ">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label className="mb-2"  htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                name="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2"  htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-2"  htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6 mb-2">Billing Address</h3>

            <div>
              <Label className="mb-2"  htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2"  htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-2"  htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-2"  htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="United States"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : `Complete Adoption - $${(pet.price + 25).toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
