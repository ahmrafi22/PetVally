"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowBigUp, MessageSquare, Users, User, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"

type MyPostsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

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
  adoptionForms: AdoptionForm[]
  _count: {
    comments: number
    adoptionForms: number
    upvotes: number
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

export function MyPostsDialog({ open, onOpenChange, onUpdate }: MyPostsDialogProps) {
  const [posts, setPosts] = useState<DonationPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingForm, setProcessingForm] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchUserPosts()
    }
  }, [open])

  const fetchUserPosts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("userToken")
      if (!token) {
        throw new Error("You must be logged in to view your posts")
      }

      const response = await fetch("/api/users/donation/myposts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch your posts")
      }

      const data = await response.json()
      setPosts(data.posts)
    } catch (error: any) {
      console.error("Error fetching user posts:", error)
      setError(error.message || "An error occurred while fetching your posts")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptApplication = async (formId: string) => {
    try {
      setProcessingForm(formId)
      const token = localStorage.getItem("userToken")
      if (!token) {
        throw new Error("You must be logged in to accept applications")
      }

      const response = await fetch(`/api/users/donation/application/${formId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to accept application")
      }

      toast.success("Application accepted successfully!")
      fetchUserPosts()
      onUpdate()
    } catch (error: any) {
      console.error("Error accepting application:", error)
      toast.error(error.message || "Failed to accept application")
    } finally {
      setProcessingForm(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Donation Posts</DialogTitle>
          <DialogDescription>View and manage your pet donation posts and adoption applications.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven&apos;t created any donation posts yet.</p>
            <Button
              className="mt-4"
              onClick={() => {
                onOpenChange(false)
                // Add a small delay to avoid UI glitches
                setTimeout(() => document.getElementById("create-post-button")?.click(), 100)
              }}
            >
              Create Your First Post
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="available">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="adopted">Adopted</TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="mt-4 space-y-6">
              {posts.filter((post) => post.isAvailable).length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>You don&apos;t have any available donation posts.</p>
                </div>
              ) : (
                posts
                  .filter((post) => post.isAvailable)
                  .map((post) => (
                    <div key={post.id} className="border rounded-lg overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 h-40 sm:h-auto">
                          <img
                            src={post.images || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="sm:w-2/3 p-4">
                          <div className="flex justify-between items-start">
                            <Link
                              href={`/donation/${post.id}`}
                              className="text-lg font-semibold text-purple-700 hover:underline"
                            >
                              {post.title}
                            </Link>
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          </div>

                          <div className="flex items-center mt-1 text-gray-600 text-sm">
                            <span className="mr-2">{post.species}</span>•<span className="mx-2">{post.breed}</span>•
                            <span className="ml-2">
                              {post.age} {post.age === 1 ? "year" : "years"} old
                            </span>
                          </div>

                          <div className="flex items-center mt-3 text-gray-500 text-sm">
                            <div className="flex items-center mr-4">
                              <ArrowBigUp className="h-5 w-5 mr-1" />
                              <span>{post.upvotesCount}</span>
                            </div>
                            <div className="flex items-center mr-4">
                              <MessageSquare className="h-5 w-5 mr-1" />
                              <span>{post._count.comments}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-5 w-5 mr-1" />
                              <span>{post._count.adoptionForms}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Applications:</p>
                            {post.adoptionForms.length === 0 ? (
                              <p className="text-sm text-gray-500 mt-1">No applications yet</p>
                            ) : (
                              <div className="mt-2 space-y-3">
                                {post.adoptionForms.map((form) => (
                                  <div key={form.id} className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center justify-between">
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
                                          <p className="font-medium text-sm">{form.user.name}</p>
                                          <p className="text-xs text-gray-500">{formatDate(form.createdAt)}</p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleAcceptApplication(form.id)}
                                        disabled={processingForm === form.id}
                                      >
                                        {processingForm === form.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <>Accept</>
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-sm mt-2">{form.description}</p>
                                    <div className="flex items-center mt-2 text-xs text-gray-600">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>Meeting: {formatDate(form.meetingSchedule)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>
            <TabsContent value="adopted" className="mt-4 space-y-6">
              {posts.filter((post) => !post.isAvailable).length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>You don&apos;t have any adopted pets.</p>
                </div>
              ) : (
                posts
                  .filter((post) => !post.isAvailable)
                  .map((post) => {
                    const acceptedForm = post.adoptionForms.find((form) => form.status === "ACCEPTED")

                    return (
                      <div key={post.id} className="border rounded-lg overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/3 h-40 sm:h-auto relative">
                            <img
                              src={post.images || "/placeholder.svg"}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">Adopted</span>
                            </div>
                          </div>
                          <div className="sm:w-2/3 p-4">
                            <div className="flex justify-between items-start">
                              <Link
                                href={`/donation/${post.id}`}
                                className="text-lg font-semibold text-purple-700 hover:underline"
                              >
                                {post.title}
                              </Link>
                              <Badge className="bg-gray-100 text-gray-800">Adopted</Badge>
                            </div>

                            {acceptedForm && (
                              <div className="mt-3 bg-green-50 p-3 rounded-md border border-green-100">
                                <p className="text-sm font-medium text-green-800">Adopted by:</p>
                                <div className="flex items-center mt-2">
                                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                                    {acceptedForm.user.image ? (
                                      <img
                                        src={acceptedForm.user.image || "/placeholder.svg"}
                                        alt={acceptedForm.user.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-full w-full p-1 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{acceptedForm.user.name}</p>
                                    <div className="flex items-center mt-1 text-xs text-gray-600">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>Meeting: {formatDate(acceptedForm.meetingSchedule)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
