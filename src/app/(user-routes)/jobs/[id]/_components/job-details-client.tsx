"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  User,
  Mail,
  Check,
  Trash,
  Clock,
  X,
  PhoneCall,
} from "lucide-react";

import ReviewDialog from "./review-dialog";
import { ReviewData as ReviewDialogData } from "./review-dialog";

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  city: string;
  area: string;
}

interface Application {
  id: string;
  caregiver: Caregiver;
  proposal: string;
  requestedAmount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface JobPost {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "OPEN" | "ONGOING" | "CLOSED";
  city: string;
  area: string;
  country: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  applications: Application[];
  selectedCaregiver: Caregiver | null;
  userId: string;
}

interface JobDetailsClientProps {
  jobId: string;
}

export default function JobDetailsClient({ jobId }: JobDetailsClientProps) {
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "select" | "end" | "delete" | null
  >(null);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(
    null
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/jobs/${jobId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setJob(null);
          return;
        }
        throw new Error(`Error fetching job details: ${response.statusText}`);
      }

      const data = await response.json();
      setJob(data.jobPost);
    } catch (error) {
      console.error("Error fetching job details:", error);
      if (!(error as Error).message.includes("404")) {
        toast.error("Failed to load job details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCaregiver = (caregiverId: string): void => {
    setSelectedCaregiverId(caregiverId);
    setConfirmAction("select");
    setConfirmDialogOpen(true);
  };

  const handleEndJob = (): void => {
    if (job?.status === "ONGOING") {
      if (!job?.selectedCaregiver) {
        toast.error("Cannot end job: No caregiver selected yet.");
        return;
      }
      setReviewDialogOpen(true);
    } else {
      setConfirmAction("end");
      setConfirmDialogOpen(true);
    }
  };

  const handleDeleteJob = (): void => {
    setConfirmAction("delete");
    setConfirmDialogOpen(true);
  };

  const confirmSelectCaregiver = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        throw new Error("User ID not found");
      }
      if (!selectedCaregiverId) {
        toast.error("No caregiver selected for confirmation.");
        throw new Error("No caregiver selected");
      }

      const response = await fetch(`/api/users/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "select_caregiver",
          caregiverId: selectedCaregiverId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to select caregiver: ${response.statusText}`);
      }

