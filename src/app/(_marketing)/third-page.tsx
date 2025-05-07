"use client"

import { WobbleCard } from "@/components/ui/wobble-card"
import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import {
  ShoppingBag,
  Heart,
  Search,
  Star,
  Truck,
  PawPrint,
  Gift,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Stethoscope,
  Bot,
} from "lucide-react"
import { Unbounded } from "next/font/google";
import TxtEffct from "./text-effectt";

const text = Unbounded({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
});

export default function ThirdPage() {
  return (
    <div className={cn("min-h-screen w-full p-4 md:p-6 overflow-x-hidden overflow-y-auto relative border-b-2  border-black", text.className)}>
      {/* Base gradient background */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 bg-gradient-to-b from-orange-200"
      ></div>
      
      {/* Shadow gradient overlay */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.2)] via-[65%] to-white"
      ></div>
      
      {/* Content positioned above the gradient */}
      <div className="relative z-10">
        <header className="max-w-7xl mx-auto text-center mb-4">
        <TxtEffct animateOnScroll={true} delay={0.2}>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto mb-12 ">
            Your one-stop platform for all pet needs - from shopping to adoption, care services to veterinary assistance
          </p>
          </TxtEffct>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 pb-8">
          {/* Shopping & Pet Adoption - Large Card */}
          <WobbleCard containerClassName="md:col-span-2 bg-pink-400">
          <TxtEffct animateOnScroll={true} delay={0.2}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">Shopping & Pet Adoption</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-grow mt-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <PawPrint className="h-4 w-4 text-gray-800" />
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">Pet Store</h3>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm mb-2">
                    Browse and purchase pet food, medicine, toys, and even adopt new pets.
                  </p>
                  <div className="relative hidden md:block flex-grow min-h-[130px] rounded-lg overflow-hidden">
                    <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-800" />
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">Reviews & Ratings</h3>
                    </div>
                    <p className="text-gray-700 text-xs md:text-sm mt-1">
                      Share your experience with products and help other pet owners.
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-800" />
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">Order Tracking</h3>
                    </div>
                    <p className="text-gray-700 text-xs md:text-sm mt-1">Track your orders in real-time and manage your purchases.</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-800" />
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">Pet Matching</h3>
                    </div>
                    <p className="text-gray-700 text-xs md:text-sm mt-1">
                      Fill a lifestyle form to get personalized pet recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </TxtEffct>
          </WobbleCard>

          {/* Pet Donations & Missing Pets */}
          <WobbleCard containerClassName="bg-blue-400">
          <TxtEffct animateOnScroll={true} delay={0.4}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Gift className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Pet Donations & Missing Pets</h2>
              </div>
              <div className="relative hidden md:block flex-grow mb-3 rounded-lg overflow-hidden h-[140px]">
                <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gray-800" />
                    <p className="text-gray-700 text-xs md:text-sm">Post pets for donation and schedule visits</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-800" />
                    <p className="text-gray-700 text-xs md:text-sm">Report and find missing pets based on location</p>
                  </div>
                </div>
              </div>
            </div>
            </TxtEffct>
          </WobbleCard>

          {/* Veterinary Services */}
          <WobbleCard containerClassName="bg-teal-500">
          <TxtEffct animateOnScroll={true} delay={0.4}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Veterinary Services</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col items-center">
                  <Bot className="h-6 w-6 md:h-8 md:w-8 text-gray-800 mb-1" />
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center">AI Vet Assistant</h3>
                  <p className="text-gray-700 text-center text-xs mt-1">Get advice based on text and image inputs</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col items-center">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-800 mb-1" />
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center">Vet Directory</h3>
                  <p className="text-gray-700 text-center text-xs mt-1">Find nearby vets and schedule appointments</p>
                </div>
              </div>
              <div className="relative hidden md:block flex-grow rounded-lg overflow-hidden min-h-[100px]">
                <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
              </div>
            </div>
            </TxtEffct>
          </WobbleCard>

          {/* Pet Care Jobs & Companion Services - Large Card */}
          <WobbleCard containerClassName="md:col-span-2 bg-purple-400">
          <TxtEffct animateOnScroll={true} delay={0.5}>
            <div className="flex flex-col h-full py-2 md:py-3">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">Pet Care Jobs & Companion Services</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 flex-grow">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-800" />
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">Job Listings</h3>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm mb-2">
                    Post jobs for pet boarding, sitting, and walking with pricing details.
                  </p>
                  <div className="relative hidden md:block flex-grow min-h-[90px] rounded-lg overflow-hidden">
                    <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-800" />
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">Pet Companions</h3>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm mb-2">
                    Registered caregivers can apply for jobs and earn money from completed tasks.
                  </p>
                  <div className="relative hidden md:block flex-grow min-h-[90px] rounded-lg overflow-hidden">
                    <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-800" />
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">Calendar View</h3>
                  </div>
                  <p className="text-gray-700 text-xs md:text-sm mb-2">
                    Pet companions can view their assigned tasks with dates, times, and pet details.
                  </p>
                  <div className="relative hidden md:block flex-grow min-h-[90px] rounded-lg overflow-hidden">
                    <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                  </div>
                </div>
              </div>
            </div>
            </TxtEffct>
          </WobbleCard>
        </div>
      </div>
    </div>
  )
}