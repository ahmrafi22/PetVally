"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowBigUp, MessageSquare, Users, Plus, User, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatePostDialog } from "./_components/create-post-dialog";
import { MyPostsDialog } from "./_components/my-posts-dialog";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store"
import Image from "next/image";

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

export default function DonationPage() {
  const [localPosts, setLocalPosts] = useState<DonationPost[]>([]);
  const [allPosts, setAllPosts] = useState<DonationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [myPostsOpen, setMyPostsOpen] = useState(false);
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
    
    fetchUserData();
  }, [fetchUserData, router]);


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

      // Only fetch local posts if user has city and area
      if (userData.city && userData.area) {
        const localResponse = await fetch(
          `/api/users/donation?city=${encodeURIComponent(
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

  const renderPostCard = (post: DonationPost) => {
    return (
      <div
        key={post.id}
        className="bg-gray-100 group mx-auto rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg  transition-all duration-300"
      >
        <Link href={`/donation/${post.id}`} className="block">
          <div className="flex flex-col lg:flex-row relative">

            <div className="w-full lg:w-1/3 h-80 md:h-120 transition-all lg:h-auto relative">
              <Image
                src={post.images || "/placeholder.svg?height=300&width=300"}
                alt={post.title}
                fill
                className="object-cover object-[0%_50%] group-hover:scale-105 transition-transform duration-300"
              />
              {!post.isAvailable && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Adopted</span>
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
                  className={cn(
                    post.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800")
                  }
                >
                  {post.isAvailable ? "Available" : "Adopted"}
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
                <span>
                  <MapPin className="inline w-4 h-4 mb-1 mr-1" />{capitalizeFirstLetter(post.area)} - {capitalizeFirstLetter(post.city)} - {capitalizeFirstLetter(post.country)}
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
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-full w-full p-1 text-gray-400" />
                    )}
                  </div >
                  
                  <span className="text-sm text-gray-600 font-medium">{post.user.name}</span>
                  <span className="text-xs text-gray-500 ml-2 ">• {getRelativeTime(post.createdAt)}</span>
                </div>
                
                {/* Stats indicators in a horizontal row */}
                <div className="flex flex-wrap gap-2 mt-4 ">
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
            <div className="flex gap-2 mt-2 ml-8">
              <Skeleton className="h-6 w-16 rounded-full" />
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
        <h1 className="text-2xl font-bold">Pet Donation</h1>
        <div className="flex flex-wrap  gap-2">
          <Button onClick={() => setMyPostsOpen(true)} variant="outline" className="sm:w-auto">
            My Posts
          </Button>
          <Button onClick={() => setCreatePostOpen(true)} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
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
            <section>
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-3">
              Pets in Your Area: {userData.area}, {userData.city}
            </h2>
            <div className="space-y-6">
              {localPosts.map(renderPostCard)}
            </div>
          </section>
          )}

          {/* Missing location warning */}
          {!userData.city || !userData.area ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-4">
              <p className="font-medium">
                Please update your city and area in your profile
              </p>
              <p className="text-sm mt-1">
                This will help us show you pets available in your area.
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

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSuccess={handleCreatePostSuccess}
      />

      {/* My Posts Dialog */}
      <MyPostsDialog
        open={myPostsOpen}
        onOpenChange={setMyPostsOpen}
        onUpdate={fetchPosts}
      />
    </div>
  );
}