"use client"

import { WobbleCard } from "@/components/ui/wobble-card"
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

export default function Home() {
  return (
    <div className="h-screen w-full bg-gradient-to-tr  from-red-200 to-blue-200 p-6 overflow-hidden">
      <header className="max-w-7xl mx-auto text-center mb-4">
        <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto">
          Your one-stop platform for all pet needs - from shopping to adoption, care services to veterinary assistance
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 h-[calc(100vh-100px)]">
        {/* Shopping & Pet Adoption - Large Card */}
        <WobbleCard containerClassName="md:col-span-2  bg-pink-600  ">
          <div className="flex flex-col h-full ">
            <div className="flex items-center gap-3 ">
              <ShoppingBag className="h-6 w-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Shopping & Pet Adoption</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <PawPrint className="h-4 w-4 text-white" />
                  <h3 className="text-base font-semibold text-white">Pet Store</h3>
                </div>
                <p className="text-white/90 text-sm mb-2">
                  Browse and purchase pet food, medicine, toys, and even adopt new pets.
                </p>
                <div className="relative flex-grow min-h-[130px] rounded-lg overflow-hidden">
                  <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-white" />
                    <h3 className="text-base font-semibold text-white">Reviews & Ratings</h3>
                  </div>
                  <p className="text-white/90 text-sm mt-1">
                    Share your experience with products and help other pet owners.
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-white" />
                    <h3 className="text-base font-semibold text-white">Order Tracking</h3>
                  </div>
                  <p className="text-white/90 text-sm mt-1">Track your orders in real-time and manage your purchases.</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-white" />
                    <h3 className="text-base font-semibold text-white">Pet Matching</h3>
                  </div>
                  <p className="text-white/90 text-sm mt-1">
                    Fill a lifestyle form to get personalized pet recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </WobbleCard>

        {/* Pet Donations & Missing Pets */}
        <WobbleCard containerClassName="bg-blue-500">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Pet Donations & Missing Pets</h2>
            </div>
            <div className="relative flex-grow mb-3 rounded-lg overflow-hidden h-[140px]">
              <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
            </div>
            <div className="space-y-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-white" />
                  <p className="text-white/90 text-sm">Post pets for donation and schedule visits</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white" />
                  <p className="text-white/90 text-sm">Report and find missing pets based on location</p>
                </div>
              </div>
            </div>
          </div>
        </WobbleCard>

        {/* Veterinary Services */}
        <WobbleCard containerClassName="bg-teal-500">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <Stethoscope className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Veterinary Services</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                <Bot className="h-8 w-8 text-white mb-1" />
                <h3 className="text-base font-semibold text-white text-center">AI Vet Assistant</h3>
                <p className="text-white/90 text-center text-xs mt-1">Get advice based on text and image inputs</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center">
                <Users className="h-8 w-8 text-white mb-1" />
                <h3 className="text-base font-semibold text-white text-center">Vet Directory</h3>
                <p className="text-white/90 text-center text-xs mt-1">Find nearby vets and schedule appointments</p>
              </div>
            </div>
            <div className="relative flex-grow rounded-lg overflow-hidden min-h-[100px]">
              <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
            </div>
          </div>
        </WobbleCard>

        {/* Pet Care Jobs & Companion Services - Large Card */}
        <WobbleCard containerClassName="md:col-span-2 bg-purple-500">
          <div className="flex flex-col h-full py-3">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Pet Care Jobs & Companion Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-white" />
                  <h3 className="text-base font-semibold text-white">Job Listings</h3>
                </div>
                <p className="text-white/90 text-sm mb-2">
                  Post jobs for pet boarding, sitting, and walking with pricing details.
                </p>
                <div className="relative flex-grow min-h-[90px] rounded-lg overflow-hidden">
                  <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-white" />
                  <h3 className="text-base font-semibold text-white">Pet Companions</h3>
                </div>
                <p className="text-white/90 text-sm mb-2">
                  Registered caregivers can apply for jobs and earn money from completed tasks.
                </p>
                <div className="relative flex-grow min-h-[90px] rounded-lg overflow-hidden">
                  <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-white" />
                  <h3 className="text-base font-semibold text-white">Calendar View</h3>
                </div>
                <p className="text-white/90 text-sm mb-2">
                  Pet companions can view their assigned tasks with dates, times, and pet details.
                </p>
                <div className="relative flex-grow min-h-[90px] rounded-lg overflow-hidden">
                  <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
                </div>
              </div>
            </div>
          </div>
        </WobbleCard>
      </div>
    </div>
  )
}