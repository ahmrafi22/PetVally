import { type NextRequest, NextResponse } from "next/server"
import { verifyJwtToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/userlogin" ||
    path === "/userregistration" ||
    path === "/caregiverlogin" ||
    path === "/caregiverregistration" ||
    path.startsWith("/api/")

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Add cache control headers to prevent caching of protected routes
  const response = NextResponse.next()
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  // Check for user routes
  if (path.startsWith("/user/") || path.startsWith("/profile/")) {
    const userToken = request.cookies.get("user-token")?.value

    if (!userToken) {
      return NextResponse.redirect(new URL("/userlogin", request.url))
    }

    try {
      const payload = await verifyJwtToken(userToken)
      if (!payload || payload.role !== "user") {
        return NextResponse.redirect(new URL("/userlogin", request.url))
      }

      // Add the cache control headers to the response
      return response
    } catch (error) {
      return NextResponse.redirect(new URL("/userlogin", request.url))
    }
  }

  // Check for caregiver routes
  if (path.startsWith("/caregiver/") || path.startsWith("/careprofile/")) {
    const caregiverToken = request.cookies.get("caregiver-token")?.value

    if (!caregiverToken) {
      return NextResponse.redirect(new URL("/caregiverlogin", request.url))
    }

    try {
      const payload = await verifyJwtToken(caregiverToken)
      if (!payload || payload.role !== "caregiver") {
        return NextResponse.redirect(new URL("/caregiverlogin", request.url))
      }

      // Add the cache control headers to the response
      return response
    } catch (error) {
      return NextResponse.redirect(new URL("/caregiverlogin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

