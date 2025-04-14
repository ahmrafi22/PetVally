"use client"

import { useState, useEffect } from "react"
import LoadingScreen from "./(_marketing)/loading"
import MainPage from "./(_marketing)/main-page"
import GlassButton from "./(_marketing)/glass-button"
import Second from "./(_marketing)/second-page"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a timer to consider loading complete after 2.5 seconds
    // (2 seconds for loading + 0.5 seconds for transition)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen">
      {isLoading && <LoadingScreen />}
      
      {/* MainPage is always rendered but only visible when not loading */}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <MainPage />
        <Second />
      </div>
      


    </main>
  )
}