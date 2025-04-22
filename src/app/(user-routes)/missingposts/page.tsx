"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowBigUp, MapPin, MessageSquare, Plus, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateMissingPostDialog } from "./_components/create-missing-post-dialog";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store"; 
import Image from "next/image";

type MissingPost = {
  id: string;
  title: string;
  description: string;
  images: string;
  country: string;
  city: string;
  area: string;
  species: string;
  breed: string;
  age: number;
  status: string;
  upvotesCount: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    comments: number;
    upvotes: number;
  };
  createdAt: string;
};

export default function MissingPetsPage() {
  const [localPosts, setLocalPosts] = useState<MissingPost[]>([]);
  const [allPosts, setAllPosts] = useState<MissingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const router = useRouter();
  
  // Get user data from the store
  const { userData, fetchUserData, isLoading: userLoading } = useUserStore();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");
    
    if (!userId || !token) {
      router.push("/userlogin");
      return;
    }
    
    // Fetch user data
    fetchUserData();
  }, [fetchUserData, router]);

  // Fetch posts when user data is available
  useEffect(() => {
    if (!userLoading) {
      fetchPosts();
    }
  }, [userData, userLoading]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch("/api/users/missingposts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch missing pet posts");
      }

      const data = await response.json();
      setAllPosts(data.posts);

      // Only fetch local posts if user has city and area
      if (userData.city && userData.area) {
        const localResponse = await fetch(
          `/api/users/missingposts?city=${encodeURIComponent(
            userData.city
          )}&area=${encodeURIComponent(userData.area)}`,
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
      console.error("Error fetching missing pet posts:", error);
      setError(
        error.message || "An error occurred while fetching missing pet posts"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePostSuccess = () => {
    setCreatePostOpen(false);
    fetchPosts();
    toast.success("Missing pet post created successfully!");
  };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Function to format relative time
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

  // Stats indicator component for horizontal row
  const StatBadge = ({ value, icon, color }: { value: number, icon: React.ReactNode, color: string }) => (
    <div className={`flex items-center rounded-full px-2 py-1 ${color} text-white text-xs group-hover:scale-115 transition-all duration-300`}>
      {icon}
      <span className="ml-1">{value}</span>
    </div>
  );

  const renderPostCard = (post: MissingPost) => {
    return (
      <div
        key={post.id}
        className="bg-gray-100 group mx-auto rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg  "
      >
        <Link href={`/missingposts/${post.id}`} className="block">
          <div className="flex flex-col lg:flex-row relative">

            <div className="w-full lg:w-1/3 h-80 md:h-120 transition-all lg:h-auto relative">
              <Image
                src={post.images || "/placeholder.svg?height=300&width=300"}
                alt={post.title}
                fill
                className="object-cover object-[0%_50%] group-hover:scale-105 transition-transform duration-300"
              />
              {post.status === "FOUND" && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Found</span>
                </div>
              )}
            </div>
            
            {/* Content area */}
            <div className="flex-1 p-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <h2 className="text-xl font-semibold text-black">
                  {post.title}
                </h2>
                <Badge

                  className={cn( "w-1/3 h-10 text-xl",
                    post.status === "NOT_FOUND"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800")
                  }
                >
                  {post.status === "NOT_FOUND" ? "Missing" : "Found"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center mt-1 text-gray-600 text-sm">
                <span className="mr-2">{post.species}</span>•
                <span className="mx-2">{post.breed}</span>•
                <span className="ml-2">
                  {post.age} {post.age === 1 ? "year" : "years"} old
                </span>
              </div>

              <div className="mt-1 text-gray-600 text-sm">
                <span className="font-medium"><MapPin className="inline w-4 h-4 mb-1 mr-1" /></span>
                <span className="ml-1">
                {capitalizeFirstLetter(post.area)} - {capitalizeFirstLetter(post.city)} - {capitalizeFirstLetter(post.country)}
                </span>
              </div>

              <p className="mt-2 text-gray-600 line-clamp-2">
                {post.description}
              </p>

              {/* User info and post metrics */}
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden mr-2 ">
                    {post.user.image ? (
                      <Image
                        src={post.user.image || "/placeholder.svg"}
                        alt={post.user.name}
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-full w-full p-1 text-gray-400" />
                    )}
                  </div>
                  
                  <span className="text-sm text-gray-600 font-medium">{post.user.name}</span>
                  <span className="text-xs text-gray-500 ml-2">• {getRelativeTime(post.createdAt)}</span>
                </div>
                
                {/* Stats indicators in a horizontal row */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <StatBadge 
                    value={post.upvotesCount} 
                    icon={<ArrowBigUp className="h-3 w-3" />} 
                    color="bg-blue-500"
                  />
                  <StatBadge 
                    value={post._count.comments} 
                    icon={<MessageSquare className="h-3 w-3" />} 
                    color="bg-amber-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  // Updated skeleton loader to match the new layout
  const renderSkeletonCard = (index: number) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
    >
      <div className="flex flex-col lg:flex-row">
        <Skeleton className="w-full lg:w-1/3 h-48 lg:h-64" />
        <div className="flex-1 p-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-1/2 mt-2" />
          <Skeleton className="h-4 w-1/3 mt-2" />
          <Skeleton className="h-16 w-full mt-2" />
          
          <div className="mt-4">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12 ml-2" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Missing Pets</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setCreatePostOpen(true)} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Report Missing Pet
          </Button>
        </div>
      </div>

      {loading || userLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => renderSkeletonCard(i))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Local posts section */}
          {localPosts.length > 0 && userData.city && userData.area && (
            <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-3">
              Pets Missing in Your Area: {userData.area}, {userData.city}
            </h2>
              <div className="space-y-4">
                {localPosts.map((post) => renderPostCard(post))}
              </div>
            </div>
          )}

          {/* Missing location warning */}
          {!userData.city || !userData.area ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-4">
              <p className="font-medium">
                Please update your city and area in your profile
              </p>
              <p className="text-sm mt-1">
                This will help us show you missing pets in your area.
                <Link
                  href={`/profile/${localStorage.getItem("userId")}`}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  Update profile
                </Link>
              </p>
            </div>
          ) : null}

          {/* All posts section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-3">
              All Missing Pets
            </h2>
            {allPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                No missing pet reports available.
              </div>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => renderPostCard(post))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Post Dialog */}
      <CreateMissingPostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSuccess={handleCreatePostSuccess}
      />
    </div>
  );
}