"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Tag, DollarSign, Clock, Search, Briefcase, Home } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function FindJobPage() {
  const [localJobs, setLocalJobs] = useState<any[]>([])
  const [otherJobs, setOtherJobs] = useState<any[]>([])
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("caregiverToken")

        if (!token) {
          router.push("/caregiverlogin")
          return
        }

        // Fetch available jobs
        const response = await fetch("/api/caregivers/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setLocalJobs(data.localJobs || [])
          setOtherJobs(data.otherJobs || [])
        } else {
          const errorData = await response.json()
          console.error("Failed to fetch jobs:", errorData.error)

          if (response.status === 401) {
            router.push("/caregiverlogin")
          }
        }

        // Fetch applied jobs
        const appliedResponse = await fetch("/api/caregivers/jobs?appliedOnly=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (appliedResponse.ok) {
          const appliedData = await appliedResponse.json()
          setAppliedJobs(appliedData.applications || [])
        } else {
          const errorData = await appliedResponse.json()
          console.error("Failed to fetch applied jobs:", errorData.error)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setLoading(false)
      }
    }

    fetchJobs()
  }, [router])

  const filteredLocalJobs = localJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredOtherJobs = otherJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredAppliedJobs = appliedJobs.filter(
    (app) =>
      app.jobPost.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobPost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobPost.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find Pet Care Jobs</h1>
          <p className="text-gray-600 mt-2">Browse and apply for pet care jobs in your area</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search jobs..."
            className="pl-10 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="local">
        <TabsList className="mb-6">
          <TabsTrigger value="local">Local Jobs</TabsTrigger>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredLocalJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocalJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={14} className="mr-1" />
                      <span>
                        {job.city}, {job.area}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={job.user.image || "/placeholder.svg?height=24&width=24"}
                          alt={job.user.name}
                        />
                        <AvatarFallback>{job.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{job.user.name}</span>
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={14} className="mr-1" />
                        <span>
                          ${job.priceRangeLow} - ${job.priceRangeHigh}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        <span>{format(new Date(job.startDate), "MMM d")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/findjobs/${job.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No local jobs found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "There are no jobs in your area right now"}
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="#all" onClick={() => (document.querySelector('[data-value="all"]') as HTMLElement)?.click()}>
                    Browse All Jobs
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredOtherJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOtherJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={14} className="mr-1" />
                      <span>
                        {job.city}, {job.area}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={job.user.image || "/placeholder.svg?height=24&width=24"}
                          alt={job.user.name}
                        />
                        <AvatarFallback>{job.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{job.user.name}</span>
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={14} className="mr-1" />
                        <span>
                          ${job.priceRangeLow} - ${job.priceRangeHigh}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        <span>{format(new Date(job.startDate), "MMM d")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/findjobs/${job.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "There are no available jobs at the moment"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredAppliedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppliedJobs.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{application.jobPost.title}</CardTitle>
                      <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={14} className="mr-1" />
                      <span>
                        {application.jobPost.city}, {application.jobPost.area}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={application.jobPost.user.image || "/placeholder.svg?height=24&width=24"}
                          alt={application.jobPost.user.name}
                        />
                        <AvatarFallback>{application.jobPost.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{application.jobPost.user.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={14} className="mr-1" />
                        <span>Your bid: ${application.requestedAmount}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        <span>{format(new Date(application.jobPost.startDate), "MMM d")}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-1" />
                        <span>Applied {format(new Date(application.createdAt), "MMM d")}</span>
                      </div>
                    </div>

                    <div className="line-clamp-2 text-sm text-gray-600">
                      <span className="font-medium">Your proposal:</span> {application.proposal}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/caregiver/findjob/${application.jobPost.id}`}>View Job</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "You haven't applied to any jobs yet"}
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="#local" onClick={() => {
                    const element = document.querySelector('[data-value="local"]');
                    if (element instanceof HTMLElement) {
                      element.click();
                    }
                  }}>
                    Browse Local Jobs
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
