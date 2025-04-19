import { prisma } from "@/lib/prisma"

// Create a notification for a user
export async function createNotification(userId: string, type: string, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
      },
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Create notifications for specific users
export async function createNotificationForUsers(userIds: string[], type: string, message: string) {
  try {
    // Create a notification for each specified user
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type,
            message,
            read: false,
          },
        }),
      ),
    )

    return notifications
  } catch (error) {
    console.error("Error creating notifications for users:", error)
    throw error
  }
}

// Create notifications for all users
export async function createNotificationForAllUsers(type: string, message: string) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
    })

    // Create a notification for each user
    const notifications = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type,
            message,
            read: false,
          },
        }),
      ),
    )

    return notifications
  } catch (error) {
    console.error("Error creating notifications for all users:", error)
    throw error
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return notifications
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    })
    return notification
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    })
    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Get unread notification count for a user
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })
    return count
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    throw error
  }
}
