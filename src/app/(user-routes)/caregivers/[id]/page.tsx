"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, CalendarIcon, DollarSign, Award, Briefcase } from "lucide-react"
import JobCalendar from "./_components/job-calendar"

// Define types
type Caregiver = {
  id: string
  name: string
  image: string | null
  bio: string
  hourlyRate: number
  totalEarnings: number
  country: string | null
  city: string | null
  area: string | null
  verified: boolean
  createdAt: string
}

type User = {
  id: string
  name: string
  image: string | null
}

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: User
}

type JobPost = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: string
  user: User
}

type CompletedJob = {
  id: string
  requestedAmount: number
  createdAt: string
  jobPost: JobPost
}

type Job = {
  id: string
  title: string
  client: string
  startDate: string
  endDate: string
  time: string
  location: string
  petName: string
  petType: string
  description: string
  amount: number
  status: string
  color?: string
}

type ProfileData = {
  caregiver: Caregiver
  reviews: Review[]
  averageRating: number
  completedJobs: CompletedJob[]
}

export default function CaregiverProfilePage() {
  const params = useParams()
  const caregiverId = params.id as string

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/users/caregivers/${caregiverId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch caregiver profile")
        }
        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        setError("Error loading caregiver profile")
        console.error(err)
      }
    }

    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/users/caregivers/${caregiverId}/schedule`)
        if (!response.ok) {
          throw new Error("Failed to fetch caregiver schedule")
        }
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (err) {
        console.error("Error loading schedule:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
    fetchSchedule()
  }, [caregiverId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error || "Failed to load caregiver profile"}</p>
        </div>
      </div>
    )
  }

  const { caregiver, reviews, averageRating, completedJobs } = profileData

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Caregiver Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={caregiver.image || "/placeholder.svg?height=128&width=128"} alt={caregiver.name} />
                <AvatarFallback>{caregiver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{caregiver.name}</h1>
                  <div className="flex items-center mt-2">
                    {caregiver.verified && (
                      <Badge variant="outline" className="mr-2 bg-blue-50">
                        <Award className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <div className="flex items-center text-lg font-semibold text-green-600">
                    <DollarSign className="h-5 w-5 mr-1" />${caregiver.hourlyRate}/hr
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Total Earnings: ${caregiver.totalEarnings}</div>
                </div>
              </div>

              {caregiver.country && caregiver.city && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {caregiver.area && `${caregiver.area}, `}
                    {caregiver.city}, {caregiver.country}
                  </span>
                </div>
              )}

              <div className="mt-2">
                <h3 className="font-medium text-gray-900">About</h3>
                <p className="mt-1 text-gray-600">{caregiver.bio}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Schedule, Reviews, and Work History */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="schedule">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <Briefcase className="h-4 w-4 mr-2" />
            Work History ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Caregiver Schedule</CardTitle>
              <CardDescription>View {caregiver.name}&apos;s availability and scheduled jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <JobCalendar jobs={jobs} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>What others are saying about {caregiver.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage
                            src={review.user.image || "/placeholder.svg?height=40&width=40"}
                            alt={review.user.name}
                          />
                          <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">{review.user.name}</h4>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex mt-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
              <CardDescription>Past jobs completed by {caregiver.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {completedJobs.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No work history yet</p>
              ) : (
                <div className="space-y-6">
                  {completedJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{job.jobPost.title}</h3>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage
                                  src={job.jobPost.user.image || "/placeholder.svg?height=24&width=24"}
                                  alt={job.jobPost.user.name}
                                />
                                <AvatarFallback>{job.jobPost.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span>Client: {job.jobPost.user.name}</span>
                            </div>
                            <p className="mt-3 text-gray-700 line-clamp-2">{job.jobPost.description}</p>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="text-green-600 font-medium">${job.requestedAmount}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(job.jobPost.startDate).toLocaleDateString()} -{" "}
                              {new Date(job.jobPost.endDate).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
