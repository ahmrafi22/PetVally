"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, PawPrintIcon as Paw, Activity, Home, Shield, Baby, CheckCircle, Syringe, Scissors, ArrowLeft } from "lucide-react"
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
      <div className="p-6  ">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-white shadow-md overflow-hidden rounded-sm border-2 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Image Skeleton */}
              <Skeleton className="h-64 md:h-full w-full " />

              {/* Pet Details Skeleton */}
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-8 w-40 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>

                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />

                <Skeleton className="h-8 w-32 rounded-full" />

                <div className="space-y-2">
                  <Skeleton className="h-7 w-48 rounded-full" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-7 w-48 rounded-full" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-7 w-48 rounded-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-full" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>

                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 ">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md overflow-hidden rounded-3xl border-2  p-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">Error loading pet details</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="p-6 ">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md overflow-hidden rounded-3xl border-2">
            <h3 className="text-lg leading-6 font-medium text-red-600">Pet not found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested pet could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 ">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white shadow-md overflow-hidden rounded-sm border-2 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Image */}
            <div className="h-64 md:h-full bg-gray-200 relative overflow-hidden">
              <img
                src={pet.images || "/placeholder.svg?height=500&width=500"}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-pink-100 to-transparent opacity-70"></div>
            </div>

            {/* Pet Details */}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-purple-700">{pet.name}</h1>
                <span className="text-2xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">${pet.price.toFixed(2)}</span>
              </div>

              <p className="text-xl text-gray-700 mt-1">{pet.breed}</p>
              <p className="text-gray-600 mt-1 flex items-center">
                <span className="mr-1">🎂</span> Age: {pet.age} {pet.age === 1 ? "year" : "years"}
              </p>

              <div className="mt-4">
                <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full px-3 py-1 text-sm font-medium">
                  {pet.isAvailable ? "Available" : "Adopted"}
                </Badge>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold flex items-center text-pink-600">
                  <Heart className="mr-2 h-5 w-5 text-pink-500 animate-pulse" />
                  About {pet.name}
                </h2>
                <p className="mt-2 text-gray-700 bg-pink-50 p-4 rounded-2xl border border-pink-100">{pet.bio}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-purple-700">Detailed Description</h2>
                <p className="mt-2 text-gray-700 bg-purple-50 p-4 rounded-2xl border border-purple-100">{pet.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold flex items-center text-orange-600">
                  <Paw className="mr-2 h-5 w-5 text-orange-500" />
                  Compatibility
                </h2>

                <div className="mt-3 grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <div>
                    <div className="flex items-center">
                      <Activity className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-gray-700 font-medium">Energy Level:</span>
                    </div>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`h-3 w-8 mr-1 rounded-full ${level <= pet.energyLevel ? "bg-blue-500 animate-pulse" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-gray-700 font-medium">Space Required:</span>
                    </div>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`h-3 w-8 mr-1 rounded-full ${level <= pet.spaceRequired ? "bg-green-500" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-purple-500" />
                      <span className="text-gray-700 font-medium">Maintenance:</span>
                    </div>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`h-3 w-8 mr-1 rounded-full ${level <= pet.maintenance ? "bg-purple-500" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Baby className="mr-2 h-4 w-4 text-pink-500" />
                      <span className="text-gray-700 font-medium">Child Friendly:</span>
                    </div>
                    <div className="mt-1">
                      {pet.childFriendly ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full border border-green-200">Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full border border-red-200">No</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-teal-500" />
                      <span className="text-gray-700 font-medium">Allergy Safe:</span>
                    </div>
                    <div className="mt-1">
                      {pet.allergySafe ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full border border-green-200">Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full border border-red-200">No</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <Syringe className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-gray-700 font-medium">Vaccinated:</span>
                    </div>
                    <div className="mt-1">
                      {pet.vaccinated ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full border border-green-200">Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full border border-red-200">No</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Scissors className="mr-2 h-4 w-4 text-purple-500" />
                      <span className="text-gray-700 font-medium">Neutered/Spayed:</span>
                    </div>
                    <div className="mt-1">
                      {pet.neutered ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full border border-green-200">Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full border border-red-200">No</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {pet.tags && pet.tags.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pet.tags.map((tag) => (
                      <Badge key={tag} className="bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-full border border-pink-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Button 
                  onClick={handleBuyClick} 
                  className={`w-full py-6 text-lg rounded-full transition-all duration-300 ${
                    pet.isAvailable 
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg" 
                      : "bg-gray-300"
                  }`}
                  disabled={!pet.isAvailable}
                >
                  {pet.isAvailable 
                    ? <span className="flex items-center justify-center"><Heart className="mr-2 h-5 w-5" /> Adopt Now</span> 
                    : "Already Adopted"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}