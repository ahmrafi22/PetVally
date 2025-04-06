import { NextResponse } from "next/server"
import { clearUserCookie } from "@/lib/auth"

export async function POST() {
  // Clear the user cookie
  clearUserCookie()

  // Create a response with redirect
  const response = NextResponse.redirect(
    new URL("/", process.env.VERCEL_URL || "http://localhost:3000"),
    { status: 303 }, // 303 See Other
  )

  // Explicitly clear the cookie in the response as well
  response.cookies.set({
    name: "user-token",
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


