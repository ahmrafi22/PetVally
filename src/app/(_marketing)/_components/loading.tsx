"use client"

import { useEffect, useState } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import PetVallyLogo from "@/components/_shared/logo"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 5  
      })
    }, 100)

    const timer = setTimeout(() => {
      setLoadingComplete(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>

      <header className="fixed top-0 left-0 right-0 z-1100">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>


      <div
        className={`fixed inset-0 z-1000 flex flex-col items-center justify-center bg-gradient-to-bl  from-gray-200 to-blue-200 transition-transform duration-500 ease-in-out  ${
          loadingComplete ? "translate-y-[-100%]" : "translate-y-0"
        }`}
      >
        <div className="flex flex-col  items-center justify-center gap-8 w-full max-w-md">
          <div className="w-[200px] h-[200px]">
            <DotLottieReact
              src="lottie/spincat.lottie"
              loop
              autoplay
            />
          </div>

          <div className="w-1/3 md:w-full  max-w-md bg-gray-200 h-[3.5px] mt-4">
            <div
              className="bg-green-400 h-[3.5px]  rounded-sm transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  )
}
