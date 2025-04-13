"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Heart, 
  CheckCircle,
  CreditCard,
  MapPin,
  Home
} from "lucide-react";
import type { Pet, PaymentFormData } from "@/types";

export default function BuyPet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adoptionComplete, setAdoptionComplete] = useState(false);

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
          setDialogOpen(true);
          setError("This pet is no longer available for adoption.");
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

      setAdoptionComplete(true);
      setDialogOpen(true);
    } catch (err: any) {
      console.error("Error completing adoption:", err);
      setError(err.message || "An error occurred while completing the adoption.");
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToPetShop = () => {
    router.push("/petshop");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64 bg-white shadow-md overflow-hidden rounded-3xl border-2 border-pink-200 p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dialogOpen) {
    return (
      <div className="p-6 bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md overflow-hidden rounded-3xl border-2 border-pink-200 p-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <Button
              onClick={handleReturnToPetShop}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
            >
              Return to Pet Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!pet && !dialogOpen) {
    return (
      <div className="p-6 bg-gradient-to-b from-pink-50 to-purple-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md overflow-hidden rounded-3xl border-2 border-pink-200 p-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">
              Pet not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested pet could not be found.
            </p>
            <Button
              onClick={handleReturnToPetShop}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
            >
              Return to Pet Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white shadow-md overflow-hidden rounded-sm border-2  p-6">
          <h1 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
            <Heart className="mr-2 h-5 w-5 text-pink-500" /> Complete Your Adoption
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pet Summary */}
            <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-pink-100">
              <h2 className="text-xl font-semibold mb-4 text-purple-700">Adoption Summary</h2>

              <div className="flex items-center mb-4">
                <div className="w-32 h-32 bg-gray-200 rounded-2xl overflow-hidden mr-4 border-2 ">
                  <img
                    src={pet?.images || "/placeholder.svg?height=128&width=128"}
                    alt={pet?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-purple-700">{pet?.name}</h3>
                  <p className="text-gray-600">{pet?.breed}</p>
                  <p className="text-gray-500 text-sm">
                    Age: {pet?.age} {pet?.age === 1 ? "year" : "years"}
                  </p>
                </div>
              </div>

              <div className="border-t border-pink-200 pt-4 mt-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Adoption Fee:</span>
                  <span className="font-medium">${pet?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium">$25.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-pink-200 pt-2 mt-2">
                  <span className="text-purple-700">Total:</span>
                  <span className="text-purple-700">${(pet ? pet.price + 25 : 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-700 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-pink-500" /> Payment Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                  <Label className="mb-2 text-purple-700" htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="border-pink-200 focus:border-purple-400 rounded-xl"
                    required
                  />
                </div>

                <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                  <Label className="mb-2 text-purple-700" htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={handleChange}
                    className="border-pink-200 focus:border-purple-400 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <Label className="mb-2 text-purple-700" htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="border-pink-200 focus:border-purple-400 rounded-xl"
                      required
                    />
                  </div>
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <Label className="mb-2 text-purple-700" htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="border-pink-200 focus:border-purple-400 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-2 text-purple-700 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-pink-500" /> Billing Address
                </h3>

                <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                  <Label className="mb-2 text-purple-700" htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={handleChange}
                    className="border-pink-200 focus:border-purple-400 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <Label className="mb-2 text-purple-700" htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Dhaka"
                      value={formData.city}
                      onChange={handleChange}
                      className="border-pink-200 focus:border-purple-400 rounded-xl"
                      required
                    />
                  </div>
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <Label className="mb-2 text-purple-700" htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="12000"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="border-pink-200 focus:border-purple-400 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                  <Label className="mb-2 text-purple-700" htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Bangladesh"
                    value={formData.country}
                    onChange={handleChange}
                    className="border-pink-200 focus:border-purple-400 rounded-xl"
                    required
                  />
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg rounded-full transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Processing..."
                      : `Complete Adoption - $${(pet ? pet.price + 25 : 0).toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white rounded-3xl border-2 border-pink-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className={`text-2xl ${adoptionComplete ? 'text-purple-700' : 'text-red-600'} flex items-center`}>
              {adoptionComplete 
                ? <><CheckCircle className="mr-2 h-6 w-6 text-green-500" /> Adoption Successful!</>
                : <><Home className="mr-2 h-6 w-6 text-red-500" /> Pet Not Available</>
              }
            </DialogTitle>
            <DialogDescription className="text-lg mt-2">
              {adoptionComplete 
                ? <span>Congratulations! {pet?.name} will be delivered to your location very soon. You will get a call from our representative very soon</span>
                : <span>{error}</span>
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Button 
              onClick={handleReturnToPetShop} 
              className="w-full py-4 text-lg rounded-full transition-all duration-300 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg"
            >
              Return to Pet Shop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}