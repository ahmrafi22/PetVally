"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  ArrowBigUp,
  MessageSquare,
  Users,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { AdoptionFormDialog } from "../_components/adoption-form-dialog"
import { UpdateDonationDialog } from "../_components/update-donation-dialog"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DonationPost = {
  id: string
  title: string
  description: string
  images: string
  country: string
  city: string
  area: string
  isAvailable: boolean
  upvotesCount: number
  species: string
  breed: string
  gender: string
  age: number
  vaccinated: boolean
  neutered: boolean
  user: {
    id: string
    name: string
    image: string | null
  }
  comments: Comment[]
  adoptionForms: AdoptionForm[]
  _count: {
    comments: number
    adoptionForms: number
  }
  createdAt: string
}

type Comment = {
  id: string
  content: string
  userId: string
  donationPostId: string
  user: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
}

type AdoptionForm = {
  id: string
  description: string
  meetingSchedule: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  userId: string
  donationPostId: string
  user: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
}

export default function DonationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<DonationPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [deletingComment, setDeletingComment] = useState<string | null>(null)
  const [upvoting, setUpvoting] = useState(false)
  const [adoptionFormOpen, setAdoptionFormOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingPost, setDeletingPost] = useState(false)

  const id = params.id as string

  useEffect(() => {
    setCurrentUserId(localStorage.getItem("userId"))
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/donation/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch post details")
      }

      const data = await response.json()
      setPost(data.post)
      setHasUpvoted(data.hasUpvoted)

      // Check if user has already applied
      if (data.post.adoptionForms.some((form: AdoptionForm) => form.userId === localStorage.getItem("userId"))) {
        setHasApplied(true)
      }
    } catch (error: any) {
      console.error("Error fetching post details:", error)
      setError(error.message || "An error occurred while fetching post details")
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    try {
      setUpvoting(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const endpoint = hasUpvoted ? "remove-upvote" : "upvote"
      const response = await fetch(`/api/users/donation/${id}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${hasUpvoted ? "remove upvote" : "upvote"}`)
      }

      // Update local state
      setHasUpvoted(!hasUpvoted)
      setPost((prev) => {
        if (!prev) return null
        return {
          ...prev,
          upvotesCount: hasUpvoted ? prev.upvotesCount - 1 : prev.upvotesCount + 1,
        }
      })
    } catch (error: any) {
      console.error("Error upvoting:", error)
      toast.error(error.message || "Failed to upvote")
    } finally {
      setUpvoting(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setSubmittingComment(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/donation/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add comment")
      }

      const data = await response.json()

      // Update local state
      setPost((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: [data.comment, ...prev.comments],
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1,
          },
        }
      })

      // Clear comment input
      setComment("")
      toast.success("Comment added successfully")
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast.error(error.message || "Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      setDeletingComment(commentId)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/donation/${id}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete comment")
      }

      // Update local state
      setPost((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
          _count: {
            ...prev._count,
            comments: prev._count.comments - 1,
          },
        }
      })

      toast.success("Comment deleted successfully")
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      toast.error(error.message || "Failed to delete comment")
    } finally {
      setDeletingComment(null)
    }
  }

  const handleAdoptionFormSuccess = () => {
    setAdoptionFormOpen(false)
    fetchPost()
    toast.success("Application submitted successfully!")
  }

  const handleUpdateSuccess = () => {
    setUpdateDialogOpen(false)
    fetchPost()
    toast.success("Post updated successfully!")
  }

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        router.push("/userlogin")
        return
      }

      const response = await fetch(`/api/users/donation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete post")
      }

      toast.success("Post deleted successfully")
      router.push("/donation")
    } catch (error: any) {
      console.error("Error deleting post:", error)
      toast.error(error.message || "Failed to delete post")
    } finally {
      setDeletingPost(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
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
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-6 max-w-6xl">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/donation")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Donations
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
    )
  }

  const isPostOwner = currentUserId === post.user.id
  const acceptedApplication = post.adoptionForms.find((form) => form.status === "ACCEPTED")

  return (
    <div className="container mx-auto py-4 px-4 sm:py-6 max-w-6xl">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/donation")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Donations
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row transition-all">
          <div className="lg:w-1/2 relative">
            <img
              src={post.images || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {!post.isAvailable && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">Adopted</span>
              </div>
            )}
          </div>
          <div className="lg:w-1/2 p-4 sm:p-6">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-700">{post.title}</h1>
              <Badge className={post.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {post.isAvailable ? "Available" : "Adopted"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center mt-2 text-gray-600 text-sm sm:text-base">
              <span className="mr-2">{post.species}</span>•<span className="mx-2">{post.breed}</span>•
              <span className="ml-2">
                {post.age} {post.age === 1 ? "year" : "years"} old
              </span>
            </div>

            <div className="flex items-center mt-1 text-gray-600 text-sm sm:text-base">
              <span>
                {capitalizeFirstLetter(post.area)} - {capitalizeFirstLetter(post.city)} - {capitalizeFirstLetter(post.country)}
              </span>
            </div>

            <div className="flex items-center mt-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                {post.user.image ? (
                  <img
                    src={post.user.image || "/placeholder.svg"}
                    alt={post.user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-1 text-gray-400" />
                )}
              </div>
              <div>
                <Link href={`/profile/${post.user.id}`} className="hover:underline">
                  <p className="font-medium">{post.user.name}</p>
                </Link>
                <p className="text-xs text-gray-500">Posted on {formatDate(post.createdAt)}</p>
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
                  <h3 className="font-medium text-gray-700">Gender</h3>
                  <p className="text-gray-600">{post.gender.charAt(0).toUpperCase() + post.gender.slice(1)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Age</h3>
                  <p className="text-gray-600">
                    {post.age} {post.age === 1 ? "year" : "years"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Vaccinated</h3>
                  <p className="flex items-center text-gray-600">
                    {post.vaccinated ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500 mr-1" /> No
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Neutered/Spayed</h3>
                  <p className="flex items-center text-gray-600">
                    {post.neutered ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500 mr-1" /> No
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center mt-6 gap-3">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                onClick={handleUpvote}
                disabled={upvoting}
                className={hasUpvoted ? "bg-purple-600 hover:bg-purple-700" : ""}
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

              {post.isAvailable && !isPostOwner && (
                <Button 
                  onClick={() => setAdoptionFormOpen(true)} 
                  disabled={hasApplied || !!acceptedApplication}
                  size="sm"
                >
                  {hasApplied ? "Already Applied" : "Apply to Adopt"}
                </Button>
              )}

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

            {acceptedApplication && (
              <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-100">
                <p className="font-medium text-green-800">This pet has been adopted</p>
                {acceptedApplication.userId === currentUserId ? (
                  <p className="text-sm text-green-700 mt-1">Congratulations! Your application has been accepted.</p>
                ) : (
                  <p className="text-sm text-green-700 mt-1">This pet has been adopted by another user.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Comments ({post._count.comments})</h2>

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
                            <img
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
                          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
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
                          {deletingComment === comment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
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

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Applications ({post._count.adoptionForms})</h2>

            {post.adoptionForms.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No applications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {post.adoptionForms.map((form) => (
                  <div
                    key={form.id}
                    className={`p-3 sm:p-4 rounded-md ${
                      form.status === "ACCEPTED"
                        ? "bg-green-50 border border-green-100"
                        : form.status === "REJECTED"
                          ? "bg-red-50 border border-red-100"
                          : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                        {form.user.image ? (
                          <img
                            src={form.user.image || "/placeholder.svg"}
                            alt={form.user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-full w-full p-1 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">{form.user.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(form.createdAt)}</p>
                      </div>
                      {form.status === "ACCEPTED" && (
                        <Badge className="ml-auto bg-green-100 text-green-800">Accepted</Badge>
                      )}
                      {form.status === "REJECTED" && (
                        <Badge className="ml-auto bg-red-100 text-red-800">Rejected</Badge>
                      )}
                    </div>

                    {(isPostOwner || form.userId === currentUserId) && (
                      <>
                        <p className="mt-2 text-sm">{form.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Meeting: {formatDate(form.meetingSchedule)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Form Dialog */}
      <AdoptionFormDialog
        open={adoptionFormOpen}
        onOpenChange={setAdoptionFormOpen}
        postId={post.id}
        onSuccess={handleAdoptionFormSuccess}
      />

      {/* Update Post Dialog */}
      {post && (
        <UpdateDonationDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          post={post}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pet donation post and remove all related data.
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
  )
}