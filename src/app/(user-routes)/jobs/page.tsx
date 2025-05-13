"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, TagIcon, DollarSignIcon, PlusIcon, BriefcaseIcon } from "lucide-react"
import { CreateJobDialog } from "./_components/create-job-dialog"
import { format } from "date-fns"

// Define proper TypeScript interfaces
interface JobPost {
  id: string
  title: string
  description: string
  city: string
  area: string
  tags: string[]
  priceRangeLow: number
  priceRangeHigh: number
  startDate: string
  endDate: string
  status: 'OPEN' | 'ONGOING' | 'CLOSED'
  applications: any[]
  createdAt: string
  userId: string
}

interface CreateJobData {
  title: string
  description: string
  city: string
  area: string
  tags: string[]
  priceRangeLow: number
  priceRangeHigh: number
  startDate: string
  endDate: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (): Promise<void> => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      
      const response = await fetch(`/api/users/jobs?userOnly=true&userId=${userId}`)
      if (!response.ok) {
        throw new Error(`Error fetching jobs: ${response.statusText}`)
      }
      
      const data = await response.json()
      setJobs(data.jobPosts || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async (jobData: CreateJobData): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      
      const response = await fetch("/api/users/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jobData,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`)
      }

      toast.success("Job posted successfully!")
      setIsDialogOpen(false)
      fetchJobs()
    } catch (error) {
      console.error("Error creating job:", error)
      toast.error("Failed to create job. Please try again.")
    }
  }

  const filterJobsByStatus = (status: JobPost['status']): JobPost[] => {
    return jobs.filter((job) => job.status === status)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const getActiveJobs = () => {
    switch (activeTab) {
      case "open":
        return filterJobsByStatus("OPEN")
      case "ongoing":
        return filterJobsByStatus("ONGOING")
      case "closed":
        return filterJobsByStatus("CLOSED")
      default:
        return jobs
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Pet Care Jobs</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Pet Care Jobs</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Post New Job
        </Button>
      </div>

      {/* Custom Animated Tabs */}
      <div className="mb-6">
        <div className="relative flex rounded-lg bg-gray-100 p-1">
          <div
            className="absolute h-8 bg-blue-500 rounded-md transition-all duration-300 ease-in-out shadow-md"
            style={{
              width: `${100 / 4}%`,
              left: activeTab === "all" 
                ? "0%" 
                : activeTab === "open" 
                ? "25%" 
                : activeTab === "ongoing" 
                ? "50%" 
                : "75%",
            }}
          ></div>

          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1 py-1 rounded-md transition-colors duration-200 text-sm
              ${activeTab === "all" ? "text-white font-medium" : "text-gray-700 hover:text-blue-600"}`}
          >
            <BriefcaseIcon size={14} />
            <span>All Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => handleTabChange("open")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1 py-1 rounded-md transition-colors duration-200 text-sm
              ${activeTab === "open" ? "text-white font-medium" : "text-gray-700 hover:text-blue-600"}`}
          >
            <BriefcaseIcon size={14} />
            <span>Open ({filterJobsByStatus("OPEN").length})</span>
          </button>

          <button
            onClick={() => handleTabChange("ongoing")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1 py-1 rounded-md transition-colors duration-200 text-sm
              ${activeTab === "ongoing" ? "text-white font-medium" : "text-gray-700 hover:text-blue-600"}`}
          >
            <BriefcaseIcon size={14} />
            <span>Ongoing ({filterJobsByStatus("ONGOING").length})</span>
          </button>

          <button
            onClick={() => handleTabChange("closed")}
            className={`flex-1 relative z-10 flex items-center justify-center gap-1 py-1 rounded-md transition-colors duration-200 text-sm
              ${activeTab === "closed" ? "text-white font-medium" : "text-gray-700 hover:text-blue-600"}`}
          >
            <BriefcaseIcon size={14} />
            <span>Closed ({filterJobsByStatus("CLOSED").length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getActiveJobs().length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">
                {activeTab === "all" 
                  ? "You haven't posted any jobs yet."
                  : `You don't have any ${activeTab.toLowerCase()} jobs.`}
              </p>
              {activeTab === "all" || activeTab === "open" ? (
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                  {activeTab === "all" ? "Post Your First Job" : "Post a New Job"}
                </Button>
              ) : null}
            </div>
          ) : (
            getActiveJobs().map((job) => (
              <JobCard key={job.id} job={job} onClick={() => router.push(`/jobs/${job.id}`)} />
            ))
          )}
        </div>
      </div>

      <CreateJobDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleCreateJob} />
    </div>
  )
}

interface JobCardProps {
  job: JobPost
  onClick: () => void
}

function JobCard({ job, onClick }: JobCardProps) {
  return (
    <Card className="h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <Badge className={`${getStatusColor(job.status)} text-white`}>{job.status}</Badge>
        </div>
        <CardDescription className="flex items-center text-sm">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {job.city}, {job.area}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">{job.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {job.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="flex items-center">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <DollarSignIcon className="h-4 w-4 mr-1" />${job.priceRangeLow} - ${job.priceRangeHigh}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {format(new Date(job.startDate), "MMM d")} - {format(new Date(job.endDate), "MMM d, yyyy")}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t text-sm text-gray-500">
        <div className="w-full flex justify-between items-center">
          <span>{job.applications.length} applications</span>
          <span>Posted {format(new Date(job.createdAt), "MMM d")}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function getStatusColor(status: JobPost['status']): string {
  switch (status) {
    case "OPEN":
      return "bg-green-500"
    case "ONGOING":
      return "bg-blue-500"
    case "CLOSED":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}