      toast.success("Caregiver selected successfully!");
      setConfirmDialogOpen(false);
      fetchJobDetails();
    } catch (error) {
      console.error("Error selecting caregiver:", error);
      toast.error("Failed to select caregiver. Please try again.");
    }
  };

  const confirmEndJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        throw new Error("User ID not found");
      }
      if (job?.status !== "OPEN") {
        toast.error("Invalid state to cancel job directly.");
        setConfirmDialogOpen(false);
        return;
      }

      const response = await fetch(`/api/users/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end_job",
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to end/cancel job: ${response.statusText}`);
      }

      toast.success("Job cancelled successfully!");
      setConfirmDialogOpen(false);
      fetchJobDetails();
    } catch (error) {
      console.error("Error ending/cancelling job:", error);
      toast.error("Failed to cancel job. Please try again.");
    }
  };

  const confirmDeleteJob = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        throw new Error("User ID not found");
      }

      const response = await fetch(`/api/users/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.statusText}`);
      }

      toast.success("Job deleted successfully!");
      setConfirmDialogOpen(false);
      router.push("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job. Please try again.");
    }
  };

  const handleConfirmAction = (): void => {
    switch (confirmAction) {
      case "select":
        confirmSelectCaregiver();
        break;
      case "end":
        confirmEndJob();
        break;
      case "delete":
        confirmDeleteJob();
        break;
      default:
        console.warn("Unknown confirm action:", confirmAction);
        setConfirmDialogOpen(false);
    }
  };

  const handleReviewSubmit = async (
    reviewData: ReviewDialogData
  ): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated.");
        throw new Error("User ID not found");
      }
      if (!job?.selectedCaregiver?.id) {
        toast.error("Cannot submit review: No selected caregiver found.");
        throw new Error("No selected caregiver found");
      }

      const reviewResponse = await fetch("/api/users/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
          caregiverId: job.selectedCaregiver.id,
          userId,
          jobId: jobId,
        }),
      });

      if (!reviewResponse.ok) {
        const errorBody = await reviewResponse
          .json()
          .catch(() => ({ message: reviewResponse.statusText }));
        throw new Error(`Failed to submit review: ${errorBody.message}`);
      }

      const jobEndResponse = await fetch(`/api/users/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "end_job",
          userId,
        }),
      });

      if (!jobEndResponse.ok) {
        console.error(
          "Error ending job after review:",
          await jobEndResponse.text()
        );
        toast.error(
          "Review submitted, but failed to update job status. Please contact support."
        );
        throw new Error(
          `Failed to end job after review: ${jobEndResponse.statusText}`
        );
      }

      toast.success("Review submitted and job ended successfully!");
      setReviewDialogOpen(false);
      fetchJobDetails();
    } catch (error) {
      console.error("Error submitting review:", error);
      if (
        error instanceof Error &&
        !error.message.includes("User not authenticated")
      ) {
        toast.error(`Failed to submit review: ${(error as Error).message}`);
      }
    }
  };

  const getStatusColor = (status: JobPost["status"]): string => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ONGOING":
        return "bg-blue-100 text-blue-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const visitCaregiverProfile = (caregiverId: string) => {
    router.push(`/caregivers/${caregiverId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex flex-wrap gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle className="text-lg font-semibold">
            Job Not Found
          </AlertTitle>
          <AlertDescription>
            The job you&apos;re looking for might have been removed or
            doesn&apos;t exist.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-3">
            <Link href="/jobs">
              <ArrowLeft size={16} className="mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <Badge className={`${getStatusColor(job.status)} mr-3`}>
            {job.status}
          </Badge>
          <span className="text-sm text-gray-500">
            Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job details card */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Job Details</span>
                <div className="flex items-center space-x-2">
                  {job.status !== "CLOSED" && (
                    <Button onClick={handleEndJob}>
                      <X className="h-4 w-4" />{job.status === "OPEN" ? "Cancel Job" : "End Job"}
                    </Button>
                  )}
                    {job.status === "OPEN" && (
                      <Button variant="destructive" onClick={handleDeleteJob}>
                        <Trash className="h-4 w-4 mr-2" /> Delete Job
                      </Button>
                    )}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </div>

              <Separator />

              {/* Services Needed */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Services Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 py-1 px-3 text-sm"
                    >
                      <Tag size={12} className="mr-2" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="font-medium">
                      {job.area}, {job.city}, {job.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Budget Range
                    </div>
                    <div className="font-medium">
                      ${Number(job.priceRangeLow).toFixed(2)} - $
                      {Number(job.priceRangeHigh).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Start Date</div>
                    <div className="font-medium">
                      {format(new Date(job.startDate), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-red-500 mr-3 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">End Date</div>
                    <div className="font-medium">
                      {format(new Date(job.endDate), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Caregiver Card */}
          {job.status === "ONGOING" && job.selectedCaregiver && (
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <CardTitle>Selected Caregiver</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {job.selectedCaregiver.image ? (
                      <Image
                        src={job.selectedCaregiver.image}
                        alt={job.selectedCaregiver.name || "Caregiver"}
                        fill
                        sizes="48px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User size={24} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-lg">
                      {job.selectedCaregiver.name}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {job.selectedCaregiver.email}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button
                    onClick={() =>
                      visitCaregiverProfile(job.selectedCaregiver!.id)
                    }
                    variant="outline"
                    size="sm"
                  >
                    <User className="h-4 w-4 mr-2" /> Visit Profile
                  </Button>
                  <Button onClick={() => setContactDialogOpen(true)} size="sm">
                    <Mail className="h-4 w-4 mr-2" /> Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Card */}
          {job.status === "OPEN" && job.applications.length > 0 && (
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <CardTitle>Applications ({job.applications.length})</CardTitle>
                <CardDescription>
                  Caregivers who have applied for this job
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {job.applications.map(
                    (application: Application) =>
                      application.status === "PENDING" && (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="relative h-10 w-10 overflow-hidden rounded-full mr-3">
                                {application.caregiver.image ? (
                                  <Image
                                    src={application.caregiver.image}
                                    alt={
                                      application.caregiver.name || "Caregiver"
                                    }
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                    priority
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {application.caregiver.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {application.caregiver.city},{" "}
                                  {application.caregiver.area}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              ${application.requestedAmount}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-1">
                              Proposal
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {application.proposal}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                visitCaregiverProfile(application.caregiver.id)
                              }
                            >
                              <User className="h-4 w-4 mr-1" /> Visit Profile
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSelectCaregiver(application.caregiver.id)
                              }
                            >
                              <Check className="h-4 w-4 mr-1" /> Select
                            </Button>
                          </div>
                        </div>
                      )
                  )}
                  {job.applications.length > 0 &&
                    job.applications.every(
                      (app) => app.status !== "PENDING"
                    ) && (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        All applications have been processed.
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "OPEN" && job.applications.length === 0 && (
            <Card className="shadow-sm overflow-hidden">
              <CardContent className="py-12 text-center text-gray-500">
                No caregivers have applied yet.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Status Card */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Job Status & Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Current Status</h3>
                <Badge className={`${getStatusColor(job.status)}`}>
                  {job.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">
                  Applications Received
                </h3>
                <p>
                  {job.applications.length}{" "}
                  {job.applications.length === 1 ? "caregiver" : "caregivers"}{" "}
                  have applied
                </p>
              </div>

              {job.status === "ONGOING" && job.selectedCaregiver && (
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    Caregiver Working on Job
                  </h3>
                  <p className="flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-1" />
                    {job.selectedCaregiver.name}
                  </p>
                </div>
              )}

              <Separator />

              <div className="pt-2">
                {job.status === "OPEN" && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Review applications and select a caregiver to begin the
                      job.
                    </AlertDescription>
                  </Alert>
                )}
                {job.status === "ONGOING" && job.selectedCaregiver && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Contact the selected caregiver to coordinate. Click
                      &quot;End Job&quot; when complete.
                    </AlertDescription>
                  </Alert>
                )}
                {job.status === "ONGOING" && !job.selectedCaregiver && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      The job is ongoing, but the selected caregiver information
                      is missing. Please check with support if this persists.
                    </AlertDescription>
                  </Alert>
                )}
                {job.status === "CLOSED" && (
                  <Alert>
                    <AlertDescription>
                      This job has been completed or cancelled.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Dialog */}
      {job.status === "ONGOING" && job.selectedCaregiver && (
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Contact Information</DialogTitle>
              <DialogDescription>
                Here&apos;s how to get in touch with{" "}
                {job.selectedCaregiver.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium mb-2">Email Address:</p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {job.selectedCaregiver.email}
              </p>
            </div>
            <div className="">
              <p className="font-medium mb-2">Phone:</p>
              <p className="flex items-center">
                <PhoneCall className="h-4 w-4 mr-2" />
                {job.selectedCaregiver.phone}
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "select"
                ? "Select Caregiver"
                : confirmAction === "end"
                ? "End Job"
                : "Delete Job"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "select"
                ? "Are you sure you want to select this caregiver? This will change the job status to 'Ongoing'."
                : confirmAction === "end"
                ? job.status === "OPEN"
                  ? "Are you sure you want to cancel this job?"
                  : "Are you sure you want to end this job?"
                : "Are you sure you want to delete this job? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "delete" ? "destructive" : "default"}
              onClick={handleConfirmAction}
            >
              {confirmAction === "select"
                ? "Select Caregiver"
                : confirmAction === "end"
                ? job.status === "OPEN"
                  ? "Yes, Cancel Job"
                  : "Yes, End Job"
                : "Yes, Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {job.status === "ONGOING" && job.selectedCaregiver && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          caregiverName={job.selectedCaregiver.name || ""}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
