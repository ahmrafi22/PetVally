"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Camera,
  Edit,
  Settings,
  ShoppingBag,
  MessageSquare,
  Star,
  Clock,
  PawPrint,
  MapPin,
  Heart,
  Award,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileUpdateDialog from "../../_components/ProfileUpdateDialog";
import PreferencesUpdateDialog from "../../_components/PreferencesUpdateDialog";
import ImageUploadDialog from "../../_components/image-upload-dialog";
import type { User, UserPreferences } from "@/types";
import ExploreButton from "../_components/button";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";

export default function UserProfile() {
  const params = useParams();
  const id = params.id as string;

  // Use the Zustand store instead of local state
  const {
    userData,
    isLoading,
    error,
    fetchUserData,
    updateUserProfile,
    updateUserPreferences,
    updateUserImage,
  } = useUserStore();

  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    // Only fetch user data when the component mounts or when id changes
    if (id) {
      fetchUserData();
    }
  }, [id, fetchUserData]);

  // Removed duplicate handleUserUpdate function

  const handleImageUpdate = (updatedUser: User) => {
    if (updatedUser.image) {
      // Update the local state directly
      useUserStore.setState((state) => ({
        userData: {
          ...state.userData,
          image: updatedUser.image ?? null,
        },
      }));

      toast.success("Profile image updated successfully", {
        description: "Your new profile picture has been saved.",
        duration: 3000,
      });
    }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      await updateUserProfile(updatedUser);
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

  const handlePreferencesUpdate = async (preferences: UserPreferences) => {
    try {
      await updateUserPreferences(preferences);
      setPreferencesDialogOpen(false);
      toast.success("Preferences updated successfully", {
        description: "Your preferences have been saved.",
      });
    } catch (err: any) {
      console.error("Error updating preferences:", err);
      toast.error("Failed to update preferences", {
        description: err.message || "Please try again later.",
      });
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
          onClick={() => fetchUserData()}
          className="mt-4 bg-red-50 text-red-600 hover:bg-red-100"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!userData || !userData.id) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          User not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested user profile could not be found.
        </p>
      </div>
    );
  }

  // Helper function to get experience level text
  const getExperienceLevel = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Novice";
      case 3:
        return "Intermediate";
      case 4:
        return "Advanced";
      case 5:
        return "Expert";
      default:
        return "Intermediate";
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section - Glass Card Design */}
          <div className="glass-card p-8 mb-8 relative overflow-hidden bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-lg">
            <div className="absolute top-0 right-0 w-full h-full pet-pattern opacity-50 z-0"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                  {userData.image ? (
                    <Image
                      src={userData.image}
                      alt={userData.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50">
                      <Camera size={40} className="text-purple-300" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setImageDialogOpen(true)}
                  className="absolute -bottom-2 -right-2 bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors"
                  aria-label="Update profile picture"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-purple-800">
                  {userData.name}
                </h1>
                <p className="text-gray-600">{userData.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>
                    {userData.city ? userData.city + ", " : ""}
                    {userData.country || "Location not specified"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Pet Owner
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                    {getExperienceLevel(userData.experienceLevel)} Pet Parent
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {userData.petOrders?.length || 0} Pets Adopted
                  </span>
                </div>
              </div>

              <div className="ml-auto flex flex-col items-end gap-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setProfileDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50 text-purple-700 border-purple-200 shadow-sm transition-all duration-200"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => setPreferencesDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50 text-purple-700 border-purple-200 shadow-sm transition-all duration-200"
                  >
                    <Settings size={16} className="mr-2" />
                    Preferences
                  </Button>
                </div>
                <div className="glass-card p-4 text-center hidden md:block bg-white/70 rounded-lg">
                  <div className="text-sm text-gray-500">Member since</div>
                  <div className="font-medium">
                    {new Date(userData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
              {/* Quick stat cards */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-pink-500" />
                  Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Experience Level */}
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-sm font-medium">
                      Experience
                    </div>
                    <div className="mt-1 text-xl font-bold text-purple-800">
                      {getExperienceLevel(userData.experienceLevel)}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-pink-600 text-sm font-medium">
                      Available
                    </div>
                    <div className="mt-1 text-xl font-bold text-pink-800">
                      {userData.dailyAvailability} hrs
                    </div>
                  </div>

                  {/* Pet Count */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium">
                      Pets
                    </div>
                    <div className="mt-1 text-xl font-bold text-blue-800">
                      {userData.petOrders?.length || 0}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="text-amber-600 text-sm font-medium">
                      Age
                    </div>
                    <div className="mt-1 text-xl font-bold text-amber-800">
                      {userData.age || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Preferences */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Pet Preferences
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Daily Availability
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Clock
                          key={i}
                          className={`w-5 h-5 ${
                            i <= userData.dailyAvailability
                              ? "text-pink-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Experience Level
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Award
                          key={i}
                          className={`w-5 h-5 ${
                            i <= userData.experienceLevel
                              ? "text-pink-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          userData.hasOutdoorSpace
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm">Has outdoor space</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          userData.hasChildren ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm">Has children</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          userData.hasAllergies ? "bg-red-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="text-sm">Has pet allergies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Columns */}
            <div className="md:col-span-2 space-y-8">
              {/* Location info */}
              {(userData.country || userData.city || userData.area) && (
                <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-pink-500" />
                    Location
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {userData.country && (
                      <div className="flex flex-col p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-500">
                          Country
                        </p>
                        <p className="mt-1 font-medium text-purple-800">
                          {userData.country}
                        </p>
                      </div>
                    )}
                    {userData.city && (
                      <div className="flex flex-col p-3 bg-pink-50 rounded-lg">
                        <p className="text-sm font-medium text-pink-500">
                          City
                        </p>
                        <p className="mt-1 font-medium text-pink-800">
                          {userData.city}
                        </p>
                      </div>
                    )}
                    {userData.area && (
                      <div className="flex flex-col p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-500">
                          Area
                        </p>
                        <p className="mt-1 font-medium text-blue-800">
                          {userData.area}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pet Adoptions */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-pink-500" />
                  Pet Family
                </h2>

                {userData.petOrders && userData.petOrders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userData.petOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() =>
                          (window.location.href = `/petshop/${order.pet?.id}`)
                        }
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200"
                      >
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                          {order.pet?.images ? (
                            <Image
                              src={order.pet.images}
                              alt={order.pet.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PawPrint className="w-8 h-8 text-pink-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-purple-800">
                            {order.pet?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.pet?.breed}
                          </p>
                          <p className="text-xs text-gray-500">
                            Age: {order.pet?.age}{" "}
                            {order.pet?.age === 1 ? "year" : "years"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No pets adopted yet</p>
                )}
              </div>

              {/* All Explore Buttons in One Row */}
              <div className="glass-card p-6 bg-white/80 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-pink-500" />
                  Quick Actions
                </h2>
                <div className="flex flex-wrap gap-4 justify-between">
                  <ExploreButton text="Go to orders" href="/myorders" />
                  <ExploreButton text="Go to Meetings" href="/mymeetings" />
                  <ExploreButton text="Go to appoitnemts" href="/vetmeetings" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ProfileUpdateDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        user={userData as User}
        onUpdate={handleUserUpdate}
      />

      <PreferencesUpdateDialog
        isOpen={preferencesDialogOpen}
        onClose={() => setPreferencesDialogOpen(false)}
        user={userData as User}
        onUpdate={handlePreferencesUpdate}
      />

      <ImageUploadDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        user={userData as User}
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
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col items-end gap-4">
              <div className="flex space-x-3">
                <Skeleton className="h-9 w-28" />
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

            {/* Preferences Card Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-5 w-5 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right Columns Skeleton */}
          <div className="md:col-span-2 space-y-8">
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

            {/* Pet Family Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg"
                  >
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="flex flex-wrap gap-4 justify-between">
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
