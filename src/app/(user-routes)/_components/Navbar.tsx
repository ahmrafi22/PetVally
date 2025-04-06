"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShoppingBag,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PawPrint,
} from "lucide-react"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function UserNavigation() {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [selected, setSelected] = useState("Pet Shop")
  const router = useRouter()
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  
  // Refs for GSAP animations
  const sidebarRef = useRef(null)
  const textElementsRef = useRef<HTMLSpanElement[]>([])
  const notificationRef = useRef(null)

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

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return

      try {
        const token = localStorage.getItem("userToken")
        if (!token) return

        const response = await fetch(`/api/users/userdata?id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUserName(data.user.name)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [userId])

  // GSAP animations for sidebar expand/collapse - decreased animation time
  useEffect(() => {
    if (!isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: expanded ? "225px" : "64px",
        duration: 0.2, // Decreased from 0.3
        ease: "power2.out"
      })

      // Animate text elements with faster timing
      if (expanded) {
        gsap.fromTo(
          textElementsRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.02, delay: 0.02, duration: 0.1 } 
        )
      } else {
        gsap.to(textElementsRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.15 // Decreased from 0.2
        })
      }
    }
  }, [expanded, isMobile])

  useEffect(() => {
    if (isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        x: mobileOpen ? 0 : "-100%",
        duration: 0.2, 
        ease: "linear"
      })

      if (mobileOpen) {
        gsap.fromTo(
          textElementsRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.02, delay: 0.05, duration: 0.2 } 
        )
      }
    }
  }, [mobileOpen, isMobile])

  // Reset position when switching between mobile and desktop
  useEffect(() => {
    if (sidebarRef.current) {
      if (isMobile) {
        gsap.set(sidebarRef.current, {
          width: "256px",
          x: mobileOpen ? 0 : "-100%"
        })
      } else {
        gsap.set(sidebarRef.current, {
          width: expanded ? "225px" : "64px",
          x: 0
        })
      }
    }
  }, [isMobile])

  async function handleLogout() {
    await fetch("/api/users/logout", { method: "POST" })
    localStorage.removeItem("userToken")
    localStorage.removeItem("userId")
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
    { name: "Pet Shop", icon: <PawPrint size={20} />, href: "/petshop" },
    { name: "Store", icon: <ShoppingBag size={20} />, href: "/store" },
    { name: "Forum", icon: <MessageSquare size={20} />, href: "/forum", notifs: 3 },
  ]

  // Add reference to text elements for animation
  const addToRefs = (el:any) => {
    if (el && !textElementsRef.current.includes(el)) {
      textElementsRef.current.push(el)
    }
  }

  return (
    <>
      {/* Mobile menu button - hidden when sidebar is open */}
      {(!mobileOpen || !isMobile) && (
        <button
          className="md:hidden fixed top-4 left-4 z-30 bg-indigo-600 text-white p-2 rounded-md"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-200"
        style={{ 
          width: isMobile ? "256px" : (expanded ? "225px" : "64px"),
          transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)"
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo */}
          <div className="mb-3 border-b border-slate-300 pb-3 px-2">
            <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100 p-2">
              <div className="flex items-center gap-2">
                <div className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600 text-white">
                  <PawPrint size={24} />
                </div>
                {(expanded || isMobile) && (
                  <div>
                    <span ref={addToRefs} className="block text-xs font-semibold">User Portal</span>
                    <span ref={addToRefs} className="block text-xs text-slate-500">{userName || "Welcome"}</span>
                  </div>
                )}
              </div>

              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-md hover:bg-slate-100"
                  aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
                    selected === item.name 
                      ? "bg-indigo-100 text-indigo-800" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  onClick={() => setSelected(item.name)}
                >
                  <div className="grid h-full w-10 place-content-center text-lg">
                    {item.icon}
                  </div>
                  {(expanded || isMobile) && (
                    <span ref={addToRefs} className="text-xs font-medium">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Notification badge */}
                  {item.notifs && (expanded || isMobile) && (
                    <span 
                      ref={notificationRef}
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-4 grid place-content-center rounded bg-indigo-500 text-xs text-white"
                    >
                      {item.notifs}
                    </span>
                  )}
                </Link>
              ))}

              {/* Profile link with user name */}
              <Link
                href={`/profile/${userId}`}
                className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
                  selected === "Profile" 
                    ? "bg-indigo-100 text-indigo-800" 
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                onClick={() => setSelected("Profile")}
              >
                <div className="grid h-full w-10 place-content-center text-lg">
                  <User size={20} />
                </div>
                {(expanded || isMobile) && (
                  <span ref={addToRefs} className="text-xs font-medium truncate">
                    {userName ? `Profile (${userName})` : "Profile"}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Logout button */}
          <div className="border-t border-slate-300">
            <button
              onClick={handleLogout}
              className="w-full flex items-center cursor-pointer p-5 text-red-600 hover:bg-slate-100"
            >
              <div className="grid h-full w-10 place-content-center text-lg">
                <LogOut size={20} />
              </div>
              {(expanded || isMobile) && (
                <span ref={addToRefs} className="text-xs font-medium">
                  Logout
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile only: Toggle close button */}
          {isMobile && (
            <div className="border-t border-slate-300 p-2">
              <button 
                onClick={toggleSidebar}
                className="flex w-full items-center p-2 rounded-md hover:bg-slate-100"
              >
                <div className="grid h-full w-10 place-content-center text-lg">
                  <X size={20} />
                </div>
                <span ref={addToRefs} className="text-xs font-medium">Hide Menu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content padding adjustment */}
      <div className={`transition-all duration-200 ${!isMobile && expanded ? "md:ml-[225px]" : "md:ml-16"}`}>
        {/* This is where the main content will be rendered */}
      </div>
    </>
  )
}