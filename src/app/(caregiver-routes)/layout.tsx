import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJwtToken } from "@/lib/auth"
import CaregiverNavigation from "./_components/Navbar"
import PetVallyLogo2 from "@/components/_shared/logo2"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CaregiverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("caregiver-token")

  if (!token) {
    redirect("/caregiverlogin")
  }

  try {
    const payload = await verifyJwtToken(token.value)

    if (!payload || payload.role !== "caregiver") {
      redirect("/caregiverlogin")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full fixed z-10  bg-white/25 backdrop-blur-[4px] border shadow border-white/20 ">
          <div className="w-full py-4  sm:px-6 lg:px-8">
            <PetVallyLogo2 />
          </div>
        </header>
        <CaregiverNavigation />
        <div className="md:ml-20 mt-15 transition-all duration-300">
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-16 md:pt-6">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    redirect("/userlogin");
  }
}

