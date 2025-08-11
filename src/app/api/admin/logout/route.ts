import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {

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


  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")



  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}

