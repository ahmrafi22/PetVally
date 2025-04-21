"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowBigUp, MessageSquare, Users, Plus, User } from "lucide-react";

type DonationPost = {
  id: string;
  title: string;
  description: string;
  images: string;
  country: string;
  city: string;
  area: string;
  isAvailable: boolean;
  upvotesCount: number;
  species: string;
  breed: string;
  gender: string;
  age: number;
  vaccinated: boolean;
  neutered: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    comments: number;
    adoptionForms: number;
  };
  createdAt: string;
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}hr`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  
  return `${Math.floor(diffInMonths / 12)}yr`;
};

export default function DonationPage() {
  const [localPosts, setLocalPosts] = useState<DonationPost[]>([]);
  const [allPosts, setAllPosts] = useState<DonationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    city: string | null;
    area: string | null;
  }>({
    city: null,
    area: null,
  });
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [myPostsOpen, setMyPostsOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [userLocation]);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      const token = localStorage.getItem("userToken");
      const response = await fetch(`/api/users/userdata?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      const city =
        data.user.city && data.user.city.trim() !== "" ? data.user.city.trim() : null;
      const area =
        data.user.area && data.user.area.trim() !== "" ? data.user.area.trim() : null;

      setUserLocation({
        city: city,
        area: area,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserLocation({ city: null, area: null });
      fetchPosts();
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        return;
      }

      const response = await fetch("/api/users/donation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donation posts");
      }

      const data = await response.json();
      setAllPosts(data.posts);

      if (userLocation.city && userLocation.area) {
        const trimmedCity = userLocation.city.trim();
        const trimmedArea = userLocation.area.trim();
        const localResponse = await fetch(
          `/api/users/donation?city=${encodeURIComponent(
            trimmedCity
          )}&area=${encodeURIComponent(trimmedArea)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (localResponse.ok) {
          const localData = await localResponse.json();
          setLocalPosts(localData.posts);
        } else {
          console.error("Failed to fetch local posts");
          setLocalPosts([]);
        }
      } else {
        setLocalPosts([]);
      }
    } catch (error: any) {
      console.error("Error fetching donation posts:", error);
      setError(
        error.message || "An error occurred while fetching donation posts"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePostSuccess = () => {
    setCreatePostOpen(false);
    fetchPosts();
    toast.success("Post created successfully!");
  };

  const StatBadge = ({ value, icon, color }: { value: number; icon: React.ReactNode; color: string }) => (
    <div className={`flex items-center rounded-full px-2.5 py-1 ${color} text-white text-xs font-medium group-hover:scale-105 transition-all duration-300`}>
      {icon}
      <span className="ml-1">{value}</span>
    </div>
  );

  const renderPostCard = (post: DonationPost) => {
    return (
      <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 group hover:shadow-lg transition-all duration-300 hover:border-blue-100">
        <a href={`/donation/${post.id}`} className="block">
          <div className="flex flex-col lg:flex-row relative">
            <div className="w-full lg:w-2/5 h-64 sm:h-72 lg:h-64 xl:h-72 relative overflow-hidden">
              <img
                src={post.images || "/placeholder.svg?height=300&width=300"}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {!post.isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-semibold text-lg">Adopted</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {post.title}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {post.isAvailable ? "Available" : "Adopted"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm">
                <span>{post.species}</span>
                <span>•</span>
                <span>{post.breed}</span>
                <span>•</span>
                <span>{post.age} {post.age === 1 ? "year" : "years"} old</span>
              </div>

              <div className="mt-2 text-gray-600 text-sm">
                <span>
                  {capitalizeFirstLetter(post.area)} • {capitalizeFirstLetter(post.city)} • {capitalizeFirstLetter(post.country)}
                </span>
              </div>

              <p className="mt-4 text-gray-600 line-clamp-2 flex-grow">
                {post.description}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-50">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden mr-2 flex items-center justify-center">
                    {post.user.image ? (
                      <img
                        src={post.user.image}
                        alt={post.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {post.user.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    • {getRelativeTime(post.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <StatBadge
                    value={post.upvotesCount}
                    icon={<ArrowBigUp className="h-3 w-3" />}
                    color="bg-blue-500"
                  />
                  <StatBadge
                    value={post._count.comments}
                    icon={<MessageSquare className="h-3 w-3" />}
                    color="bg-green-500"
                  />
                  <StatBadge
                    value={post._count.adoptionForms}
                    icon={<Users className="h-3 w-3" />}
                    color="bg-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  };

  const renderSkeletonCard = (index: number) => (
    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/5 h-64 sm:h-72 lg:h-64 xl:h-72 bg-gray-200" />
        <div className="flex-1 p-6">
          <div className="flex justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-3" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
          <div className="h-4 bg-gray-200 rounded w-full mt-4" />
          <div className="h-4 bg-gray-200 rounded w-full mt-2" />
          
          <div className="mt-6 pt-4 border-t border-gray-50">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 mr-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-12 ml-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pet Donation</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMyPostsOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            My Posts
          </button>
          <button
            onClick={() => setCreatePostOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => renderSkeletonCard(i))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {localPosts.length > 0 && userLocation.city && userLocation.area && (
            <section>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-3">
                Pets in Your Area: {userLocation.area}, {userLocation.city}
              </h2>
              <div className="space-y-6">
                {localPosts.map(renderPostCard)}
              </div>
            </section>
          )}

          {!userLocation.city && !userLocation.area && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-5 rounded-lg mb-6">
              <p className="font-medium">
                Please update your city and area in your profile
              </p>
              <p className="text-sm mt-2">
                This will help us show you pets available in your area.
                <a
                  href={`/profile/${localStorage.getItem("userId")}`}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  Update profile
                </a>
              </p>
            </div>
          )}

          <section>
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-3">
              All Available Pets
            </h2>
            {allPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                No donation posts available.
              </div>
            ) : (
              <div className="space-y-6">
                {allPosts.map(renderPostCard)}
              </div>
            )}
          </section>
        </div>
      )}

      {createPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Post</h2>
            <p className="text-gray-600">This is a placeholder for the create post dialog.</p>
            <div className="flex justify-end mt-4 gap-2">
              <button 
                onClick={() => setCreatePostOpen(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleCreatePostSuccess();
                  setCreatePostOpen(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {myPostsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">My Posts</h2>
            <p className="text-gray-600">This is a placeholder for the my posts dialog.</p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => {
                  fetchPosts();
                  setMyPostsOpen(false);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}