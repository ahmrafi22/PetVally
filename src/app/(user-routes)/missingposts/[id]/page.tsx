"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowBigUp,
  MessageSquare,
  User,
  Calendar,
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  MapPin,
  Cat,
} from "lucide-react";
import {
  UpdateMissingPostDialog,
  MissingPost as ComponentMissingPost,
} from "../_components/update-missing-post";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  comments: Comment[];
  _count: {
    comments: number;
    upvotes: number;
  };
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  userId: string;
  missingPostId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
};

export default function MissingPetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<MissingPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [upvoting, setUpvoting] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    setCurrentUserId(localStorage.getItem("userId"));
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch(`/api/users/missingposts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch post details");
      }

      const data = await response.json();
      setPost(data.post);
      setHasUpvoted(data.hasUpvoted);
    } catch (error: any) {
      console.error("Error fetching post details:", error);
      setError(
        error.message || "An error occurred while fetching post details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const endpoint = hasUpvoted ? "remove-upvote" : "upvote";
      const response = await fetch(
        `/api/users/missingposts/${id}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${hasUpvoted ? "remove upvote" : "upvote"}`
        );
      }

      // Update local state
      setHasUpvoted(!hasUpvoted);
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          upvotesCount: hasUpvoted
            ? prev.upvotesCount - 1
            : prev.upvotesCount + 1,
        };
      });
    } catch (error: any) {
      console.error("Error upvoting:", error);
      toast.error(error.message || "Failed to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch(`/api/users/missingposts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add comment");
      }

      const data = await response.json();

      // Update local state
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [data.comment, ...prev.comments],
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1,
          },
        };
      });

      // Clear comment input
      setComment("");
      toast.success("Comment added successfully");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setDeletingComment(commentId);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch(
        `/api/users/missingposts/${id}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      // Update local state
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
          _count: {
            ...prev._count,
            comments: prev._count.comments - 1,
          },
        };
      });

      toast.success("Comment deleted successfully");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  const handleUpdateSuccess = () => {
    setUpdateDialogOpen(false);
    fetchPost();
    toast.success("Post updated successfully!");
  };

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch(`/api/users/missingposts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      toast.success("Post deleted successfully");
      router.push("/missingposts");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setDeletingPost(false);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-6 max-w-6xl">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button variant="outline" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="w-full md:w-1/2 h-64 md:h-96" />
            <div className="w-full md:w-1/2 p-4 sm:p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-6 max-w-6xl">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/missing")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Missing Pets
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center text-red-600 mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-semibold">Error</h1>
          </div>
          <p className="text-gray-700">{error || "Post not found"}</p>
        </div>
      </div>
    );
  }

  const isPostOwner = currentUserId === post.user.id;
  const isFound = post.status === "FOUND";
  const statusColor = isFound ? "green" : "red";

  return (
    <div className="container mx-auto py-4 px-4 sm:py-6 max-w-6xl">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/missing")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Missing Pets
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row transition-all">
          <div className="lg:w-1/2 relative">
            <Image
              src={post.images || "/placeholder.svg"}
              alt={post.title}
              fill
              className="w-full h-full object-cover"
            />
            {isFound && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">FOUND</span>
              </div>
            )}
          </div>
          <div className="lg:w-1/2 p-4 sm:p-6">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-700">
                {post.title}
              </h1>
              <Badge
                className={`bg-${statusColor}-100 text-${statusColor}-800 w-1/3 h-10 text-xl`}
              >
                {isFound ? "Found" : "Missing"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center mt-2 text-gray-600 text-sm sm:text-base">
              <Cat className="inline w-4 h-4 mb-1 mr-1" />
              <span className="mr-2">{post.species}</span>•
              <span className="mx-2">{post.breed}</span>•
              <span className="ml-2">
                {post.age} {post.age === 1 ? "year" : "years"} old
              </span>
            </div>

            <div className="flex items-center mt-1 text-gray-600 text-sm sm:text-base">
              <span>
                <MapPin className="inline w-4 h-4 mb-1 mr-1" />
                {capitalizeFirstLetter(post.area)} -{" "}
                {capitalizeFirstLetter(post.city)} -{" "}
                {capitalizeFirstLetter(post.country)}
              </span>
            </div>

            <div className="flex items-center mt-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                {post.user.image ? (
                  <Image
                    width={32}
                    height={32}
                    src={post.user.image || "/placeholder.svg"}
                    alt={post.user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-1 text-gray-400" />
                )}
              </div>
              <div>
                <Link
                  href={`/profile/${post.user.id}`}
                  className="hover:underline"
                >
                  <p className="font-medium">{post.user.name}</p>
                </Link>
                <p className="text-xs text-gray-500">
                  Posted on {formatDate(post.createdAt)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-2 text-gray-700">{post.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Species</h3>
                  <p className="text-gray-600">
                    {capitalizeFirstLetter(post.species)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Breed</h3>
                  <p className="text-gray-600">
                    {capitalizeFirstLetter(post.breed)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Age</h3>
                  <p className="text-gray-600">
                    {post.age} {post.age === 1 ? "year" : "years"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center mt-6 gap-3">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                onClick={handleUpvote}
                disabled={upvoting}
                className={
                  hasUpvoted ? "bg-purple-600 hover:bg-purple-700" : ""
                }
                size="sm"
              >
                <ArrowBigUp className="h-4 w-4 mr-1 sm:mr-2" />
                {upvoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {post.upvotesCount} Upvote{post.upvotesCount !== 1 && "s"}
                  </>
                )}
              </Button>

              {isPostOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setUpdateDialogOpen(true)}
                    size="sm"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
                    Update Post
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                    Delete Post
                  </Button>
                </>
              )}
            </div>
            {isFound && (
              <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-100">
                <p className="font-medium text-green-800">Good news!</p>
                <p className="text-sm text-green-700 mt-1">
                  This pet has been found and is now safe.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Comments ({post._count.comments})
          </h2>

          {/* Comment form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                disabled={submittingComment || !comment.trim()}
                size="sm"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </form>

          {/* Comments list */}
          {post.comments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                        {comment.user.image ? (
                          <Image
                            width={32}
                            height={32}
                            src={comment.user.image || "/placeholder.svg"}
                            alt={comment.user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-full w-full p-1 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{comment.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    {comment.userId === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingComment === comment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Post Dialog */}
      {post && (
        <UpdateMissingPostDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          post={{
            ...post,
            status: post.status as "FOUND" | "NOT_FOUND",
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              missing pet post and remove all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={deletingPost}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletingPost ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {deletingPost ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
