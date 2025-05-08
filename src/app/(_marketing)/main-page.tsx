import PetVallyLogo from "@/components/_shared/logo";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRef } from "react";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import JoinButton from "./join-button";
import { Lobster } from "next/font/google";
import { cn } from "@/lib/utils";

const text = Lobster({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

gsap.registerPlugin(useGSAP);

export default function MainPage() {
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const secondTextRef = useRef<HTMLHeadingElement>(null);
  const mobileFirstTextRef = useRef<HTMLHeadingElement>(null);
  const mobileSecondTextRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const delay = 2.5;
    const animationConfig = {
      duration: 1,
      delay: delay,
      ease: "circ.out",
    };

    // Desktop animations
    if (firstTextRef.current && secondTextRef.current) {
      gsap.set(firstTextRef.current, { yPercent: 100 });
      gsap.set(secondTextRef.current, { yPercent: -100 });

      gsap.to(firstTextRef.current, {
        yPercent: 0,
        ...animationConfig,
      });

      gsap.to(secondTextRef.current, {
        yPercent: 0,
        ...animationConfig,
      });
    }

    // Mobile/Tablet animations
    if (mobileFirstTextRef.current && mobileSecondTextRef.current) {
      gsap.set(mobileFirstTextRef.current, { yPercent: 100 });
      gsap.set(mobileSecondTextRef.current, { yPercent: -100 });

      gsap.to(mobileFirstTextRef.current, {
        yPercent: 0,
        ...animationConfig,
      });

      gsap.to(mobileSecondTextRef.current, {
        yPercent: 0,
        ...animationConfig,
      });
    }
  }, []);

  return (
    <div className="min-h-screen h-full overflow-x-hidden relative flex flex-col items-center">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-yellow-200 to-blue-300"></div>
      
      {/* Shadow gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.2)] via-[65%] to-white"></div>

      {/* Header with logo */}
      <header className="w-full z-10 relative py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>

      {/* Main content container with flex spacing */}
      <div className="flex flex-col items-center justify-between w-full flex-grow z-10 px-4">
        {/* Mobile and Tablet layout */}
        <div className="max-w-7xl mt-8 lg:hidden z-10 flex-grow flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 mb-6 sm:h-40 sm:w-40 md:h-60 md:w-60">
              <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
            </div>

            <div className="overflow-hidden mb-2">
              <h1
                ref={mobileFirstTextRef}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wide text-center"
              >
                EVERYTHING YOUR
              </h1>
            </div>

            <div className="overflow-hidden">
              <h1
                ref={mobileSecondTextRef}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-center"
              >
                <span className={cn("italic text-purple-600 font-extrabold text-[2.5rem] sm:text-[3rem]", text.className)}>Furry</span> FRIENDS <br /> NEEDS.
              </h1>
            </div>
          </div>

          {/* Button for mobile - positioned with margin to ensure visibility */}
          <div className="mt-12 mb-16 hover:scale-110 transition-transform duration-300 z-10">
            <JoinButton href="/userlogin" text=" JOIN NOW " />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block 2xl:max-w-7xl lg:max-w-4xl md:max-w-4xl px-4 mt-16 z-10 flex-grow">
          <div className="flex items-center mb-4">
            <div className="overflow-hidden w-4/5">
              <h1
                ref={firstTextRef}
                className="text-[6rem] xl:text-[6.5rem] 2xl:text-[8.5rem] font-extrabold uppercase tracking-tight leading-none"
              >
                EVERYTHING YOUR
              </h1>
            </div>
            <div className="h-50 w-50 xl:h-50 xl:w-50 2xl:h-65 2xl:w-65">
              <DotLottieReact src="/lottie/dog1.lottie" loop autoplay />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="h-60 w-60 xl:h-50 xl:w-50 2xl:h-55 2xl:w-55 flex-shrink-0">
              <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
            </div>
            <div className="overflow-hidden w-4/5">
              <h1
                ref={secondTextRef}
                className="text-[5.5rem] xl:text-[5.4rem] 2xl:text-[7.5rem] font-extrabold tracking-tight leading-none text-right"
              >
                <span className={cn("italic text-purple-600 font-extrabold text-[6rem] xl:text-[6.5rem] 2xl:text-[9.5rem]", text.className)}>Furry</span> FRIENDS <br /> NEEDS.
              </h1>
            </div>
          </div>

          {/* Button for desktop */}
          <div className="flex justify-center hover:scale-110 transition-transform duration-300 mt-16 mb-16 z-10">
            <JoinButton href="/userlogin" text=" JOIN NOW " />
          </div>
        </div>
      </div>
    </div>
  );
}