"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useCaregiverStore } from "@/stores/caregiver-store";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export default function CaregiverNavigation() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Get caregiver data from store
  const { caregiverData, fetchCaregiverData } = useCaregiverStore();

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const textElementsRef = useRef<HTMLSpanElement[]>([]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setExpanded(false);
      }
    };

    // Check on mount
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch caregiver data on mount
  useEffect(() => {
    // Check if we already have caregiver data in the store
    const caregiverId = localStorage.getItem("caregiverId");

    if (caregiverId) {
      if (!caregiverData.id || caregiverData.id !== caregiverId) {
        fetchCaregiverData();
      }
    }
  }, [fetchCaregiverData, caregiverData.id]);

  // GSAP animations for sidebar expand/collapse
  useEffect(() => {
    if (!isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: expanded ? "256px" : "70px",
        duration: 0.2,
        ease: "power2.out",
      });

      // Animate text elements
      if (expanded) {
        gsap.fromTo(
          textElementsRef.current,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, stagger: 0.02, duration: 0.2 }
        );
      } else {
        gsap.to(textElementsRef.current, {
          opacity: 0,
          x: -12,
          duration: 0.15,
        });
      }
    }
  }, [expanded, isMobile]);

  // Mobile sidebar animation
  useEffect(() => {
    if (isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        x: mobileOpen ? 0 : "-100%",
        duration: 0.2,
        ease: "linear",
      });

      if (mobileOpen) {
        gsap.fromTo(
          textElementsRef.current,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, stagger: 0.02, duration: 0.2 }
        );
      }
    }
  }, [mobileOpen, isMobile]);

  // Reset position when switching between mobile and desktop
  useEffect(() => {
    if (sidebarRef.current) {
      if (isMobile) {
        gsap.set(sidebarRef.current, {
          width: "256px",
          x: mobileOpen ? 0 : "-100%",
        });
      } else {
        gsap.set(sidebarRef.current, {
          width: expanded ? "256px" : "70px",
          x: 0,
        });
      }
    }
  }, [isMobile, mobileOpen, expanded]);

  // Add reference to text elements for animation
  const addToRefs = (el: any) => {
    if (el && !textElementsRef.current.includes(el)) {
      textElementsRef.current.push(el);
    }
  };

  async function handleLogout() {
    await fetch("/api/caregivers/logout", { method: "POST" });
    localStorage.removeItem("caregiverToken");
    localStorage.removeItem("caregiverId");
    // Clear caregiver data from store
    useCaregiverStore.getState().clearCaregiverData();
    router.push("/");
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setExpanded(!expanded);
    }
  };

  // Handle closing navigation
  const handleNavClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    } else {
      setExpanded(false);
    }
  };

  // Clicking outside handle
  useEffect(() => {
    if (!isMobile && expanded) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest('button[aria-label*="sidebar"]')
        ) {
          setExpanded(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, expanded]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const caregiverId = caregiverData.id;

  // Navigation items
  const navItems = [
    { name: "Jobs", icon: <Briefcase size={25} />, href: "/findjobs" },
    { name: "My Schedule", icon: <Calendar size={25} />, href: `/myschedule/${caregiverId}` },
  ];

  return (
    <>
      {/* Mobile menu button  */}
      {(!mobileOpen || !isMobile) && (
        <button
          className="md:hidden fixed top-4 left-4 z-30 text-black p-2 rounded-md"
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
        className="fixed top-0 left-0 h-full bg-white/90 shadow-lg z-20 transition-all duration-200"
        style={{
          width: isMobile ? "256px" : expanded ? "256px" : "70px", 
          transform:
            isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-[19px] border-b">
            <div className="flex items-center gap-2">
              {(expanded || mobileOpen) && (
                <h2 ref={addToRefs} className="text-xl font-bold text-green-600">
                  Caregiver Portal
                </h2>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {expanded ? (
                  <ChevronLeft size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
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
                    onClick={handleNavClose}
                    className={cn("flex items-center p-2 rounded-full text-gray-700 hover:text-green-600", 
                      pathname.startsWith(item.href) ? 'text-green-600' : 'text-gray-700')}
                  >
                    <span className="inline-block">{item.icon}</span>
                    {(expanded || mobileOpen) && (
                      <span ref={addToRefs} className="ml-3">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              {/* Profile link with caregiver name */}
              <li>
                <Link
                  href={`/careprofile/${caregiverId}`}
                  onClick={handleNavClose}
                  className={cn("flex items-center p-2 rounded-full text-gray-700 hover:text-green-600",
                    pathname.startsWith('/careprofile/') ? 'text-green-600' : 'text-gray-700')}
                >
                  <span className="inline-block">
                    {caregiverData.image ? (
                      <Image
                        src={caregiverData.image}
                        alt="Profile"
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <User size={25} />
                    )}
                  </span>
                  {(expanded || mobileOpen) && (
                    <span ref={addToRefs} className="ml-3 truncate">
                      {caregiverData.name ? `Profile (${caregiverData.name})` : "Profile"}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className={`flex cursor-pointer items-center p-2 w-full rounded-full text-red-600 hover:bg-red-50 ${
                expanded || mobileOpen ? "justify-start" : "justify-center"
              }`}
            >
              <LogOut size={20} />
              {(expanded || mobileOpen) && (
                <span ref={addToRefs} className="ml-3">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-200 ${
          !isMobile && expanded ? "md:ml-64" : "md:ml-20"
        }`}
      >
      </div>
    </>
  );
}