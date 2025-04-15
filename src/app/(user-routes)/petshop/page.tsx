"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, CheckCircle, Sparkle, Heart, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Pet } from "@/types"
import { ReactLenis, useLenis } from 'lenis/react'

type ScoredPet = Pet & { compatibilityScore: number }

export default function PetShop() {
  const [recommendedPets, setRecommendedPets] = useState<ScoredPet[]>([])
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const lenis = useLenis(({ scroll }) => {
  })

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
        setFilteredPets(recommendationsData.recommendations.allPets)
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
          setFilteredPets(data.pets)
        } catch (fallbackErr) {
          setError(err.message || "An error occurred while fetching pets")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPets()
  }, [router])

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPets(allPets)
      return
    }

    // Split search term by spaces to get individual tags (up to 3)
    const searchTags = searchTerm.toLowerCase().split(" ").filter(Boolean).slice(0, 3)

    if (searchTags.length === 0) {
      setFilteredPets(allPets)
      return
    }

    // Filter pets based on tags
    const filtered = allPets.filter((pet) => {
      if (!pet.tags || pet.tags.length === 0) return false

      // Convert pet tags to lowercase for case-insensitive comparison
      const petTagsLower = pet.tags.map((tag) => tag.toLowerCase())

      // Check if any of the search tags match any of the pet tags
      return searchTags.some((searchTag) => petTagsLower.some((petTag) => petTag.includes(searchTag)))
    })

    setFilteredPets(filtered)
  }, [searchTerm, allPets])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Function to render a pet card
  const renderPetCard = (pet: Pet, showScore = false) => {
    const scoredPet = pet as ScoredPet

    return (
      <Link key={pet.id} href={`/petshop/${pet.id}`} className="block">
        <div className="border-2  rounded-sm   overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 bg-white">
          <div className="h-72 bg-gray-200 relative overflow-hidden">
            <img
              src={pet.images || "/placeholder.svg?height=300&width=300"}
              alt={pet.name}
              className="w-full h-full object-cover object-[0%_40%]"
            />
            {showScore && scoredPet.compatibilityScore && (
              <div className="absolute top-2 right-2 bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-md animate-pulse">
                {Math.round(scoredPet.compatibilityScore)}%
              </div>
            )}
            {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent opacity-70"></div> */}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{pet.name}</h2>
              <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-sm">${pet.price.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 font-medium">{pet.breed}</p>
            <p className="text-gray-500 text-sm flex items-center">
               Age: {pet.age} {pet.age === 1 ? "year" : "years"}
            </p>

            {/* Tags */}
            {pet.tags && pet.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pet.tags.slice(0, 3).map((tag,index) => (
                  <span key={index} className="inline-block px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full border border-pink-200">
                    {tag}
                  </span>
                ))}
                {pet.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                    +{pet.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Health indicators */}
            <div className="mt-2.5 flex gap-2">
              {pet.vaccinated && (
                <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle size={12} className="mr-1" /> Vaccinated
                </span>
              )}
              {pet.neutered && (
                <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  <CheckCircle size={12} className="mr-1" /> Neutered
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Skeleton loader for pet cards
  const renderSkeletonCard = () => (
    <div className="border-2 border-pink-100 rounded-sm overflow-hidden shadow-sm bg-white">
      <Skeleton className="h-72 w-full" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )

  return (
    <ReactLenis root>
    <div className=" container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-pink-50 p-6 rounded-lg mb-8">

        
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg">
            Find your perfect companion! Browse our available pets for adoption.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-pink-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by tags (e.g., dog friendly gentle)"
              className="pl-10 py-2 border-2 border-pink-200 rounded-full focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 px-3 text-pink-500 hover:text-pink-700"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Searching for: {searchTerm.split(" ").filter(Boolean).slice(0, 3).join(", ")}
            </p>
          )}
        </div>
        </div>

        {loading ? (
          <>
            {/* Recommended Pets Skeleton */}
            <div className="mb-10">
              <Skeleton className="h-8 w-64 mb-4 rounded-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>{renderSkeletonCard()}</div>
                ))}
              </div>
            </div>

            {/* All Pets Skeleton */}
            <Skeleton className="h-8 w-48 mb-4 mx-auto rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>{renderSkeletonCard()}</div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="bg-white shadow-md overflow-hidden rounded-3xl p-6 border-2 border-pink-200">
            <h3 className="text-lg leading-6 font-medium text-red-600">Error loading pet shop</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        ) : filteredPets.length === 0 && searchTerm ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-sm border-2 border-pink-200">
            No pets found matching your search. Try different tags or clear your search.
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="rounded-full border-2 cursor-pointer hover:bg-pink-50"
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : allPets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-sm  border-pink-200">
            No pets are currently available for adoption.
          </div>
        ) : (
          <>
            {/* show recommended pets when not searching */}
            {!searchTerm && recommendedPets.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-violet-600 flex items-center justify-center sm:justify-start">
                  <Heart className="mr-2 text-pink-600 fill-current animate-bounce" />
                  <span className="relative ">
                    Suggested Pets for You
                    <span className="absolute -top-1 -right-2 flex h-3 w-3">
                    </span>
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedPets.map((pet) => renderPetCard(pet, true))}
                </div>
                <p className="mt-2.5 text-gray-500 text-center italic">
                  Note: Please change your preferences in your profile to get proper recommendations
                </p>
              </div>
            )}

            {/* All Available Pets Section (or filtered pets when searching) */}
            <h2 className="text-xl font-semibold mb-4 text-center text-purple-700 flex items-center justify-center">
              {searchTerm ? "Search Results" : "All Available Pets"}
            </h2>
            {filteredPets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-sm border-2 border-pink-200">
                No pets found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => renderPetCard(pet))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </ReactLenis>
  )
}