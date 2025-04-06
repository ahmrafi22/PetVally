"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Briefcase, Calendar, User, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function CaregiverNavigation() {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [caregiverName, setCaregiverName] = useState<string>("")
  const router = useRouter()
  const caregiverId = typeof window !== "undefined" ? localStorage.getItem("caregiverId") : null

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setExpanded(false)
      }
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Fetch caregiver data on mount
  useEffect(() => {
    const fetchCaregiverData = async () => {
      if (!caregiverId) return

      try {
        const token = localStorage.getItem("caregiverToken")
        if (!token) return

        const response = await fetch(`/api/caregivers/caregiverdata?id=${caregiverId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCaregiverName(data.caregiver.name)
        }
      } catch (error) {
        console.error("Error fetching caregiver data:", error)
      }
    }

    fetchCaregiverData()
  }, [caregiverId])

  async function handleLogout() {
    await fetch("/api/caregivers/logout", { method: "POST" })
    localStorage.removeItem("caregiverToken")
    localStorage.removeItem("caregiverId")
    router.push("/")
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setExpanded(!expanded)
    }
  }

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: <Home size={20} />, href: `/careprofile/${caregiverId}` },
    { name: "Jobs", icon: <Briefcase size={20} />, href: "/jobs" },
    { name: "Schedule", icon: <Calendar size={20} />, href: "/schedule" },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-green-600 text-white p-2 rounded-md"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ${
          isMobile ? (mobileOpen ? "translate-x-0 w-64" : "-translate-x-full") : expanded ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            {(expanded || mobileOpen) && <h2 className="text-xl font-bold text-green-600">Caregiver Portal</h2>}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center p-2 rounded-md hover:bg-green-50 text-gray-700 hover:text-green-600"
                  >
                    <span className="inline-block">{item.icon}</span>
                    {(expanded || mobileOpen) && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}

              {/* Profile link with caregiver name */}
              <li>
                <Link
                  href={`/careprofile/${caregiverId}`}
                  className="flex items-center p-2 rounded-md hover:bg-green-50 text-gray-700 hover:text-green-600"
                >
                  <span className="inline-block">
                    <User size={20} />
                  </span>
                  {(expanded || mobileOpen) && (
                    <span className="ml-3 truncate">{caregiverName ? `${caregiverName}` : "Profile"}</span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className={`flex items-center p-2 w-full cursor-pointer rounded-md text-red-600 hover:bg-red-50 ${
                expanded || mobileOpen ? "justify-start" : "justify-center"
              }`}
            >
              <LogOut size={20} />
              {(expanded || mobileOpen) && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content padding adjustment */}
      <div className={`transition-all duration-300 ${!isMobile && expanded ? "md:ml-64" : "md:ml-20"}`}>
        {/* This is where the main content will be rendered */}
      </div>
    </>
  )
}

