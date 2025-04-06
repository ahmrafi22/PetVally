import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJwtToken } from "@/lib/auth"
import UserNavigation from "./_components/Navbar"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("user-token")

  if (!token) {
    redirect("/userlogin")
  }

  try {
    // Verify the token and make sure it's a user token
    const payload = await verifyJwtToken(token.value)

    if (!payload || payload.role !== "user") {
      redirect("/userlogin")
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="md:ml-20 transition-all duration-300">
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-16 md:pt-6">{children}</main>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/userlogin")
  }
}

