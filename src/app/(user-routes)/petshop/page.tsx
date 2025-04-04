"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Pet } from "@/types"

export default function PetShop() {
  const [pets, setPets] = useState<Pet[]>([])
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

        const response = await fetch("/api/users/petShop", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.message || "Failed to fetch pets")
        }

        const data = await response.json()
        console.log("Pets data:", data)
        setPets(data.pets)
      } catch (err: any) {
        console.error("Error fetching pets:", err)
        setError(err.message || "An error occurred while fetching pets")
      } finally {
        setLoading(false)
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

  if (pets.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Pet Shop</h1>
        <p className="text-gray-600">No pets are currently available for adoption.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Pet Shop</h1>
      <p className="text-gray-600 mb-6">Find your perfect companion! Browse our available pets for adoption.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Link key={pet.id} href={`/petshop/${pet.id}`} className="block">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={pet.images || "/placeholder.svg?height=300&width=300"}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
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
        ))}
      </div>
    </div>
  )
}

