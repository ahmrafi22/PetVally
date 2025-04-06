"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Pet } from "@/types"

type ScoredPet = Pet & { compatibilityScore: number }

export default function PetShop() {
  const [recommendedPets, setRecommendedPets] = useState<ScoredPet[]>([])
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPets() {
      try {
        const token = localStorage.getItem("userToken")
        if (!token) {
          router.push("/userlogin")
          return
        }

        // Fetch pet recommendations
        const recommendationsResponse = await fetch("api/users/petShop/recommendations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!recommendationsResponse.ok) {
          const errorData = await recommendationsResponse.json()
          console.error("API Error (Recommendations):", errorData)
          throw new Error(errorData.message || "Failed to fetch pet recommendations")
        }

        const recommendationsData = await recommendationsResponse.json()
        console.log("Pet recommendations:", recommendationsData)

        setRecommendedPets(recommendationsData.recommendations.recommendedPets)
        setAllPets(recommendationsData.recommendations.allPets)
        setLoading(false)
      } catch (err: any) {
        console.error("Error fetching pets:", err)

        // Fallback to regular pet list if recommendations fail
        try {
          const token = localStorage.getItem("userToken")
          const response = await fetch("/api/users/petShop", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch pets")
          }

          const data = await response.json()
          setAllPets(data.pets)
        } catch (fallbackErr) {
          setError(err.message || "An error occurred while fetching pets")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPets()
  }, [router])

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
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading pet shop</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  if (allPets.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Pet Shop</h1>
        <p className="text-gray-600">No pets are currently available for adoption.</p>
      </div>
    )
  }

  // Function to render a pet card
  const renderPetCard = (pet: Pet, showScore = false) => {
    const scoredPet = pet as ScoredPet

    return (
      <Link key={pet.id} href={`/petshop/${pet.id}`} className="block">
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 bg-gray-200 relative">
            <img
              src={pet.images || "/placeholder.svg?height=300&width=300"}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            {showScore && scoredPet.compatibilityScore && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                {Math.round(scoredPet.compatibilityScore)}%
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{pet.name}</h2>
              <span className="text-green-600 font-bold">${pet.price.toFixed(2)}</span>
            </div>
            <p className="text-gray-600">{pet.breed}</p>
            <p className="text-gray-500 text-sm">
              Age: {pet.age} {pet.age === 1 ? "year" : "years"}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Pet Shop</h1>
      <p className="text-gray-600 mb-6 text-center">Find your perfect companion! Browse our available pets for adoption.</p>

      {/* Recommended Pets Section */}
      {recommendedPets.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
            <span className="mr-2">✨</span> Suggested Pets for You
          </h2>
          <p className="mb-2 text-gray-500">Note: Please change your preferences in your profile to get proper recommendations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedPets.map((pet) => renderPetCard(pet, true))}
          </div>
        </div>
      )}

      {/* All Available Pets Section */}
      <h2 className="text-xl font-semibold mb-4 text-center">All Available Pets</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPets.map((pet) => renderPetCard(pet))}
      </div>
    </div>
  )
}

