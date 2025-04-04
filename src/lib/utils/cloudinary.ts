import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload an image to Cloudinary
 * @param imageBase64 Base64 encoded image
 * @param folder Folder to upload to
 * @returns Cloudinary upload response
 */
export async function uploadImage(imageBase64: string, folder = "uploads") {
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder,
    })
    return uploadResponse
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl Cloudinary image URL
 * @returns Cloudinary deletion response
 */
export async function deleteImage(imageUrl: string) {
  try {
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl)

    if (!publicId) {
      throw new Error("Invalid Cloudinary URL")
    }

    const deleteResponse = await cloudinary.uploader.destroy(publicId)
    return deleteResponse
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    throw new Error("Failed to delete image")
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url Cloudinary URL
 * @returns Public ID
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1]
    const folderPath = urlParts[urlParts.length - 2]

    // Remove file extension
    const filenameWithoutExt = filename.split(".")[0]

    return `${folderPath}/${filenameWithoutExt}`
  } catch (error) {
    console.error("Error extracting public ID from URL:", error)
    return null
  }
}

