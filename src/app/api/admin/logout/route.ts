import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  // Clear the admin cookie
  const cookieStore = await cookies()
  cookieStore.set({
    name: "admin-token",
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })

  // Create a response with redirect
  const response = NextResponse.redirect(
    new URL("/admin", request.url),
    { status: 303 }, // 303 See Other
  )

  // Add cache control headers to prevent caching
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  // Add script to clear localStorage


  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}

