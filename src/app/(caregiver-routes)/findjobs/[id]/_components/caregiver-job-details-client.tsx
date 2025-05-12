"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  image: string | null;
}

interface Caregiver {
  id: string;
  name: string;
  image: string | null;
}

interface Application {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  proposal: string;
  requestedAmount: number;
  caregiver: Caregiver;
}

interface JobPost {
  id: string;
  title: string;
  description: string;
  city: string;
  area: string;
  startDate: string;
  endDate: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  status: "OPEN" | "ONGOING" | "CLOSED";
  tags: string[];
  createdAt: string;
  user: User;
  applications?: Application[];
  selectedCaregiver?: Caregiver | null;
}

interface CaregiverJobDetailsClientProps {
  jobId: string;
}

export default function CaregiverJobDetailsClient({
  jobId,
}: CaregiverJobDetailsClientProps) {
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState<boolean>(false);
  const [proposal, setProposal] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState<string>("0");
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<
    "PENDING" | "ACCEPTED" | "REJECTED" | ""
  >("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();

  // Define fetchJobDetails outside useEffect
  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("caregiverToken");
      const caregiverId = localStorage.getItem("caregiverId");

      if (!token) {
        toast.error("Authentication Error", {
          description: "Please log in to view job details",
        });
        router.push("/caregiverlogin");
        return;
      }

      const response = await fetch(`/api/caregivers/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedJob: JobPost = data.jobPost;
        setJob(fetchedJob);

        if (caregiverId && fetchedJob.applications) {
          const application = fetchedJob.applications.find(
            (app) => app.caregiver.id === caregiverId
          );

          if (application) {
            setHasApplied(true);
            setApplicationStatus(application.status);
            setRequestedAmount(application.requestedAmount.toString());
            setProposal(application.proposal);
          } else {
            setHasApplied(false);
            setApplicationStatus("");
            if (fetchedJob) {
              const minPrice = fetchedJob.priceRangeLow;
              const maxPrice = fetchedJob.priceRangeHigh;
              const defaultAmount = ((minPrice + maxPrice) / 2).toFixed(2);
              setRequestedAmount(defaultAmount);
            } else {
              setRequestedAmount("0");
            }
            setProposal("");
          }
        } else {
          setHasApplied(false);
          setApplicationStatus("");
          if (fetchedJob) {
            const minPrice = fetchedJob.priceRangeLow;
            const maxPrice = fetchedJob.priceRangeHigh;
            const defaultAmount = ((minPrice + maxPrice) / 2).toFixed(2);
            setRequestedAmount(defaultAmount);
          } else {
            setRequestedAmount("0");
          }
          setProposal("");
        }
      } else {
        const errorData = await response.json();
        toast.error("Error", {
          description: errorData.error || "Failed to load job details",
        });

        if (response.status === 401) {
          router.push("/caregiverlogin");
        }
        if (response.status === 404) {
          setJob(null);
        } else {
          setJob(null);
        }
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Error", {
        description: "Failed to load job details. Please try again.",
      });
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  // Call fetchJobDetails inside useEffect
  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleApply = async () => {
    if (!proposal.trim() || !requestedAmount.trim()) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    const amount = Number.parseFloat(requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount",
      });
      return;
    }

    if (job && (amount < job.priceRangeLow || amount > job.priceRangeHigh)) {
      toast.error("Amount out of range", {
        description: `Please enter an amount between $${job.priceRangeLow} and $${job.priceRangeHigh}`,
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("caregiverToken");

      if (!token) {
        toast.error("Authentication Error", {
          description: "Please log in to apply",
        });
        router.push("/caregiverlogin");
        return;
      }

      const response = await fetch("/api/caregivers/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobPostId: jobId,
          proposal,
          requestedAmount: amount,
        }),
      });

      if (response.ok) {
        toast.success("Application submitted", {
          description: "Your application has been sent to the job poster",
        });

        setApplyDialogOpen(false);
        setHasApplied(true);
        setApplicationStatus("PENDING");

        // Re-fetch job details to update the UI with the applied status
        fetchJobDetails();
      } else {
        const error = await response.json();
        if (response.status === 409) {
          toast.warning("Already Applied", {
            description: "You have already applied for this job.",
          });
          setApplyDialogOpen(false);
          setHasApplied(true);
          setApplicationStatus("PENDING");
          fetchJobDetails();
        } else if (response.status === 401) {
          toast.error("Authentication Error", {
            description: "Please log in to apply",
          });
          router.push("/caregiverlogin");
        } else {
          throw new Error(error.error || "Failed to submit application");
        }
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      if (
        !["Already Applied", "Authentication Error"].some((msg) =>
          error.message.includes(msg)
        )
      ) {
        toast.error("Error", {
          description: error.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getStatusColor = (status: string): string => {
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

  const getApplicationStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <AlertTitle className="text-lg font-semibold">Job Not Found</AlertTitle>
          <AlertDescription>
            The job you&apos;re looking for might have been removed or doesn&apos;t exist.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/findjobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-3">
            <Link href="/caregiver/findjob">
              <ArrowLeft size={16} className="mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <Badge className={`${getStatusColor(job.status)} mr-3`}>{job.status}</Badge>
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
                <span className="text-sm font-normal text-gray-500">
                  Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Job poster */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  {job.user.image ? (
                    <Image
                      src={job.user.image}
                      alt={job.user.name || "User"}
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
                  <div className="font-medium text-lg">{job.user.name}</div>
                  <div className="text-sm text-gray-600">Job Poster</div>
                </div>
              </div>

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
                      {job.city}, {job.area}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Budget Range</div>
                    <div className="font-medium">
                      ${Number(job.priceRangeLow).toFixed(2)} - ${Number(job.priceRangeHigh).toFixed(2)}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status Card */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {hasApplied ? (
                <div className="space-y-4">
                  <Alert>
                    <div className="flex flex-col space-y-3">
                      {applicationStatus && (
                        <Badge className={`${getApplicationStatusColor(applicationStatus)} w-fit`}>
                          {applicationStatus}
                        </Badge>
                      )}
                      <div className="space-y-1">
                        <AlertTitle className="text-lg font-semibold">
                          You have applied to this job
                        </AlertTitle>
                        <AlertDescription className="text-base">
                          Your requested amount:{" "}
                          <span className="font-semibold">${requestedAmount}</span>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Your Proposal</h4>
                    <p className="text-gray-700 whitespace-pre-line text-sm">
                      {proposal}
                    </p>
                  </div>
                </div>
              ) : job.status === "OPEN" ? (
                <div className="text-center">
                  <p className="mb-6 text-gray-600">
                    Interested in this job? Submit your proposal and requested payment.
                  </p>
                  <Button
                    onClick={() => setApplyDialogOpen(true)}
                    className="w-full py-6"
                    size="lg"
                  >
                    Apply for this Job
                  </Button>
                </div>
              ) : (
                <Alert variant="destructive" className="bg-red-50">
                  <AlertTitle className="font-semibold">
                    This job is no longer accepting applications
                  </AlertTitle>
                  <AlertDescription>
                    The job poster has already selected a caregiver or closed this job.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Selected Caregiver Card */}
          {job.selectedCaregiver && (
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">Selected Caregiver</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {job.selectedCaregiver.image ? (
                      <Image
                        src={job.selectedCaregiver.image}
                        alt={job.selectedCaregiver.name || "Caregiver"}
                        fill
                        sizes="48px"
                        className="object-cover"
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
                    {job.selectedCaregiver.id ===
                      localStorage.getItem("caregiverId") && (
                      <Badge className="bg-green-100 text-green-800 mt-1">You</Badge>
                    )}
                  </div>
                </div>
                {job.selectedCaregiver.id === localStorage.getItem("caregiverId") && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-800 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Your accepted amount: ${requestedAmount}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply for Job: {job.title}</DialogTitle>
            <DialogDescription>
              Submit your proposal and requested payment amount.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="proposal" className="text-base">
                Your Proposal
              </Label>
              <Textarea
                id="proposal"
                placeholder="Explain why you're a good fit for this job..."
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                className="min-h-[150px]"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base">
                Requested Amount ($)
              </Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="pl-8"
                  min={job.priceRangeLow}
                  max={job.priceRangeHigh}
                  step="0.01"
                  disabled={submitting}
                />
              </div>
              <p className="text-sm text-gray-500">
                Budget range: ${Number(job.priceRangeLow).toFixed(2)} - ${Number(job.priceRangeHigh).toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setApplyDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={submitting} className="px-6">
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}