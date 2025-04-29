"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Bell,
  ShoppingCart,
  HeartHandshake,
  OctagonAlert,
  BotMessageSquare,
  BriefcaseMedicalIcon,
} from "lucide-react";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export default function UserNavigation() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { cart } = useCartStore();
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false);

  // zustand stores
  const { count: notificationCount, fetchCount } = useNotificationStore();
  const { userData, fetchUserData } = useUserStore();

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const textElementsRef = useRef<HTMLSpanElement[]>([]);

  // initial expanded state based on screen size
  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [isMobile]);

  // Fetch user data and notification count on mount
  useEffect(() => {
    // Check if we already have user data in the store
    const userId = localStorage.getItem("userId");

    if (userId) {
      if (!userData.id || userData.id !== userId) {
        fetchUserData();
      }

      fetchCount();

      // Animate notification badge if there are unread notifications
      if (notificationCount > 0) {
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

    // Set up interval to check for new notifications every minute
    const intervalId = async () => {
      if (!localStorage.getItem("userToken")) return;

      // Get previous count before fetching
      const prevCount = useNotificationStore.getState().count;

      // Fetch new count using the store
      await fetchCount();

      // Get updated count after fetching
      const newCount = useNotificationStore.getState().count;

      // Only animate if the count has increased
      if (newCount > prevCount) {
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
      }
    };
  }, [fetchUserData, fetchCount, notificationCount, userData.id]);

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
    await fetch("/api/users/logout", { method: "POST" });
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    // Clear user data from store
    useUserStore.getState().clearUserData();
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

  //cliking outside handle
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
  }, [isMobile, expanded])

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = isMounted
    ? cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
    : 0;

  // Navigation items
  const navItems = [
    { name: "Pet Shop", icon: <PawPrint size={25} />, href: "/petshop" },
    { name: "Store", icon: <ShoppingBag size={25} />, href: "/store" },
    {
      name: "Cart",
      icon: <ShoppingCart size={25} />,
      href: "/cart",
      badge: itemCount > 0 ? itemCount : null,
    },
    { name: "Pet Donations", icon: <HeartHandshake size={25} />, href: "/donation" },
    { name: "Missing Pets", icon: <OctagonAlert size={25} />, href: "/missingposts" },
    { name: "Vetchat bot", icon: <BotMessageSquare size={25} />, href: "/vetchat" },
    { name: "Vetdoctors", icon: <BriefcaseMedicalIcon size={25} />, href: "/vetinfo" },
    {
      name: "Notifications",
      icon: <Bell size={25} />,
      href: "/notifications",
      badge: notificationCount > 0 ? notificationCount : null,
    },
  ];

  const userId = userData.id;

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
                <h2 ref={addToRefs} className="text-xl font-bold text-pink-600">
                  User Portal
                </h2>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md  hover:bg-gray-100"
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
                    className={cn("flex items-center p-2 rounded-full  text-gray-700, relative hover:text-pink-400",pathname.startsWith(item.href) ? 'text-blue-500 ' : 'text-gray-700')}
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
                  onClick={handleNavClose}
                  className="flex items-center p-2 rounded-full text-gray-700 hover:text-blue-600"
                >
                  <span className="inline-block">
                    {userData.image ? (
                      <Image
                        src={userData.image}
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
                      {userData.name ? `Profile (${userData.name})` : "You"}
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

      {/* Main content */}
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