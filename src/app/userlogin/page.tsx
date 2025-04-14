"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, Lock, User } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PetVallyLogo from "@/components/_shared/logo";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      // User is already logged in, redirect to petshop
      router.push("/petshop");
    } else {
      // User is not logged in, allow them to view the login page
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and userId to localStorage
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userId", data.user.id);

      // Save token for display
      setToken(data.token);

      // Redirect to user profile or dashboard
      setTimeout(() => {
        router.push("/petshop");
      }, 300);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while checking authentication status
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 to-purple-100 px-4 sm:px-6 lg:px-5">
      {/* Logo/Header at the top */}
      <header className="w-full pt-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>

      {/* Main content centered in remaining space */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full lg:h-[70vh] max-w-7xl mx-auto flex flex-col md:flex-row bg-white/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {/* Lottie Animation - Hidden on small screens */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-indigo-50/30">
            <DotLottieReact
              src="https://lottie.host/58ed2b94-1c5f-47c3-b62a-ff7d1ffad8f8/wjmYfbGUjd.lottie"
              loop
              autoplay
              className="w-full h-64 lg:h-130 lg:w-130"
            />
          </div>

          {/* Login Form */}
          <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                  Sign in to your account
                </h2>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
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
                        className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                        className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
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
                    href="/userregistration"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <Link
                    href="/"
                    className="font-medium text-blue-600 hover:text-blue-500"
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