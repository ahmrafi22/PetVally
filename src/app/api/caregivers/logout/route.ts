import { NextResponse } from "next/server"
import { clearCaregiverCookie } from "@/lib/auth"

export async function POST(request: Request) {
  // Clear the caregiver cookie
  clearCaregiverCookie()

  // Create a response object
  const url = new URL("/", request.url) 

  const response = NextResponse.redirect(url, { status: 303 })

  // Explicitly clear the cookie in the response as well
  response.cookies.set({
    name: "caregiver-token",
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })

  // Add cache control headers to prevent caching
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}
