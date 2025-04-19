"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

type Meeting = {
  id: string
  description: string
  meetingSchedule: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  donationPost: {
    id: string
    title: string
    images: string
    country: string
    city: string
    area: string
    user: {
      id: string
      name: string
      image: string | null
      email: string | null
    }
  }
  user?: {
    id: string
    name: string
    image: string | null
    email: string | null
  }
}

export default function MyMeetingsPage() {
  const [applicantMeetings, setApplicantMeetings] = useState<Meeting[]>([])
  const [ownerMeetings, setOwnerMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch("/api/users/donation/meetings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch meetings")
      }

      const data = await response.json()
      setApplicantMeetings(data.meetings.applicantMeetings)
      setOwnerMeetings(data.meetings.ownerMeetings)
    } catch (error: any) {
      console.error("Error fetching meetings:", error)
      setError(error.message || "An error occurred while fetching your meetings")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const isMeetingPast = (dateString: string) => {
    const meetingDate = new Date(dateString)
    const now = new Date()
    return meetingDate < now
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">My Meetings</h1>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">My Meetings</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={fetchMeetings}>Retry</Button>
      </div>
    )
  }

  const hasMeetings = applicantMeetings.length > 0 || ownerMeetings.length > 0

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Meetings</h1>

      {!hasMeetings ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Meetings Scheduled</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have any scheduled meetings yet. Apply to adopt a pet or accept adoption applications to schedule
            meetings.
          </p>
          <Button onClick={() => router.push("/donation")}>Browse Pets for Adoption</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Meetings where user is the applicant */}
          {applicantMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pets You&apos;re Adopting</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applicantMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row items-start gap-4">
                      {/* Circular pet image */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-purple-200">
                          <img
                            src={meeting.donationPost.images || "/placeholder.svg"}
                            alt={meeting.donationPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Meeting details */}
                      <div className="flex-grow w-full sm:w-auto">
                        <Link
                          href={`/donation/${meeting.donationPost.id}`}
                          className="text-lg font-semibold text-blue-500 hover:underline block text-center sm:text-left"
                        >
                          {meeting.donationPost.title}
                        </Link>

                        <div className="mt-3 space-y-3">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Meeting Time</p>
                              <p className="text-sm text-gray-600">{formatDate(meeting.meetingSchedule)}</p>
                              {isMeetingPast(meeting.meetingSchedule) && (
                                <Badge className="mt-1 bg-yellow-100 text-yellow-800">Past Meeting</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm text-gray-600 break-words">
                                {meeting.donationPost.area}, {meeting.donationPost.city}, {meeting.donationPost.country}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <User className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Pet Owner</p>
                              <Link  href={`profile/${meeting.donationPost.user.id}`}> 
                              <p className="text-sm text-orange-500">{meeting.donationPost.user.name}</p>
                              </Link>
                              {meeting.donationPost.user.email && (
                                <p className="text-xs text-gray-500 break-words">{meeting.donationPost.user.email}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-center sm:text-left">
                          <Link href={`/donation/${meeting.donationPost.id}`}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              View Pet Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meetings where user is the pet owner */}
          {ownerMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pets You&apos;re Donating</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row items-start gap-4">
                      {/* Circular pet image */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-purple-200">
                          <img
                            src={meeting.donationPost.images || "/placeholder.svg"}
                            alt={meeting.donationPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Meeting details */}
                      <div className="flex-grow w-full sm:w-auto">
                        <Link
                          href={`/donation/${meeting.donationPost.id}`}
                          className="text-lg font-semibold text-blue-500 hover:underline block text-center sm:text-left"
                        >
                          {meeting.donationPost.title}
                        </Link>

                        <div className="mt-3 space-y-3">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Meeting Time</p>
                              <p className="text-sm text-gray-600">{formatDate(meeting.meetingSchedule)}</p>
                              {isMeetingPast(meeting.meetingSchedule) && (
                                <Badge className="mt-1 bg-yellow-100 text-yellow-800">Past Meeting</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start">
                            <User className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Adopter</p>
                              <Link href={`profile/${meeting.user?.id}`}> 
                              <p className="text-sm text-orange-500">{meeting.user?.name}</p>
                              </Link> 
                              {meeting.user?.email && (
                                <p className="text-xs text-gray-500 break-words">{meeting.user.email}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-center sm:text-left">
                          <Link href={`/donation/${meeting.donationPost.id}`}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              View Pet Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}