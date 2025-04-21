'use server'

import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from "@/lib/utils/cloudinary"
import type { CaregiverProfile } from "@/types"

// Get caregiver by ID
export async function getCaregiverById(id: string) {
  try {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        city: true,
        area: true,
        bio: true,
        verified: true,
        hourlyRate: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Convert Decimal to number for JSON serialization
    if (caregiver) {
      return {
        ...caregiver,
        hourlyRate: caregiver.hourlyRate ? Number(caregiver.hourlyRate) : 0,
        totalEarnings: caregiver.totalEarnings ? Number(caregiver.totalEarnings) : 0,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting caregiver by ID:", error)
    return null
  }
}

// Update caregiver profile
export async function updateCaregiverProfile(id: string, data: Partial<CaregiverProfile>) {
  try {
    const updatedCaregiver = await prisma.caregiver.update({
      where: { id },
      data: {
        name: data.name,
        country: data.country,
        city: data.city,
        area: data.area,
        bio: data.bio,
        hourlyRate: data.hourlyRate ? Number.parseFloat(data.hourlyRate.toString()) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        city: true,
        area: true,
        bio: true,
        verified: true,
        hourlyRate: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Convert Decimal to number for JSON serialization
    return {
      ...updatedCaregiver,
      hourlyRate: updatedCaregiver.hourlyRate ? Number(updatedCaregiver.hourlyRate) : 0,
      totalEarnings: updatedCaregiver.totalEarnings ? Number(updatedCaregiver.totalEarnings) : 0,
    }
  } catch (error) {
    console.error("Error updating caregiver profile:", error)
    throw error
  }
}

// Update caregiver profile image
export async function updateCaregiverProfileImage(id: string, imageBase64: string) {
  try {
    // Get the current caregiver to check if they already have an image
    const currentCaregiver = await prisma.caregiver.findUnique({
      where: { id },
      select: { image: true },
    })

    // If caregiver has an existing image, delete it from Cloudinary
    if (currentCaregiver?.image) {
      await deleteImage(currentCaregiver.image)
    }

    // Upload new image to Cloudinary
    const uploadResponse = await uploadImage(imageBase64, "caregiver_profiles")

    // Update caregiver with new image URL
    const updatedCaregiver = await prisma.caregiver.update({
      where: { id },
      data: {
        image: uploadResponse.secure_url,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        city: true,
        area: true,
        bio: true,
        verified: true,
        hourlyRate: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Convert Decimal to number for JSON serialization
    return {
      ...updatedCaregiver,
      hourlyRate: updatedCaregiver.hourlyRate ? Number(updatedCaregiver.hourlyRate) : 0,
      totalEarnings: updatedCaregiver.totalEarnings ? Number(updatedCaregiver.totalEarnings) : 0,
    }
  } catch (error) {
    console.error("Error updating caregiver profile image:", error)
    throw error
  }
}

