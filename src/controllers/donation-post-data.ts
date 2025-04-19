import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"
import { createNotification, createNotificationForUsers } from "@/controllers/notifications"

// Get all donation posts
export async function getAllDonationPosts() {
  try {
    const posts = await prisma.donationPost.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            adoptionForms: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return posts
  } catch (error) {
    console.error("Error getting all donation posts:", error)
    throw error
  }
}

// Get donation posts in user's area
export async function getDonationPostsInArea(city: string, area: string) {
  try {
    // Normalize city and area for case-insensitive comparison
    const normalizedCity = city.trim().toLowerCase()
    const normalizedArea = area.trim().toLowerCase()

    const posts = await prisma.donationPost.findMany({
      where: {
        city: {
          equals: normalizedCity,
          mode: "insensitive",
        },
        area: {
          equals: normalizedArea,
          mode: "insensitive",
        },
        isAvailable: true, 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            adoptionForms: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return posts
  } catch (error) {
    console.error("Error getting donation posts in area:", error)
    throw error
  }
}

// Get donation post by ID
export async function getDonationPostById(id: string) {
  try {
    const post = await prisma.donationPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        adoptionForms: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
            adoptionForms: true,
          },
        },
      },
    })

    return post
  } catch (error) {
    console.error("Error getting donation post by ID:", error)
    throw error
  }
}

// Get user's donation posts
export async function getUserDonationPosts(userId: string) {
  try {
    const posts = await prisma.donationPost.findMany({
      where: { userId },
      include: {
        adoptionForms: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
            adoptionForms: true,
            upvotes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return posts
  } catch (error) {
    console.error("Error getting user donation posts:", error)
    throw error
  }
}

// Create donation post
export async function createDonationPost(
  userId: string,
  data: {
    title: string
    description: string
    imageBase64: string
    country: string
    city: string
    area: string
    species: string
    breed: string
    gender: string
    age: number
    vaccinated: boolean
    neutered: boolean
  },
) {
  try {
    // Upload image to Cloudinary
    const uploadResponse = await uploadImage(data.imageBase64, "donation_posts")

    // Create post in database
    const post = await prisma.donationPost.create({
      data: {
        title: data.title,
        description: data.description,
        images: uploadResponse.secure_url,
        country: data.country,
        city: data.city.trim().toLowerCase(), 
        area: data.area.trim().toLowerCase(), 
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        vaccinated: data.vaccinated,
        neutered: data.neutered,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Find users in the same area to notify
    const normalizedCity = data.city.trim().toLowerCase()
    const normalizedArea = data.area.trim().toLowerCase()
    
    const usersInArea = await prisma.user.findMany({
      where: {
        city: {
          not: null,
          mode: "insensitive",
        },
        area: {
          not: null,
          mode: "insensitive",
        },
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
        city: true,
        area: true,
      },
    })
    
    // Filter users with matching city and area after trimming and lowercase conversion 
    const matchingUsers = usersInArea.filter(user => {
      const userCity = user.city?.trim().toLowerCase() || ""
      const userArea = user.area?.trim().toLowerCase() || ""
      return userCity === normalizedCity && userArea === normalizedArea
    })
    
    // Create notifications for matching users
    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map((user) => user.id)
      await createNotificationForUsers(
        userIds,
        "NEW_DONATION_POST",
        `New pet donation in your area: ${data.title}`
      )
    }
    return post
  } catch (error) {
    console.error("Error creating donation post:", error)
    throw error
  }
}

// Update donation post
export async function updateDonationPost(
  userId: string,
  postId: string,
  data: {
    title?: string
    description?: string
    imageBase64?: string
    country?: string
    city?: string
    area?: string
    species?: string
    breed?: string
    gender?: string
    age?: number
    vaccinated?: boolean
    neutered?: boolean
    isAvailable?: boolean
  },
) {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.donationPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    if (post.userId !== userId) {
      throw new Error("You can only update your own posts")
    }

    // Upload new image if provided
    let imageUrl = post.images
    if (data.imageBase64) {
      // Delete old image
      await deleteImage(post.images)
      // Upload new image
      const uploadResponse = await uploadImage(data.imageBase64, "donation_posts")
      imageUrl = uploadResponse.secure_url
    }

    // Process city and area to lowercase if provided
    const city = data.city ? data.city.trim().toLowerCase() : undefined
    const area = data.area ? data.area.trim().toLowerCase() : undefined

    // Update post
    const updatedPost = await prisma.donationPost.update({
      where: { id: postId },
      data: {
        title: data.title,
        description: data.description,
        images: imageUrl,
        country: data.country,
        city,
        area,
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        vaccinated: data.vaccinated,
        neutered: data.neutered,
        isAvailable: data.isAvailable,
      },
    })

    return updatedPost
  } catch (error) {
    console.error("Error updating donation post:", error)
    throw error
  }
}

// Delete donation post
export async function deleteDonationPost(userId: string, postId: string) {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.donationPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    if (post.userId !== userId) {
      throw new Error("You can only delete your own posts")
    }

    // Delete image from Cloudinary
    await deleteImage(post.images)

    // Delete all related records
    await prisma.$transaction([
      // Delete all upvotes for this post
      prisma.upvote.deleteMany({
        where: { donationPostId: postId },
      }),
      // Delete all comments for this post
      prisma.comment.deleteMany({
        where: { donationPostId: postId },
      }),
      // Delete all adoption forms for this post
      prisma.adoptionForm.deleteMany({
        where: { donationPostId: postId },
      }),
      // Delete the post itself
      prisma.donationPost.delete({
        where: { id: postId },
      }),
    ])

    return true
  } catch (error) {
    console.error("Error deleting donation post:", error)
    throw error
  }
}

// Upvote a post
export async function upvotePost(userId: string, postId: string) {
  try {
    // Check if user has already upvoted this post
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_donationPostId: {
          userId,
          donationPostId: postId,
        },
      },
    })

    if (existingUpvote) {
      throw new Error("You have already upvoted this post")
    }

    // Create upvote and increment upvotesCount in a transaction
    await prisma.$transaction([
      prisma.upvote.create({
        data: {
          userId,
          donationPostId: postId,
        },
      }),
      prisma.donationPost.update({
        where: { id: postId },
        data: {
          upvotesCount: {
            increment: 1,
          },
        },
      }),
    ])

    return true
  } catch (error) {
    console.error("Error upvoting post:", error)
    throw error
  }
}

