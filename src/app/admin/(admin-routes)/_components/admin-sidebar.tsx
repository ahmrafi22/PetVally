"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, PawPrint,  LogOut, Menu, X, ShoppingCartIcon, Package, ShoppingCart } from "lucide-react"

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      localStorage.removeItem("adminToken")
      router.push("/admin")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen)
  }

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin/dashboard" },
    { name: "Pet Management", icon: <PawPrint size={20} />, href: "/admin/petadd" },
    { name: "Product Management", icon: <Package size={20} />, href: "/admin/productadd" },
    { name: "Order Management", icon: <ShoppingCart size={20} />, href: "/admin/orderconfirm" }

  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30  text-gray-500 p-2 rounded-md"
        onClick={toggleMobileMenu}
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
          isMobile ? (mobileOpen ? "translate-x-0 w-64" : "-translate-x-full") : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-center p-5.5 bg-purple-600 text-white">
            <h2 className="text-xl font-bold">Admin Portal</h2>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-md ${
                      pathname === item.href
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <span className="inline-block mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center p-3 w-full rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

