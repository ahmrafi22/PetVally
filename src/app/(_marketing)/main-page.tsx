import PetVallyLogo from "@/components/_shared/logo";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import GlassButton from "./glass-button";

export default function MainPage() {
  const firstTextRef = useRef(null);
  const secondTextRef = useRef(null);
  const mobileFirstTextRef = useRef(null);
  const mobileSecondTextRef = useRef(null);

  useEffect(() => {
    // Initial loading delay
    const delay = 2.5;

    // Desktop & Tablet animations
    if (firstTextRef.current && secondTextRef.current) {
      // Hide texts initially
      gsap.set(firstTextRef.current, { yPercent: 100 });
      gsap.set(secondTextRef.current, { yPercent: -100 });

      // First text animation (bottom to top)
      gsap.to(firstTextRef.current, {
        yPercent: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
      });

      // Second text animation (top to bottom)
      gsap.to(secondTextRef.current, {
        yPercent: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
      });
    }

    // Mobile animations
    if (mobileFirstTextRef.current && mobileSecondTextRef.current) {
      // Hide texts initially
      gsap.set(mobileFirstTextRef.current, { yPercent: 100 });
      gsap.set(mobileSecondTextRef.current, { yPercent: -100 });

      // First text animation (bottom to top)
      gsap.to(mobileFirstTextRef.current, {
        yPercent: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
      });

      // Second text animation (top to bottom)
      gsap.to(mobileSecondTextRef.current, {
        yPercent: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-200 to-blue-200 flex flex-col items-center">
      {/* Header with logo */}
      <header className="w-full z-10 absolute top-0">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>

      {/* Mobile layout (small screens) */}
      <div className="w-full max-w-7xl px-4 mt-20 sm:mt-24 md:hidden">
        <div className="flex flex-col items-center">
          {/* Only first animation for mobile */}
          <div className="h-40 w-40 mb-8">
            <DotLottieReact
              src="https://lottie.host/17823c23-8b86-4a54-8f93-343bfd16158e/C6I11CljHh.lottie"
              loop
              autoplay
            />
          </div>

          {/* Text container with overflow hidden */}
          <div className="overflow-hidden mb-2">
            <h1
              ref={mobileFirstTextRef}
              className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-center"
            >
              EVERYTHING YOUR
            </h1>
          </div>

          {/* Second text with overflow hidden */}
          <div className="overflow-hidden">
            <h1
              ref={mobileSecondTextRef}
              className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-center"
            >
              furry friends NEEDS.
            </h1>
          </div>
        </div>
      </div>

      {/* Tablet layout */}
      <div className="hidden md:block lg:hidden w-full max-w-7xl px-6 mt-28">
        {/* First line */}
        <div className="flex items-center justify-between mb-8">
          <div className="overflow-hidden w-3/4">
            <h1
              ref={firstTextRef}
              className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-none"
            >
              EVERYTHING YOUR
            </h1>
          </div>
          <div className="h-28 w-28 md:h-32 md:w-32 flex-shrink-0">
            <DotLottieReact
              src="https://lottie.host/17823c23-8b86-4a54-8f93-343bfd16158e/C6I11CljHh.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Second line */}
        <div className="flex items-center justify-between mt-8">
          <div className="h-28 w-28 md:h-32 md:w-32 flex-shrink-0">
            <DotLottieReact
              src="https://lottie.host/45eada81-6907-489f-b8dc-bacefc12b028/KWraxgUdWs.lottie"
              loop
              autoplay
            />
          </div>
          <div className="overflow-hidden w-3/4">
            <h1
              ref={secondTextRef}
              className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-none text-right"
            >
              furry friends NEEDS.
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop layout - same structure with animations */}
      <div className="hidden lg:block w-full max-w-7xl px-4 mt-32">
        {/* First line with space on right side */}
        <div className="flex items-center mb-4">
          <div className="overflow-hidden w-4/5">
            <h1
              ref={firstTextRef}
              className="text-[5rem] xl:text-[7rem] 2xl:text-[9rem] font-extrabold uppercase tracking-tight leading-none"
            >
              EVERYTHING YOUR
            </h1>
          </div>
          <div className="h-32 w-32 xl:h-40 xl:w-40 2xl:h-48 2xl:w-48 flex-shrink-0">
            <DotLottieReact
              src="https://lottie.host/17823c23-8b86-4a54-8f93-343bfd16158e/C6I11CljHh.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        {/* Second line with space on left side */}
        <div className="flex items-center justify-end">
          <div className="h-32 w-32 xl:h-40 xl:w-40 2xl:h-48 2xl:w-48 flex-shrink-0">
            <DotLottieReact
              src="https://lottie.host/45eada81-6907-489f-b8dc-bacefc12b028/KWraxgUdWs.lottie"
              loop
              autoplay
            />
          </div>
          <div className="overflow-hidden w-4/5">
            <h1
              ref={secondTextRef}
              className="text-[4rem] xl:text-[6rem] 2xl:text-[8rem] font-extrabold uppercase tracking-tight leading-none text-right"
            >
              furry friends NEEDS.
            </h1>
          </div>
        </div>
      </div>

      {/* Centered Glass Button - added below all content */}
      <div className="w-full flex justify-center mt-16 md:mt-20 lg:mt-24">
        <GlassButton href="/userlogin" text="Signup " />
      </div>
    </div>
  );
}