// Remove upvote from a post
export async function removeUpvote(userId: string, postId: string) {
  try {
    // Check if upvote exists
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_donationPostId: {
          userId,
          donationPostId: postId,
        },
      },
    })

    if (!upvote) {
      throw new Error("You have not upvoted this post")
    }

    // Delete upvote and decrement upvotesCount in a transaction
    await prisma.$transaction([
      prisma.upvote.delete({
        where: {
          userId_donationPostId: {
            userId,
            donationPostId: postId,
          },
        },
      }),
      prisma.donationPost.update({
        where: { id: postId },
        data: {
          upvotesCount: {
            decrement: 1,
          },
        },
      }),
    ])

    return true
  } catch (error) {
    console.error("Error removing upvote:", error)
    throw error
  }
}

// Check if user has upvoted a post
export async function hasUserUpvoted(userId: string, postId: string) {
  try {
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_donationPostId: {
          userId,
          donationPostId: postId,
        },
      },
    })

    return !!upvote
  } catch (error) {
    console.error("Error checking if user has upvoted:", error)
    throw error
  }
}

// Add comment to a post
export async function addComment(userId: string, postId: string, content: string) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        donationPostId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Get post owner to notify them
    const post = await prisma.donationPost.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    })

    // Don't notify if the commenter is the post owner
    if (post && post.userId !== userId) {
      await createNotification(post.userId, "NEW_COMMENT", `Someone commented on your post: "${post.title}"`)
    }

    return comment
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Delete comment
export async function deleteComment(userId: string, commentId: string) {
  try {
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new Error("Comment not found")
    }

    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments")
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return true
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}

// Submit adoption form
export async function submitAdoptionForm(
  userId: string,
  postId: string,
  data: {
    description: string
    meetingSchedule: Date
  },
) {
  try {
    // Check if user has already submitted an adoption form for this post
    const existingForm = await prisma.adoptionForm.findFirst({
      where: {
        userId,
        donationPostId: postId,
      },
    })

    if (existingForm) {
      throw new Error("You have already applied to adopt this pet")
    }

    // Create adoption form
    const form = await prisma.adoptionForm.create({
      data: {
        description: data.description,
        meetingSchedule: data.meetingSchedule,
        userId,
        donationPostId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Get post owner to notify them
    const post = await prisma.donationPost.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    })

    if (post) {
      await createNotification(
        post.userId,
        "NEW_ADOPTION_APPLICATION",
        `Someone applied to adopt your pet: "${post.title}"`,
      )
    }

    return form
  } catch (error) {
    console.error("Error submitting adoption form:", error)
    throw error
  }
}

// Accept adoption form
export async function acceptAdoptionForm(userId: string, formId: string) {
  try {
    // Get the form with post info
    const form = await prisma.adoptionForm.findUnique({
      where: { id: formId },
      include: {
        donationPost: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!form) {
      throw new Error("Adoption form not found")
    }

    // Check if user is the post owner
    if (form.donationPost.userId !== userId) {
      throw new Error("Only the post owner can accept adoption applications")
    }

    // Check if post is still available
    if (!form.donationPost.isAvailable) {
      throw new Error("This pet is no longer available for adoption")
    }

    // Update form status and mark post as unavailable in a transaction
    await prisma.$transaction([
      // Update this form to ACCEPTED
      prisma.adoptionForm.update({
        where: { id: formId },
        data: { status: "ACCEPTED" },
      }),
      // Reject all other forms for this post
      prisma.adoptionForm.updateMany({
        where: {
          donationPostId: form.donationPostId,
          id: { not: formId },
        },
        data: { status: "REJECTED" },
      }),
      // Mark post as unavailable
      prisma.donationPost.update({
        where: { id: form.donationPostId },
        data: { isAvailable: false },
      }),
    ])

    // Notify the applicant
    await createNotification(
      form.userId,
      "ADOPTION_ACCEPTED",
      `Your application to adopt "${form.donationPost.title}" has been accepted!`,
    )

    return true
  } catch (error) {
    console.error("Error accepting adoption form:", error)
    throw error
  }
}

// Get user's meetings (accepted adoption forms)
export async function getUserMeetings(userId: string) {
  try {
    // Get meetings where user is the applicant
    const applicantMeetings = await prisma.adoptionForm.findMany({
      where: {
        userId,
        status: "ACCEPTED",
      },
      include: {
        donationPost: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        meetingSchedule: "asc",
      },
    })

    // Get meetings where user is the post owner
    const ownerMeetings = await prisma.adoptionForm.findMany({
      where: {
        donationPost: {
          userId,
        },
        status: "ACCEPTED",
      },
      include: {
        donationPost: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: {
        meetingSchedule: "asc",
      },
    })

    return {
      applicantMeetings,
      ownerMeetings,
    }
  } catch (error) {
    console.error("Error getting user meetings:", error)
    throw error
  }
}
