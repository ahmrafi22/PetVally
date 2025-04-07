import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJwtToken } from "@/lib/auth"
import AdminSidebar from "./_components/admin-sidebar"
import PetVallyLogo from "@/components/_shared/logo"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin-token")

  if (!token) {
    redirect("/admin")
  }

  try {
    // Verify the token and make sure it's an admin token
    const payload = await verifyJwtToken(token.value)

    if (!payload || payload.role !== "admin") {
      redirect("/admin")
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center">
            <PetVallyLogo />
          </div>
        </header>
        
        {/* Main content area with sidebar */}
        <div className="flex flex-1 pt-16">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main content */}
          <div className="md:ml-64 flex-1 transition-all duration-300">
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/admin")
  }
}