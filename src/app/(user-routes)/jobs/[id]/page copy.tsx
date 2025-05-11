"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPinIcon, TagIcon, DollarSignIcon, MailIcon, CheckIcon, TrashIcon } from "lucide-react"
import { format } from "date-fns"


import ReviewDialog from "./_components/review-dialog"
import { ReviewData as ReviewDialogData } from "./_components/review-dialog" 
interface Caregiver {
  id: string
  name: string
  email: string
  image: string | null
  city: string
  area: string
}

interface Application {
  id: string
  caregiver: Caregiver
  proposal: string
  requestedAmount: number
}

interface JobPost {
  id: string
  title: string
  description: string
  tags: string[]
  status: 'OPEN' | 'ONGOING' | 'CLOSED'
  city: string
  area: string
  country: string
  priceRangeLow: number
  priceRangeHigh: number
  startDate: string
  endDate: string
  createdAt: string
  applications: Application[]
  selectedCaregiver: Caregiver | null
  userId: string
}

type Props = {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function JobDetailPage({ params }: Props) {
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"select" | "end" | "delete" | null>(null)
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchJobDetails()
  }, [params.id])

  const fetchJobDetails = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/jobs/${params.id}`)
      if (!response.ok) {
        throw new Error(`Error fetching job details: ${response.statusText}`)
      }
      const data = await response.json()
      setJob(data.jobPost)
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast.error("Failed to load job details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCaregiver = (caregiverId: string): void => {
    setSelectedCaregiverId(caregiverId)
    setConfirmAction("select")
    setConfirmDialogOpen(true)
  }

  const handleEndJob = (): void => {
    if (job?.status === "ONGOING") {
      setReviewDialogOpen(true)
    } else {
      setConfirmAction("end")
      setConfirmDialogOpen(true)
    }
  }

  const handleDeleteJob = (): void => {
    setConfirmAction("delete")
    setConfirmDialogOpen(true)
  }

  const confirmSelectCaregiver = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      if (!selectedCaregiverId) {
        throw new Error("No caregiver selected")
      }

      const response = await fetch(`/api/users/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "select_caregiver",
          caregiverId: selectedCaregiverId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to select caregiver: ${response.statusText}`)
      }

      toast.success("Caregiver selected successfully!")
      setConfirmDialogOpen(false)
      fetchJobDetails()
    } catch (error) {
      console.error("Error selecting caregiver:", error)
      toast.error("Failed to select caregiver. Please try again.")
    }
  }

  const confirmEndJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      const response = await fetch(`/api/users/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end_job",
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to end job: ${response.statusText}`)
      }

      toast.success("Job ended successfully!")
      setConfirmDialogOpen(false)
      fetchJobDetails()
    } catch (error) {
      console.error("Error ending job:", error)
      toast.error("Failed to end job. Please try again.")
    }
  }

  const confirmDeleteJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      const response = await fetch(`/api/users/jobs/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.statusText}`)
      }

      toast.success("Job deleted successfully!")
      setConfirmDialogOpen(false)
      router.push("/jobs")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job. Please try again.")
    }
  }

  const handleConfirmAction = (): void => {
    switch (confirmAction) {
      case "select":
        confirmSelectCaregiver()
        break
      case "end":
        confirmEndJob()
        break
      case "delete":
        confirmDeleteJob()
        break
    }
  }

  // Use the imported type for the parameter
  const handleReviewSubmit = async (reviewData: ReviewDialogData): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }
      if (!job?.selectedCaregiver?.id) {
        throw new Error("No selected caregiver found")
      }

      // First submit the review
      const reviewResponse = await fetch("/api/users/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewData.rating, // Access properties directly
          comment: reviewData.comment, // Access properties directly
          caregiverId: job.selectedCaregiver.id,
          userId,
          jobId: params.id, // Add the correct jobId from params
        }),
      })

      if (!reviewResponse.ok) {
        throw new Error(`Failed to submit review: ${reviewResponse.statusText}`)
      }

      // Then end the job
      const jobResponse = await fetch(`/api/users/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end_job",
          userId,
        }),
      })

      if (!jobResponse.ok) {
        throw new Error(`Failed to end job: ${jobResponse.statusText}`)
      }

      toast.success("Review submitted and job ended successfully!")
      setReviewDialogOpen(false)
      fetchJobDetails()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          Loading job details...
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">
          The job you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <div>
          <Badge className={`${getStatusColor(job.status)} text-white mr-2`}>{job.status}</Badge>
          <span className="text-gray-500 text-sm">Posted on {format(new Date(job.createdAt), "MMMM d, yyyy")}</span>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
         {job.status === "OPEN" && (
          <Button variant="outline" onClick={handleDeleteJob}>
            <TrashIcon className="h-4 w-4 mr-2" /> Delete Job
          </Button>
        )}
        {job.status !== "CLOSED" && (
          <Button variant="outline" onClick={handleEndJob}>
             {job.status === "OPEN" ? "Cancel Job" : "End Job"}
          </Button>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Services Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="flex items-center">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <p className="flex items-center text-gray-700">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {job.area}, {job.city}, {job.country}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Budget Range</h3>
                  <p className="flex items-center text-gray-700">
                    <DollarSignIcon className="h-4 w-4 mr-2" />${job.priceRangeLow} - ${job.priceRangeHigh}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Start Date</h3>
                  <p className="flex items-center text-gray-700">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(job.startDate), "MMMM d, yyyy")}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">End Date</h3>
                  <p className="flex items-center text-gray-700">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(job.endDate), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {job.status === "ONGOING" && job.selectedCaregiver && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Selected Caregiver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-12 w-12 relative mr-4 overflow-hidden rounded-full">
                    <Image
                      src={job.selectedCaregiver.image || "/placeholder.svg?height=40&width=40"}
                      alt={job.selectedCaregiver.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{job.selectedCaregiver.name}</h3>
                    <p className="text-sm text-gray-500">{job.selectedCaregiver.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setContactDialogOpen(true)} className="w-full">
                    <MailIcon className="h-4 w-4 mr-2" /> Contact Caregiver
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "OPEN" && job.applications.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Applications ({job.applications.length})</CardTitle>
                <CardDescription>Caregivers who have applied for this job</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.applications.map((application: Application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 relative mr-3 overflow-hidden rounded-full">
                            <Image
                              src={application.caregiver.image || "/placeholder.svg?height=40&width=40"}
                              alt={application.caregiver.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.caregiver.name}</h3>
                            <p className="text-sm text-gray-500">
                              {application.caregiver.city}, {application.caregiver.area}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">${application.requestedAmount}</Badge>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-1">Proposal</h4>
                        <p className="text-sm text-gray-700">{application.proposal}</p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" onClick={() => handleSelectCaregiver(application.caregiver.id)}>
                          <CheckIcon className="h-4 w-4 mr-1" /> Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Current Status</h3>
                  <Badge className={`${getStatusColor(job.status)} text-white`}>{job.status}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Applications</h3>
                  <p>{job.applications.length} caregivers have applied</p>
                </div>

                {job.selectedCaregiver && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Selected Caregiver</h3>
                    <p>{job.selectedCaregiver.name}</p>
                  </div>
                )}

                <Separator />

                <div className="pt-2">
                  {job.status === "OPEN" && (
                    <p className="text-sm text-gray-500 mb-4">
                      Once you select a caregiver, the job status will change to &quot;Ongoing&quot;.
                    </p>
                  )}
                  {job.status === "ONGOING" && (
                    <p className="text-sm text-gray-500 mb-4">
                      When the job is complete, click &quot;End Job&quot; to finalize and leave a review.
                    </p>
                  )}
                  {job.status === "CLOSED" && (
                    <p className="text-sm text-gray-500 mb-4">This job has been completed or cancelled.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>Here&apos;s how to get in touch with {job.selectedCaregiver?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium mb-2">Email Address:</p>
            <p className="flex items-center">
              <MailIcon className="h-4 w-4 mr-2" />
              {job.selectedCaregiver?.email}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "select" ? "Select Caregiver" : confirmAction === "end" ? "End Job" : "Delete Job"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "select"
                ? "Are you sure you want to select this caregiver? This will change the job status to 'Ongoing'."
                : confirmAction === "end"
                  ? "Are you sure you want to end this job? This will change the job status to 'Closed'."
                  : "Are you sure you want to delete this job? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={confirmAction === "delete" ? "destructive" : "default"} onClick={handleConfirmAction}>
              {confirmAction === "select" ? "Select Caregiver" : confirmAction === "end" ? "End Job" : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        caregiverName={job.selectedCaregiver?.name || ""}
        onSubmit={handleReviewSubmit} // This is now compatible
      />
    </div>
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