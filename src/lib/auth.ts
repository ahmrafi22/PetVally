import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { User, Caregiver } from "@prisma/client"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_please_change_in_production")

export async function signJwtToken(payload: any, options = {}) {
  // Create a serializable copy of the payload
  const serializablePayload = JSON.parse(JSON.stringify(payload))
  
  const token = await new SignJWT(serializablePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4d") 
    .sign(JWT_SECRET)

  return token
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function setUserCookie(user: Partial<User>) {
  // Remove password from user object
  const { password, ...userWithoutPassword } = user

  const token = await signJwtToken({
    ...userWithoutPassword,
    role: "user",
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: "user-token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 4, // 4 days
  })

  // Also set a non-HttpOnly cookie for client-side access
  cookieStore.set({
    name: "user-token-client",
    value: token,
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 4, // 4 days
  })

  return token
}

export async function setCaregiverCookie(caregiver: Partial<Caregiver>) {
  // Remove password from caregiver object
  const { password, ...caregiverWithoutPassword } = caregiver

  // Create a serializable copy of the caregiver data
  const serializableCaregiver = JSON.parse(JSON.stringify(caregiverWithoutPassword))

  const token = await signJwtToken({
    ...serializableCaregiver,
    role: "caregiver",
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: "caregiver-token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 4, // 4 days
  })

  // Also set a non-HttpOnly cookie for client-side access
  cookieStore.set({
    name: "caregiver-token-client",
    value: token,
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 4, // 4 days
  })

  return token
}

export async function clearUserCookie() {
  const cookieStore = await cookies()

  // Clear both cookies
  cookieStore.set({
    name: "user-token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  })

  cookieStore.set({
    name: "user-token-client",
    value: "",
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  })
}

export async function clearCaregiverCookie() {
  const cookieStore = await cookies()

  // Clear both cookies
  cookieStore.set({
    name: "caregiver-token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  })

  cookieStore.set({
    name: "caregiver-token-client",
    value: "",
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  })
}

// Function to verify user authentication from request
export async function verifyUserAuth(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJwtToken(token)

    if (!payload || payload.role !== "user") {
      return null
    }

    return payload.id
  } catch (error) {
    console.error("Error verifying user auth:", error)
    return null
  }
}

// Function to verify caregiver authentication from request
export async function verifyCaregiverAuth(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJwtToken(token)

    if (!payload || payload.role !== "caregiver") {
      return null
    }

    return payload.id
  } catch (error) {
    console.error("Error verifying caregiver auth:", error)
    return null
  }
}