"use client"

import { useEffect, useState } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import PetVallyLogo from "@/components/_shared/logo"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 5
      })
    }, 100) // Update every 100ms to complete in 2 seconds

    // Trigger transition after 2 seconds
    const timer = setTimeout(() => {
      setLoadingComplete(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-bl from-red-200 to-blue-200 transition-transform duration-500 ease-in-out ${
        loadingComplete ? "translate-y-[-100%]" : "translate-y-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md">

        <div className="w-[200px] h-[200px]">
          <DotLottieReact
            src="https://lottie.host/58559bf5-f008-4a14-a14d-eb69771db4fd/jv3Oa5D40Y.lottie"
            loop
            autoplay
          />
        </div>

        <div className="w-full max-w-md bg-gray-200  h-[3.5px] mt-4">
          <div
            className="bg-green-500 h-[3.5px] rounded-sm transition-all duration-100 ease-linear"
            style={{ width: `${progress+4}%` }}
          ></div>
        </div>
      </div>
      <header className="w-full z-10 absolute top-0">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>
    </div>
  )
}
