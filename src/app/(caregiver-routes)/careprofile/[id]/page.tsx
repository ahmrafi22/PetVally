"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Camera,
  Edit,
  MessageSquare,
  Star,
  Clock,
  MapPin,
  BadgeCheck,
  BadgeX,
  DollarSign,
  Briefcase,
  Award,
  Heart,
  AtSign,
  PhoneCall,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CaregiverProfileDialog from "../../_components/CaregiverProfileDialog";
import CaregiverImageDialog from "../../_components/CaregiverImageDialog";
import type { Caregiver } from "@/types";
import { useCaregiverStore } from "@/stores/caregiver-store";
import { toast } from "sonner";

export default function CaregiverProfile() {
  const params = useParams();
  const id = params.id as string;

  // Use the Zustand store instead of local state
  const {
    caregiverData,
    isLoading,
    error,
    fetchCaregiverData,
    updateCaregiverProfile,
    updateCaregiverImage,
  } = useCaregiverStore();

  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    // Only fetch caregiver data when the component mounts or when id changes
    if (id) {
      fetchCaregiverData();
    }
  }, [id, fetchCaregiverData]);

  const handleCaregiverUpdate = async (
    updatedCaregiver: Partial<Caregiver>
  ) => {
    try {
      await updateCaregiverProfile(updatedCaregiver);
      setProfileDialogOpen(false);
      toast.success("Profile updated successfully", {
        description: "Your profile information has been saved.",
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile", {
        description: err.message || "Please try again later.",
      });
    }
  };

  const handleImageUpdate = async (updatedCaregiver: Caregiver) => {
    if (updatedCaregiver.image) {
      try {
        await updateCaregiverImage(updatedCaregiver.image);
        setImageDialogOpen(false);
        toast.success("Profile image updated successfully", {
          description: "Your new profile picture has been saved.",
        });
      } catch (err: any) {
        toast.error("Failed to update profile image", {
          description: err.message || "Please try again later.",
        });
      }
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          Error loading profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button
          onClick={() => fetchCaregiverData()}
          className="mt-4 bg-red-50 text-red-600 hover:bg-red-100"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!caregiverData || !caregiverData.id) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          Caregiver not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested caregiver profile could not be found.
        </p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section - Glass Card Design */}
          <div className="glass-card p-8 mb-8 relative overflow-hidden bg-gradient-to-r from-yellow-100 to-teal-100 rounded-lg shadow-lg">
            <div className="absolute top-0 right-0 w-full h-full pet-pattern opacity-50 z-0"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                  {caregiverData.image ? (
                    <Image
                      src={caregiverData.image}
                      alt={caregiverData.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                      <Camera size={40} className="text-green-300" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setImageDialogOpen(true)}
                  className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
                  aria-label="Update profile picture"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-3xl font-bold text-green-800">
                    {caregiverData.name}
                  </h1>
                  {caregiverData.verified ? (
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
                <div className="mt-1 space-y-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <AtSign className="h-5 w-5 mr-2 text-gray-500" />
                      <p className="text-gray-600">{caregiverData.email}</p>
                    </div>
                    <div className="flex items-center">
                      <PhoneCall className="h-5 w-5 mr-2 text-gray-500" />
                      <p className="text-gray-600">{caregiverData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {caregiverData.city ? caregiverData.city + ", " : ""}
                      {caregiverData.country || "Location not specified"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Pet Caregiver
                  </span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    {formatCurrency(caregiverData.hourlyRate)}/hr
                  </span>
                </div>
              </div>

              <div className="ml-auto flex flex-col items-end gap-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setProfileDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50 text-green-700 border-green-200 shadow-sm transition-all duration-200"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </div>
                <div className="glass-card p-4 text-center hidden md:block bg-white/70 rounded-lg">
                  <div className="text-sm text-gray-500">Member since</div>
                  <div className="font-medium">
                    {new Date(caregiverData.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
              {/* Quick stats */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-500" />
                  Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Hourly Rate */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm font-medium">
                      Hourly Rate
                    </div>
                    <div className="mt-1 text-xl font-bold text-green-800">
                      {formatCurrency(caregiverData.hourlyRate)}
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <div className="text-teal-600 text-sm font-medium">
                      Earnings
                    </div>
                    <div className="mt-1 text-xl font-bold text-teal-800">
                      {formatCurrency(caregiverData.totalEarnings)}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium">
                      Status
                    </div>
                    <div className="mt-1 text-xl font-bold text-blue-800 flex items-center">
                      {caregiverData.verified ? (
                        <>
                          <BadgeCheck className="w-5 h-5 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <BadgeX className="w-5 h-5 mr-1" />
                          Pending
                        </>
                      )}
                    </div>
                  </div>

                  {/* Updated At */}
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="text-amber-600 text-sm font-medium">
                      Updated
                    </div>
                    <div className="mt-1 text-sm font-bold text-amber-800">
                      {new Date(caregiverData.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Account Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Member Since
                    </div>
                    <div className="font-medium">
                      {new Date(caregiverData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Last Updated
                    </div>
                    <div className="font-medium">
                      {new Date(caregiverData.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Verification Status
                    </div>
                    <div className="flex items-center">
                      {caregiverData.verified ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <BadgeCheck className="w-5 h-5" />
                          Verified Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                          <BadgeX className="w-5 h-5" />
                          Verification Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Columns */}
            <div className="md:col-span-2 space-y-8">
              {/* Bio / About Me */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-500" />
                  About Me
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {caregiverData.bio ? (
                    <p className="whitespace-pre-line">{caregiverData.bio}</p>
                  ) : (
                    <p className="italic text-gray-500">No bio provided yet.</p>
                  )}
                </div>
              </div>

              {/* Location info */}
              {(caregiverData.country ||
                caregiverData.city ||
                caregiverData.area) && (
                <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Location
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {caregiverData.country && (
                      <div className="flex flex-col p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-500">
                          Country
                        </p>
                        <p className="mt-1 font-medium text-green-800">
                          {caregiverData.country}
                        </p>
                      </div>
                    )}
                    {caregiverData.city && (
                      <div className="flex flex-col p-3 bg-teal-50 rounded-lg">
                        <p className="text-sm font-medium text-teal-500">
                          City
                        </p>
                        <p className="mt-1 font-medium text-teal-800">
                          {caregiverData.city}
                        </p>
                      </div>
                    )}
                    {caregiverData.area && (
                      <div className="flex flex-col p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-500">
                          Area
                        </p>
                        <p className="mt-1 font-medium text-blue-800">
                          {caregiverData.area}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Information */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Financial Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-green-800">
                        Hourly Rate
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(caregiverData.hourlyRate)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Per hour of pet care
                    </p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      <h3 className="font-medium text-teal-800">
                        Total Earnings
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-teal-700">
                      {formatCurrency(caregiverData.totalEarnings)}
                    </p>
                    <p className="text-sm text-teal-600 mt-1">
                      Career earnings to date
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CaregiverProfileDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        caregiver={caregiverData as Caregiver}
        onUpdate={handleCaregiverUpdate}
      />

      <CaregiverImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        caregiver={caregiverData as Caregiver}
        onUpdate={handleImageUpdate}
      />
    </>
  );
}

// Skeleton component for loading state
function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section Skeleton */}
        <div className="p-8 mb-8 bg-gray-100 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Image Skeleton */}
            <Skeleton className="w-32 h-32 rounded-full" />

            {/* Profile Info Skeleton */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col items-end gap-4">
              <div className="flex space-x-3">
                <Skeleton className="h-9 w-28" />
              </div>
              <Skeleton className="h-16 w-32 rounded-lg hidden md:block" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="md:col-span-1 space-y-8">
            {/* Stats Card Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Account Info Card Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right Columns Skeleton */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Location Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Financial Info Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="flex flex-wrap gap-4">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-10 w-32" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
