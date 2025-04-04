"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, Edit, Settings } from "lucide-react";
import ProfileUpdateDialog from "../../_userComponents/ProfileUpdateDialog";
import PreferencesUpdateDialog from "../../_userComponents/PreferencesUpdateDialog";
import ImageUploadDialog from "../../_userComponents/ImageUploadDialog";
import type { User } from "@/types";

// Client component to fetch user data from API
export default function UserProfile() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("userToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Fetch user data from the API
        const response = await fetch(`/api/users/userdata?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || "An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [id]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-red-600">
          Error loading profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (!user) {
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
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      case 5:
        return "Professional";
      default:
        return "Intermediate";
    }
  };

  return (
    <>
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        {/* Profile header with image */}
        <div className="relative bg-blue-600 h-32 sm:h-48">
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {user.image ? (
                  <img
                    src={user.image || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Camera size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setImageDialogOpen(true)}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                aria-label="Update profile picture"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 sm:right-8 flex space-x-2">
            <Button
              onClick={() => setProfileDialogOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
            <Button
              onClick={() => setPreferencesDialogOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100"
            >
              <Settings size={16} className="mr-2" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Profile info */}
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>

          {/* Location info */}
          {(user.country || user.city || user.area) && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {user.country && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="mt-1">{user.country}</p>
                  </div>
                )}
                {user.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="mt-1">{user.city}</p>
                  </div>
                )}
                {user.area && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Area</p>
                    <p className="mt-1">{user.area}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal info */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.age && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="mt-1">{user.age} years</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member Since
                </p>
                <p className="mt-1">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pet care preferences */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Pet Care Preferences
            </h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Daily Availability
                </p>
                <p className="mt-1">{user.dailyAvailability} hours</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Experience Level
                </p>
                <p className="mt-1">
                  {getExperienceLevel(user.experienceLevel)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Has Outdoor Space
                </p>
                <p className="mt-1">{user.hasOutdoorSpace ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Has Children
                </p>
                <p className="mt-1">{user.hasChildren ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Has Allergies
                </p>
                <p className="mt-1">{user.hasAllergies ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
          {/* Pet Information */}
          {user.petOrders && user.petOrders.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Pet Information
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.petOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() =>
                      (window.location.href = `/petshop/${order.pet.id}`)
                    }
                    className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <div className="aspect-square rounded-md overflow-hidden mb-3">
                      {order.pet.images ? (
                        <img
                          src={order.pet.images}
                          alt={order.pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Camera size={40} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {order.pet.name}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>Breed: {order.pet.breed}</p>
                      <p>
                        Age: {order.pet.age}{" "}
                        {order.pet.age === 1 ? "year" : "years"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ProfileUpdateDialog
        isOpen={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        user={user}
        onUpdate={handleUserUpdate}
      />

      <PreferencesUpdateDialog
        isOpen={preferencesDialogOpen}
        onClose={() => setPreferencesDialogOpen(false)}
        user={user}
        onUpdate={handleUserUpdate}
      />

      <ImageUploadDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        user={user}
        onUpdate={handleUserUpdate}
      />
    </>
  );
}
