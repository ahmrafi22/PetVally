// _components/job-details-client.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { toast } from "sonner"
import Image from "next/image" // Import Image
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
import { CalendarIcon, MapPinIcon, TagIcon, DollarSignIcon, MailIcon, CheckIcon, TrashIcon, UserIcon } from "lucide-react" // Import necessary icons
import { format } from "date-fns"

// Import ReviewDialog and its type
import ReviewDialog from "./review-dialog"
import { ReviewData as ReviewDialogData } from "./review-dialog"


// Define proper TypeScript interfaces - MUST match original
interface Caregiver {
  id: string
  name: string
  email: string
  image: string | null
  city: string // Added based on original application display
  area: string // Added based on original application display
}

// Interface for job applications - MUST match original structure
interface Application {
  id: string
  caregiver: Caregiver // Original had 'caregiver', new had 'user'. Let's use 'caregiver' as per original.
  proposal: string // Corresponds to 'message' in new JobApplication
  requestedAmount: number // Added based on original application display
  status: "PENDING" | "ACCEPTED" | "REJECTED" // Added status property to match usage
}

// Interface for the job post - MUST match original structure
interface JobPost {
  id: string
  title: string
  description: string
  tags: string[]
  status: 'OPEN' | 'ONGOING' | 'CLOSED'
  city: string
  area: string
  country: string // Added based on original display
  priceRangeLow: number
  priceRangeHigh: number
  startDate: string
  endDate: string
  createdAt: string
  applications: Application[] // Use the corrected Application interface
  selectedCaregiver: Caregiver | null // Re-added based on original
  userId: string // The ID of the user who posted the job
}

interface JobDetailsClientProps {
  jobId: string
}

