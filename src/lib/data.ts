import { prisma } from "./prisma"
import { hash, compare } from "bcrypt"


export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function createUser(data: { name: string; email: string; password: string }) {
  try {
    const hashedPassword = await hash(data.password, 10)

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function verifyUserCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    const passwordValid = await compare(password, user.password)

    if (!passwordValid) {
      return null
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Error verifying user credentials:", error)
    return null
  }
}


export async function getCaregiverByEmail(email: string) {
  try {
    return await prisma.caregiver.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error("Error getting caregiver by email:", error)
    return null
  }
}

export async function createCaregiver(data: { name: string; email: string; password: string }) {
  try {
    const hashedPassword = await hash(data.password, 10)

    return await prisma.caregiver.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        bio: "",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    console.error("Error creating caregiver:", error)
    throw error
  }
}

export async function verifyCaregiverCredentials(email: string, password: string) {
  try {
    const caregiver = await prisma.caregiver.findUnique({
      where: { email },
    })

    if (!caregiver) {
      return null
    }

    const passwordValid = await compare(password, caregiver.password)

    if (!passwordValid) {
      return null
    }

    // Return caregiver without password
    const { password: _, ...caregiverWithoutPassword } = caregiver
    return caregiverWithoutPassword
  } catch (error) {
    console.error("Error verifying caregiver credentials:", error)
    return null
  }
}

