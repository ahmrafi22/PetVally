"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, Lock, User } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PetVallyLogo from "@/components/_shared/logo";

export default function CaregiverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const caregiverToken = localStorage.getItem("caregiverToken");
      
      if (!caregiverToken) {
        setCheckingAuth(false);
        return;
      }
      
      try {
        const response = await fetch("/api/verify-token", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${caregiverToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          router.push(`/findjobs`);
        } else {
          localStorage.removeItem("caregiverToken");
          localStorage.removeItem("caregiverId");
          setCheckingAuth(false);
        }
      } catch (error) {
        localStorage.removeItem("caregiverToken");
        localStorage.removeItem("caregiverId");
        setCheckingAuth(false);
      }
    };
    
    checkTokenValidity();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/caregivers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("caregiverToken", data.token);
      localStorage.setItem("caregiverId", data.caregiver.id);

      setTimeout(() => {
        router.push(`/findjobs`);
      }, 300);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-yellow-200/70 to-emerald-100 animate-gradient-x">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tl from-yellow-200/70 to-emerald-100 animate-gradient-x relative">
      <header className="w-full z-10 absolute top-0">
        <div className="max-w-7xl mx-auto py-4 sm:px-6 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center z-10 relative">
        <div className="w-full lg:h-[70vh] max-w-7xl mx-auto flex flex-col md:flex-row bg-white/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-green-50/30">
            <DotLottieReact
              src="/lottie/catlaptop.lottie"
              loop
              autoplay
              className="w-full h-64 lg:h-130 lg:w-130"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                  Caregiver Sign In
                </h2>
                <p className="text-center text-gray-600 mt-2">
                  Access your caregiver dashboard
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/caregiverregistration"
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <Link
                    href="/"
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    Back to home
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}