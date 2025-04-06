"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Camera, Edit, BadgeCheck, BadgeX } from "lucide-react"
import CaregiverProfileDialog from "../../_components/CaregiverProfileDialog"
import CaregiverImageDialog from "../../_components/CaregiverImageDialog"
import type { Caregiver } from "@/types"

// Client component to fetch caregiver data from API
export default function CaregiverProfile() {
  const params = useParams()
  const id = params.id as string

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchCaregiverData() {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("caregiverToken")

        if (!token) {
          throw new Error("Authentication token not found")
        }

        // Fetch caregiver data from the API
        const response = await fetch(`/api/caregivers/caregiverdata?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch caregiver data")
        }

        const data = await response.json()
        setCaregiver(data.caregiver)
      } catch (err: any) {
        console.error("Error fetching caregiver data:", err)
        setError(err.message || "An error occurred while fetching caregiver data")
      } finally {
        setLoading(false)
      }
    }

    fetchCaregiverData()
  }, [id])

  const handleCaregiverUpdate = (updatedCaregiver: Caregiver) => {
    setCaregiver(updatedCaregiver)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Error loading profile</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  if (!caregiver) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">Caregiver not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested caregiver profile could not be found.</p>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <>
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        {/* Profile header with image */}
        <div className="relative bg-green-600 h-32 sm:h-48">
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {caregiver.image ? (
                  <img
                    src={caregiver.image || "/placeholder.svg"}
                    alt={caregiver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Camera size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setImageDialogOpen(true)}
                className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                aria-label="Update profile picture"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 sm:right-8 flex space-x-2">
            <Button
              onClick={() => setProfileDialogOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile info */}
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{caregiver.name}</h1>
            {caregiver.verified ? (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <BadgeCheck size={14} className="mr-1" />
                Verified
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <BadgeX size={14} className="mr-1" />
                Not Verified
              </span>
            )}
          </div>
          <p className="text-gray-600">{caregiver.email}</p>

          {/* Location info */}
          {(caregiver.country || caregiver.city || caregiver.area) && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {caregiver.country && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="mt-1">{caregiver.country}</p>
                  </div>
                )}
                {caregiver.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="mt-1">{caregiver.city}</p>
                  </div>
                )}
                {caregiver.area && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Area</p>
                    <p className="mt-1">{caregiver.area}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">About Me</h2>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{caregiver.bio || "No bio provided yet."}</p>
          </div>

          {/* Financial info */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Rates & Earnings</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                <p className="mt-1 text-xl font-semibold text-green-600">{formatCurrency(caregiver.hourlyRate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="mt-1 text-xl font-semibold text-green-600">{formatCurrency(caregiver.totalEarnings)}</p>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="mt-1">{new Date(caregiver.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="mt-1">{new Date(caregiver.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CaregiverProfileDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        caregiver={caregiver}
        onUpdate={handleCaregiverUpdate}
      />

      <CaregiverImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        caregiver={caregiver}
        onUpdate={handleCaregiverUpdate}
      />
    </>
  )
}

