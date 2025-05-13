"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Star,
  MapPin,
  BadgeCheck,
  BadgeX,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import JobCalendar from "./_components/job-calendar";

// Define types
type Caregiver = {
  id: string;
  name: string;
  image: string | null;
  bio: string;
  hourlyRate: number;
  totalEarnings: number;
  country: string | null;
  city: string | null;
  area: string | null;
  verified: boolean;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  image: string | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: User;
};

type JobPost = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  user: User;
};

type CompletedJob = {
  id: string;
  requestedAmount: number;
  createdAt: string;
  status: string;
  jobPost: JobPost;
};

type Job = {
  id: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  petName: string;
  petType: string;
  description: string;
  amount: number;
  status: string;
  color?: string;
};

type ProfileData = {
  caregiver: Caregiver;
  reviews: Review[];
  averageRating: number;
  completedJobs: CompletedJob[];
};

export default function CaregiverSchedulePage() {
  const params = useParams();
  const caregiverId = params.id as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `/api/caregivers/caregivers/${caregiverId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch caregiver profile");
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError("Error loading caregiver profile");
        console.error(err);
      }
    };

    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `/api/caregivers/caregivers/${caregiverId}/schedule`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch caregiver schedule");
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Error loading schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    fetchSchedule();
  }, [caregiverId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (error && !loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          Error loading profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || "Failed to load caregiver profile"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section - Glass Card Design */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden bg-gradient-to-r from-yellow-100 to-teal-100 rounded-lg shadow-lg">
          <div className="absolute top-0 right-0 w-full h-full pet-pattern opacity-50 z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {loading ? (
              <>
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-5 w-64" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                    {profileData?.caregiver.image ? (
                      <Image
                        src={profileData.caregiver.image}
                        alt={profileData.caregiver.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-50">
                        <Avatar className="h-32 w-32">
                          <AvatarFallback>
                            {profileData?.caregiver.name
                              .substring(0, 2)
                              .toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left flex-grow">
                  <div className="flex items-center justify-center md:justify-start">
                    <h1 className="text-3xl font-bold text-green-800">
                      {profileData?.caregiver.name}
                    </h1>
                    {profileData?.caregiver.verified ? (
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

                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>
                      {profileData?.caregiver.area &&
                        `${profileData.caregiver.area}, `}
                      {profileData?.caregiver.city
                        ? profileData.caregiver.city + ", "
                        : ""}
                      {profileData?.caregiver.country ||
                        "Location not specified"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-2 bg-white/30 rounded-lg">
                      <div className="text-sm text-gray-600">Hourly Rate</div>
                      <div className="font-bold text-green-700">
                        {formatCurrency(profileData?.caregiver.hourlyRate || 0)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/30 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Total Earnings
                      </div>
                      <div className="font-bold text-green-700">
                        {formatCurrency(
                          profileData?.caregiver.totalEarnings || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/30 rounded-lg">
                      <div className="text-sm text-gray-600">Rating</div>
                      <div className="font-bold text-amber-600 flex items-center justify-center">
                        {profileData?.averageRating.toFixed(1) || "0.0"}
                        <Star
                          size={16}
                          className="ml-1 text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-xs ml-1">
                          ({profileData?.reviews.length || 0})
                        </span>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/30 rounded-lg">
                      <div className="text-sm text-gray-600">Jobs Done</div>
                      <div className="font-bold text-blue-700">
                        {profileData?.completedJobs.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="relative bg-white/80 rounded-lg  flex">

            <div
              className="absolute h-10 bg-blue-500 rounded-md transition-all duration-300 ease-in-out shadow-md"
              style={{
                width: `${100 / 3}%`,
                left:
                  activeTab === "schedule"
                    ? "0%"
                    : activeTab === "reviews"
                    ? "33.333%"
                    : "66.666%",
              }}
            ></div>

            {/* Tab Buttons */}
            <button
              onClick={() => handleTabChange("schedule")}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-200 
                ${
                  activeTab === "schedule"
                    ? "text-white font-medium"
                    : "text-gray-700 hover:text-blue-600"
                }`}
            >
              <Calendar size={16} />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => handleTabChange("reviews")}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-200 
                ${
                  activeTab === "reviews"
                    ? "text-white font-medium"
                    : "text-gray-700 hover:text-blue-600"
                }`}
            >
              <Star size={16} />
              <span>Reviews ({profileData?.reviews.length || 0})</span>
            </button>

            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-200 
                ${
                  activeTab === "history"
                    ? "text-white font-medium"
                    : "text-gray-700 hover:text-blue-600"
                }`}
            >
              <Briefcase size={16} />
              <span>
                Work History ({profileData?.completedJobs.length || 0})
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "schedule" && (
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Schedule Calendar
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  {jobs.length === 0 ? (
                    <p className="text-center py-16 text-gray-500">
                      No scheduled jobs
                    </p>
                  ) : (
                    <JobCalendar jobs={jobs} />
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  Reviews
                </h2>
                {profileData?.reviews.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No reviews yet
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {profileData?.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage
                              src={
                                review.user.image ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={review.user.name}
                            />
                            <AvatarFallback>
                              {review.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">
                                {review.user.name}
                              </h4>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex mt-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  Work History
                </h2>
                {profileData?.completedJobs.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No work history yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {profileData?.completedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {job.jobPost.title}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Avatar className="h-5 w-5 mr-2">
                                <AvatarImage
                                  src={
                                    job.jobPost.user.image ||
                                    "/placeholder.svg?height=20&width=20"
                                  }
                                  alt={job.jobPost.user.name}
                                />
                                <AvatarFallback>
                                  {job.jobPost.user.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>Client: {job.jobPost.user.name}</span>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 md:text-right">
                            <div className="text-green-600 font-medium">
                              {formatCurrency(job.requestedAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(
                                job.jobPost.startDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                job.jobPost.endDate
                              ).toLocaleDateString()}
                            </div>
                            <Badge
                              variant="outline"
                              className="mt-1 bg-green-50 text-green-700 text-xs"
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
