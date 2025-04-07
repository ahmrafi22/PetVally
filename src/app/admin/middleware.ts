import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwtToken } from "@/lib/auth"

export async function middleware(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Skip middleware for login page
  if (path === "/admin") {
    return NextResponse.next()
  }

  // Check for admin token
  const cookieStore = await cookies()
  const token = cookieStore.get("admin-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  try {
    const payload = await verifyJwtToken(token)

    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}

