import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"
import { createNotification, createNotificationForUsers } from "@/controllers/notifications"

// Get all missing posts
export async function getAllMissingPosts() {
  try {
    const posts = await prisma.missingPost.findMany({
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
    console.error("Error getting all missing posts:", error)
    throw error
  }
}

export async function getMissingPostsInArea(city: string, area: string) {
  try {
    const normalizedCity = city.trim().toLowerCase()
    const normalizedArea = area.trim().toLowerCase()
    const posts = await prisma.missingPost.findMany({
      where: {
        city: {
          equals: normalizedCity,
          mode: "insensitive",
        },
        area: {
          equals: normalizedArea,
          mode: "insensitive",
        },
        status: "NOT_FOUND", 
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
    console.error("Error getting missing posts in area:", error)
    throw error
  }
}

// Get missing post by ID
export async function getMissingPostById(id: string) {
  try {
    const post = await prisma.missingPost.findUnique({
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
        _count: {
          select: {
            comments: true,
            upvotes: true,
          },
        },
      },
    })

    return post
  } catch (error) {
    console.error("Error getting missing post by ID:", error)
    throw error
  }
}

// Get user's missing posts
export async function getUserMissingPosts(userId: string) {
  try {
    const posts = await prisma.missingPost.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            comments: true,
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
    console.error("Error getting user missing posts:", error)
    throw error
  }
}


export async function createMissingPost(
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
    age: number
  },
) {
  try {
    const uploadResponse = await uploadImage(data.imageBase64, "missing_posts")

    const post = await prisma.missingPost.create({
      data: {
        title: data.title,
        description: data.description,
        images: uploadResponse.secure_url,
        country: data.country,
        city: data.city.trim().toLowerCase(),
        area: data.area.trim().toLowerCase(),
        species: data.species,
        breed: data.breed,
        age: data.age,
        userId,
        status: "NOT_FOUND",
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
    
    const matchingUsers = usersInArea.filter(user => {
      const userCity = user.city?.trim().toLowerCase() || ""
      const userArea = user.area?.trim().toLowerCase() || ""
      return userCity === normalizedCity && userArea === normalizedArea
    })
    
    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map((user) => user.id)
      await createNotificationForUsers(
        userIds,
        "NEW_MISSING_POST",
        `Missing pet reported in your area: ${data.title}`
      )
    }

    return post
  } catch (error) {
    console.error("Error creating missing post:", error)
    throw error
  }
}

// Update missing post
export async function updateMissingPost(
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
    age?: number
  },
) {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.missingPost.findUnique({
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
      const uploadResponse = await uploadImage(data.imageBase64, "missing_posts")
      imageUrl = uploadResponse.secure_url
    }

    // Process city and area to lowercase if provided
    const city = data.city ? data.city.trim().toLowerCase() : undefined
    const area = data.area ? data.area.trim().toLowerCase() : undefined

    // Update post
    const updatedPost = await prisma.missingPost.update({
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
        age: data.age,
      },
    })

    return updatedPost
  } catch (error) {
    console.error("Error updating missing post:", error)
    throw error
  }
}

// Update missing post status (FOUND or NOT_FOUND)
export async function updateMissingPostStatus(
  userId: string,
  postId: string,
  status: "FOUND" | "NOT_FOUND"
) {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.missingPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new Error("Post not found")
    }

    if (post.userId !== userId) {
      throw new Error("You can only update your own posts")
    }

    // Update post status
    const updatedPost = await prisma.missingPost.update({
      where: { id: postId },
      data: {
        status,
      },
    })

    // If pet is found, notify users in the area
    if (status === "FOUND") {
      const usersInArea = await prisma.user.findMany({
        where: {
          city: {
            equals: post.city,
            mode: "insensitive",
          },
          area: {
            equals: post.area,
            mode: "insensitive",
          },
          NOT: {
            id: userId,
          },
        },
        select: {
          id: true,
        },
      })

      if (usersInArea.length > 0) {
        const userIds = usersInArea.map((user) => user.id)
        await createNotificationForUsers(
          userIds,
          "PET_FOUND",
          `Good news! A missing pet in your area has been found: ${post.title}`
        )
      }
    }

    return updatedPost
  } catch (error) {
    console.error("Error updating missing post status:", error)
    throw error
  }
}

// Delete missing post
export async function deleteMissingPost(userId: string, postId: string) {
  try {
    // Check if post exists and belongs to user
    const post = await prisma.missingPost.findUnique({
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
        where: { missingPostId: postId },
      }),
      // Delete all comments for this post
      prisma.comment.deleteMany({
        where: { missingPostId: postId },
      }),
      // Delete the post itself
      prisma.missingPost.delete({
        where: { id: postId },
      }),
    ])

    return true
  } catch (error) {
    console.error("Error deleting missing post:", error)
    throw error
  }
}

// Upvote a post
export async function upvoteMissingPost(userId: string, postId: string) {
  try {
    // Check if user has already upvoted this post
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_missingPostId: {
          userId,
          missingPostId: postId,
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
          missingPostId: postId,
        },
      }),
      prisma.missingPost.update({
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
    console.error("Error upvoting missing post:", error)
    throw error
  }
}

// Remove upvote from a post
export async function removeUpvoteFromMissingPost(userId: string, postId: string) {
  try {
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_missingPostId: {
          userId,
          missingPostId: postId,
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
          userId_missingPostId: {
            userId,
            missingPostId: postId,
          },
        },
      }),
      prisma.missingPost.update({
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
    console.error("Error removing upvote from missing post:", error)
    throw error
  }
}

// Check if user has upvoted a missing post
export async function hasUserUpvotedMissingPost(userId: string, postId: string) {
  try {
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_missingPostId: {
          userId,
          missingPostId: postId,
        },
      },
    })

    return !!upvote
  } catch (error) {
    console.error("Error checking if user has upvoted missing post:", error)
    throw error
  }
}

// Add comment to a missing post
export async function addCommentToMissingPost(userId: string, postId: string, content: string) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        missingPostId: postId,
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
    const post = await prisma.missingPost.findUnique({
      where: { id: postId },
      select: { userId: true, title: true },
    })

    // Don't notify if the commenter is the post owner
    if (post && post.userId !== userId) {
      await createNotification(post.userId, "NEW_COMMENT", `Someone commented on your missing pet post: "${post.title}"`)
    }

    return comment
  } catch (error) {
    console.error("Error adding comment to missing post:", error)
    throw error
  }
}

// Delete comment from missing post
export async function deleteCommentFromMissingPost(userId: string, commentId: string) {
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
    console.error("Error deleting comment from missing post:", error)
    throw error
  }
}