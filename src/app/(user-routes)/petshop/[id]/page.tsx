"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, PawPrintIcon as Paw, Activity, Home, Shield, Baby, CheckCircle } from "lucide-react"
import type { Pet } from "@/types"

export default function PetDetail() {
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    async function fetchPet() {
      try {
        const token = localStorage.getItem("userToken")
        if (!token) {
          router.push("/userlogin")
          return
        }

        const response = await fetch(`/api/users/petShop/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.message || "Failed to fetch pet details")
        }

        const data = await response.json()
        // console.log("Pet data:", data)
        setPet(data.pet)
      } catch (err: any) {
        console.error("Error fetching pet details:", err)
        setError(err.message || "An error occurred while fetching pet details")
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [id, router])

  const handleBuyClick = () => {
    router.push(`/petshop/buy?petId=${id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading pet details</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/petshop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Pet Shop
        </button>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Pet not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested pet could not be found.</p>
        <button
          onClick={() => router.push("/user/petshop")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Pet Shop
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pet Image */}
        <div className="h-64 md:h-full bg-gray-200 relative">
          <img
            src={pet.images || "/placeholder.svg?height=500&width=500"}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Pet Details */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <span className="text-2xl font-bold text-green-600">${pet.price.toFixed(2)}</span>
          </div>

          <p className="text-xl text-gray-700 mt-1">{pet.breed}</p>
          <p className="text-gray-600 mt-1">
            Age: {pet.age} {pet.age === 1 ? "year" : "years"}
          </p>

          <div className="mt-4">
            <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
              {pet.isAvailable ? "Available" : "Adopted"}
            </Badge>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              About {pet.name}
            </h2>
            <p className="mt-2 text-gray-700">{pet.bio}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Detailed Description</h2>
            <p className="mt-2 text-gray-700">{pet.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Paw className="mr-2 h-5 w-5 text-orange-500" />
              Compatibility
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">Energy Level:</span>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`h-2 w-8 mr-1 rounded-full ${level <= pet.energyLevel ? "bg-blue-500" : "bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Home className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-gray-700">Space Required:</span>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`h-2 w-8 mr-1 rounded-full ${level <= pet.spaceRequired ? "bg-green-500" : "bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-purple-500" />
                  <span className="text-gray-700">Maintenance:</span>
                </div>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`h-2 w-8 mr-1 rounded-full ${level <= pet.maintenance ? "bg-purple-500" : "bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Baby className="mr-2 h-4 w-4 text-pink-500" />
                  <span className="text-gray-700">Child Friendly:</span>
                </div>
                <div className="mt-1">
                  {pet.childFriendly ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">No</Badge>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-teal-500" />
                  <span className="text-gray-700">Allergy Safe:</span>
                </div>
                <div className="mt-1">
                  {pet.allergySafe ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Yes</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">No</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button onClick={handleBuyClick} className="w-full py-6 text-lg" disabled={!pet.isAvailable}>
              {pet.isAvailable ? "Adopt Now" : "Already Adopted"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