export default function JobDetailsClient({ jobId }: JobDetailsClientProps) {
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"select" | "end" | "delete" | null>(null)
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null) // Used for "select" action
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    fetchJobDetails()
  }, [jobId]) // Depend on jobId prop

  const fetchJobDetails = async (): Promise<void> => {
    try {
      setLoading(true)
      // Fetch without userId query param initially, as in original code's fetch logic
      const response = await fetch(`/api/users/jobs/${jobId}`)

      if (!response.ok) {
        // Check for 404 specifically
        if (response.status === 404) {
            setJob(null); // Indicate job not found
            return; // Stop processing
        }
        throw new Error(`Error fetching job details: ${response.statusText}`)
      }

      const data = await response.json()
      // Assuming the API returns the job object directly or nested under a key
      // Adjust `data.jobPost` if your API response structure is different now
      setJob(data.jobPost)
    } catch (error) {
      console.error("Error fetching job details:", error)
      // Only show toast if it's not a 404 resulting in job == null
      if (!(error as Error).message.includes("404")) {
         toast.error("Failed to load job details. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // --- Action Handlers from Original Code ---

  const handleSelectCaregiver = (caregiverId: string): void => {
    setSelectedCaregiverId(caregiverId)
    setConfirmAction("select")
    setConfirmDialogOpen(true)
  }

  const handleEndJob = (): void => {
    // Only open review dialog if status is ONGOING
    if (job?.status === "ONGOING") {
       // Ensure a selected caregiver exists before allowing review/end
       if (!job?.selectedCaregiver) {
          toast.error("Cannot end job: No caregiver selected yet.");
          return;
       }
      setReviewDialogOpen(true)
    } else {
       // For OPEN status, "End Job" button acts as "Cancel Job"
       setConfirmAction("end"); // Action is "end", but confirmation text will say "cancel"
       setConfirmDialogOpen(true);
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
        toast.error("User not authenticated.") // User feedback
        throw new Error("User ID not found")
      }
      if (!selectedCaregiverId) {
         toast.error("No caregiver selected for confirmation."); // User feedback
         throw new Error("No caregiver selected")
      }

      const response = await fetch(`/api/users/jobs/${jobId}`, { // Use jobId prop
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Consider adding Authorization header here if your API uses tokens
        },
        body: JSON.stringify({
          action: "select_caregiver",
          caregiverId: selectedCaregiverId,
          userId, // Pass userId in body as in original
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to select caregiver: ${response.statusText}`)
      }

      toast.success("Caregiver selected successfully!")
      setConfirmDialogOpen(false)
      fetchJobDetails() // Re-fetch to update UI
    } catch (error) {
      console.error("Error selecting caregiver:", error)
      toast.error("Failed to select caregiver. Please try again.")
    }
  }

  const confirmEndJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        toast.error("User not authenticated.")
        throw new Error("User ID not found")
      }
       // This handler is primarily for 'OPEN' status ("Cancel Job") now.
       // For 'ONGOING', handleReviewSubmit calls the end_job API.
       if (job?.status !== 'OPEN') {
           // This shouldn't happen if handleEndJob logic is followed, but good safeguard
           toast.error("Invalid state to cancel job directly.");
           setConfirmDialogOpen(false); // Close dialog if in wrong state
           return;
       }

      const response = await fetch(`/api/users/jobs/${jobId}`, { // Use jobId prop
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
           // Consider adding Authorization header here
        },
        body: JSON.stringify({
          action: "end_job", // Backend needs to handle this action for OPEN status (cancel)
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to end/cancel job: ${response.statusText}`)
      }

      toast.success("Job cancelled successfully!") // Specific message for cancellation
      setConfirmDialogOpen(false)
      fetchJobDetails() // Re-fetch to update UI
    } catch (error) {
      console.error("Error ending/cancelling job:", error)
      toast.error("Failed to cancel job. Please try again.")
    }
  }

  const confirmDeleteJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        toast.error("User not authenticated.")
        throw new Error("User ID not found")
      }

      const response = await fetch(`/api/users/jobs/${jobId}`, { // Use jobId prop
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
           // Consider adding Authorization header here
        },
        body: JSON.stringify({
           userId, // Pass userId in body for auth/ownership check on delete
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.statusText}`)
      }

      toast.success("Job deleted successfully!")
      setConfirmDialogOpen(false)
      router.push("/jobs") // Navigate back after deletion
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
      case "end": // This case handles cancellation for OPEN status
        confirmEndJob()
        break
      case "delete":
        confirmDeleteJob()
        break
      default:
        // Should not happen
        console.warn("Unknown confirm action:", confirmAction);
        setConfirmDialogOpen(false); // Close dialog to avoid being stuck
    }
  }

  // Handle Review Submit - This also ends the job
  const handleReviewSubmit = async (reviewData: ReviewDialogData): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
         toast.error("User not authenticated.");
        throw new Error("User ID not found")
      }
      // Ensure a selected caregiver and job exist before proceeding
      if (!job?.selectedCaregiver?.id) {
        toast.error("Cannot submit review: No selected caregiver found.");
        throw new Error("No selected caregiver found");
      }

      // First submit the review
      const reviewResponse = await fetch("/api/users/reviews", { // Adjust API path if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           // Consider adding Authorization header here
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
          caregiverId: job.selectedCaregiver.id,
          userId, // User submitting the review
          jobId: jobId, // The job being reviewed
        }),
      })

      if (!reviewResponse.ok) {
        // Attempt to read error body if available
        const errorBody = await reviewResponse.json().catch(() => ({ message: reviewResponse.statusText }));
        throw new Error(`Failed to submit review: ${errorBody.message}`);
      }

      // Then end the job via API call
      const jobEndResponse = await fetch(`/api/users/jobs/${jobId}`, {
        method: "PUT", // Or PATCH, depending on your API design for status updates
        headers: {
          "Content-Type": "application/json",
           // Consider adding Authorization header here
        },
        body: JSON.stringify({
          action: "end_job", // Action to change status to CLOSED
          userId, // User requesting the job end
        }),
      });

      if (!jobEndResponse.ok) {
         // Review submitted but job status update failed - handle this edge case?
         // For now, treat as overall failure, but log the job status update error.
         console.error("Error ending job after review:", await jobEndResponse.text());
         toast.error("Review submitted, but failed to update job status. Please contact support.");
          // Decide whether to throw here or return success for the review part
         throw new Error(`Failed to end job after review: ${jobEndResponse.statusText}`);
      }


      toast.success("Review submitted and job ended successfully!")
      setReviewDialogOpen(false)
      fetchJobDetails() // Re-fetch to update UI to CLOSED status
    } catch (error) {
      console.error("Error submitting review:", error)
      // Check if toast was already shown for auth error
      if (error instanceof Error && !error.message.includes("User not authenticated")) {
         toast.error(`Failed to submit review: ${(error as Error).message}`);
      }
      // If job end failed after review, review might be saved, job status not.
      // This simple catch doesn't differentiate. Refined error handling might be needed.
    }
  }


  // --- Helper Functions ---

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

   // Helper function for application badge colors (from your new code)
  function getApplicationStatusColor(status: Application['status']): string {
      switch (status) {
          case "PENDING":
              return "bg-yellow-500 text-white"
          case "ACCEPTED":
              return "bg-green-500 text-white"
          case "REJECTED":
              return "bg-red-500 text-white"
          default:
              return "bg-gray-500 text-white"
      }
  }


  // --- Render Logic ---

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
           {/* Added a simple spinner/text */}
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
          {/* Use getStatusColor helper */}
          <Badge className={`${getStatusColor(job.status)} text-white mr-2`}>{job.status}</Badge>
          <span className="text-gray-500 text-sm">Posted on {format(new Date(job.createdAt), "MMMM d, yyyy")}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
           {/* Show Delete only if OPEN */}
           {job.status === "OPEN" && (
            <Button variant="outline" onClick={handleDeleteJob}>
              <TrashIcon className="h-4 w-4 mr-2" /> Delete Job
            </Button>
           )}
           {/* Show End/Cancel Button unless CLOSED */}
           {job.status !== "CLOSED" && (
             <Button variant="outline" onClick={handleEndJob}>
               {job.status === "OPEN" ? "Cancel Job" : "End Job"} {/* Text changes based on status */}
             </Button>
           )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                {/* Use whitespace-pre-line to respect newlines in description */}
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

          {/* Selected Caregiver Card - Show only if ONGOING and caregiver selected */}
          {job.status === "ONGOING" && job.selectedCaregiver && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Selected Caregiver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {/* Caregiver Image */}
                  <div className="h-12 w-12 relative mr-4 overflow-hidden rounded-full">
                    <Image
                      src={job.selectedCaregiver.image || "/placeholder.svg"} // Use a fallback image
                      alt={job.selectedCaregiver.name || "Caregiver"}
                      fill
                      sizes="48px" // Add sizes prop for Image component
                      className="object-cover"
                    />
                  </div>
                  {/* Caregiver Name and Email */}
                  <div>
                    <h3 className="font-medium">{job.selectedCaregiver.name}</h3>
                    {/* Display email only if status is ONGOING (implies job owner is viewing) */}
                     {job.status === "ONGOING" && (
                         <p className="text-sm text-gray-500 flex items-center">
                            <MailIcon className="h-3 w-3 mr-1" />
                            {job.selectedCaregiver.email}
                         </p>
                     )}
                  </div>
                </div>
                {/* Contact Button */}
                <div className="mt-4">
                  <Button onClick={() => setContactDialogOpen(true)} className="w-full">
                    <MailIcon className="h-4 w-4 mr-2" /> Contact Caregiver
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Card - Show only if OPEN and there are applications */}
          {job.status === "OPEN" && job.applications.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Applications ({job.applications.length})</CardTitle>
                <CardDescription>Caregivers who have applied for this job</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.applications.map((application: Application) => (
                     // Only show applications with PENDING status in this list
                     application.status === 'PENDING' && (
                       <div key={application.id} className="border rounded-lg p-4">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center">
                             {/* Caregiver Image */}
                             <div className="h-10 w-10 relative mr-3 overflow-hidden rounded-full">
                               {/* Use application.caregiver.image based on the original interface */}
                               <Image
                                 src={application.caregiver.image || "/placeholder.svg"} // Use a fallback image
                                 alt={application.caregiver.name || "Caregiver"}
                                 fill
                                 sizes="40px" // Add sizes prop
                                 className="object-cover"
                               />
                             </div>
                             {/* Caregiver Name and Location */}
                             <div>
                               <h3 className="font-medium">{application.caregiver.name}</h3>
                               <p className="text-sm text-gray-500">
                                 {application.caregiver.city}, {application.caregiver.area}
                               </p>
                             </div>
                           </div>
                           {/* Requested Amount Badge */}
                           {/* Use application.requestedAmount based on the original interface */}
                           <Badge variant="outline">${application.requestedAmount}</Badge>
                         </div>
                         {/* Proposal */}
                         <div className="mt-3">
                           <h4 className="text-sm font-medium mb-1">Proposal</h4>
                           {/* Use application.proposal based on the original interface */}
                           <p className="text-sm text-gray-700 whitespace-pre-line">{application.proposal}</p>
                         </div>
                         {/* Select Button */}
                         <div className="mt-3 flex justify-end">
                           {/* Button to select this caregiver */}
                           <Button
                             size="sm"
                             onClick={() => handleSelectCaregiver(application.caregiver.id)} // Call original select handler
                           >
                             <CheckIcon className="h-4 w-4 mr-1" /> Select
                           </Button>
                         </div>
                       </div>
                     )
                  ))}
                   {/* Message if no PENDING applications but there were applications */}
                    {job.applications.length > 0 && job.applications.every(app => app.status !== 'PENDING') && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            All applications have been processed.
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

           {/* Message if OPEN but no applications */}
           {job.status === "OPEN" && job.applications.length === 0 && (
               <Card className="mt-6">
                <CardContent className="text-center py-6 text-gray-500">
                    No caregivers have applied yet.
                </CardContent>
               </Card>
           )}


        </div>

        {/* Right Sidebar / Status Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Status & Info</CardTitle> {/* More generic title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Current Status</h3>
                  <Badge className={`${getStatusColor(job.status)} text-white`}>{job.status}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Applications Received</h3> {/* More descriptive */}
                  <p>{job.applications.length} {job.applications.length === 1 ? 'caregiver' : 'caregivers'} have applied</p>
                </div>

                 {/* Display Accepted Caregiver Info */}
                 {job.status === "ONGOING" && job.selectedCaregiver && (
                   <div>
                     <h3 className="text-sm font-medium mb-1">Caregiver Working on Job</h3>
                     <p className="flex items-center text-gray-700">
                       <UserIcon className="h-4 w-4 mr-1" />
                       {job.selectedCaregiver.name}
                    </p>
                   </div>
                 )}

                <Separator /> {/* Separator added for clarity */}

                 {/* Status Guidance */}
                <div className="pt-2">
                  {job.status === "OPEN" && (
                    <p className="text-sm text-gray-500 mb-4">
                      Review applications and select a caregiver to begin the job.
                    </p>
                  )}
                  {job.status === "ONGOING" && job.selectedCaregiver && (
                    <p className="text-sm text-gray-500 mb-4">
                      Contact the selected caregiver to coordinate. Click &quot;End Job&quot; when complete.
                    </p>
                  )}
                   {job.status === "ONGOING" && !job.selectedCaregiver && (
                     <p className="text-sm text-gray-500 mb-4">
                       The job is ongoing, but the selected caregiver information is missing. Please check with support if this persists.
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

      {/* Contact Dialog - Show only if ONGOING and caregiver selected */}
      {job.status === "ONGOING" && job.selectedCaregiver && (
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
      )}


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
                  ? job.status === "OPEN" ? "Are you sure you want to cancel this job?" : "Are you sure you want to end this job?"
                  : "Are you sure you want to delete this job? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={confirmAction === "delete" ? "destructive" : "default"} onClick={handleConfirmAction}>
              {confirmAction === "select" ? "Select Caregiver" : confirmAction === "end" ? (job.status === "OPEN" ? "Yes, Cancel Job" : "Yes, End Job") : "Yes, Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog - Show only if ONGOING job is being ended */}
       {job.status === "ONGOING" && job.selectedCaregiver && (
           <ReviewDialog
             open={reviewDialogOpen}
             onOpenChange={setReviewDialogOpen}
             caregiverName={job.selectedCaregiver?.name || ""} // Pass caregiver name
             onSubmit={handleReviewSubmit} // Pass the submit handler
           />
       )}

    </div>
  )
}

// Helper function (kept for consistency, but can be defined inside the component)
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

// Helper function for application badge colors (kept)
function getApplicationStatusColor(status: Application['status']): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500 text-white"
    case "ACCEPTED": // Applications are marked ACCEPTED internally after job status becomes ONGOING
      return "bg-green-500 text-white"
    case "REJECTED": // Applications are marked REJECTED if not selected
      return "bg-red-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}