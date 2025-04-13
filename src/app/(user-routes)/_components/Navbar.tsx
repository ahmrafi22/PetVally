"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Bell,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/hooks/use-mobile"; // Adjust path as needed

gsap.registerPlugin(useGSAP);

export default function UserNavigation() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userPic, setUserPic] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const isMobile = useIsMobile();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Refs for GSAP animations
  const sidebarRef = useRef(null);
  const textElementsRef = useRef<HTMLSpanElement[]>([]);

  // Set initial expanded state based on screen size
  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [isMobile]);

  // Fetch user data and notification count on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const response = await fetch(`/api/users/userdata?id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.name);
          setUserPic(data.user.image);
        }

        // Fetch notification count
        const countResponse = await fetch("/api/users/notifications/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          setNotificationCount(countData.count);

          // Animate notification badge if there are unread notifications
          if (countData.count > 0) {
            gsap.fromTo(
              ".notification-badge",
              { scale: 0.5, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
                delay: 0.5,
              }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // Set up interval to check for new notifications every minute
    const intervalId = setInterval(async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const countResponse = await fetch("/api/users/notifications/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          const newCount = countData.count;

          // Only animate if the count has increased
          if (newCount > notificationCount) {
            setNotificationCount(newCount);
            gsap.fromTo(
              ".notification-badge",
              { scale: 0.5, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
              }
            );
          } else {
            setNotificationCount(newCount);
          }
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [userId, notificationCount]);

  // GSAP animations for sidebar expand/collapse
  useEffect(() => {
    if (!isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: expanded ? "256px" : "80px",
        duration: 0.2,
        ease: "power2.out",
      });

      // Animate text elements
      if (expanded) {
        gsap.fromTo(
          textElementsRef.current,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, stagger: 0.02, delay: 0.02, duration: 0.2 }
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
          { opacity: 1, x: 0, stagger: 0.02, delay: 0.05, duration: 0.2 }
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
          width: expanded ? "256px" : "80px",
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
    await fetch("/api/users/logout", { method: "POST" });
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    router.push("/");
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setExpanded(!expanded);
    }
  };

  // Navigation items
  const navItems = [
    { name: "Pet Shop", icon: <PawPrint size={25} />, href: "/petshop" },
    { name: "Store", icon: <ShoppingBag size={25} />, href: "/store" },
    { name: "Forum", icon: <MessageSquare size={25} />, href: "/user/forum" },
    {
      name: "Notifications",
      icon: <Bell size={25} />,
      href: "/notifications",
      badge: notificationCount > 0 ? notificationCount : null,
    },
  ];

  return (
    <>
      {/* Mobile menu button - only shown when sidebar is closed */}
      {(!mobileOpen || !isMobile) && (
        <button
          className="md:hidden fixed top-4 left-4 z-30 bg-blue-600 text-white p-2 rounded-md"
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
          width: isMobile ? "256px" : expanded ? "256px" : "80px",
          transform:
            isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4.5 border-b">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-content-center rounded-md bg-pink-600 text-white">
                <PawPrint size={20} />
              </div>
              {(expanded || mobileOpen) && (
                <h2 ref={addToRefs} className="text-xl font-bold text-pink-600">
                  User Portal
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
                    className="flex items-center p-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 relative"
                  >
                    <span className="inline-block">{item.icon}</span>
                    {(expanded || mobileOpen) && (
                      <span ref={addToRefs} className="ml-3">
                        {item.name}
                      </span>
                    )}
                    {item.badge && (
                      <span className="notification-badge absolute right-2 top-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              {/* Profile link with user name */}
              <li>
                <Link
                  href={`/profile/${userId}`}
                  className="flex items-center p-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                >
                  <span className="inline-block">
                    {userPic ? (
                      <img
                        src={userPic}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </span>
                  {(expanded || mobileOpen) && (
                    <span ref={addToRefs} className="ml-3 truncate">
                      {userName ? `Profile (${userName})` : "Profile"}
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
              className={`flex items-center p-2 w-full rounded-md text-red-600 hover:bg-red-50 ${
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

      {/* Main content padding adjustment */}
      <div
        className={`transition-all duration-200 ${
          !isMobile && expanded ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* This is where the main content will be rendered */}
      </div>
    </>
  );
}