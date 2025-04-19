import PetVallyLogo from "@/components/_shared/logo";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRef } from "react";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import GlassButton from "./glass-button";

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-red-200 to-blue-200 flex flex-col items-center">
      <header className="w-full z-10 absolute top-0">
        <div className="max-w-7xl mx-auto py-4  sm:px-6 lg:px-8 flex justify-center">
          <PetVallyLogo />
        </div>
      </header>

      {/* Mobile and Tablet layout  */}
      <div className="max-w-7xl px-4 mt-56 sm:mt-64 lg:hidden">
        <div className="flex flex-col items-center">
          <div className="h-40 w-40 mb-8 sm:h-60 sm:w-60 ">
            <DotLottieReact src="/lottie/cat1.lottie" loop autoplay />
          </div>

          <div className="overflow-hidden mb-2">
            <h1
              ref={mobileFirstTextRef}
              className="text-4xl sm:text-5xl md:text-5xl font-extrabold uppercase tracking-wide  text-center"
            >
              EVERYTHING YOUR
            </h1>
          </div>

          <div className="overflow-hidden">
            <h1
              ref={mobileSecondTextRef}
              className="text-3xl sm:text-4xl md:text-4xl font-extrabold uppercase tracking-wide text-center"
            >
              furry friends NEEDS.
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden  lg:block 2xl:max-w-7xl  lg:max-w-4xl md:max-w-4xl px-4 mt-32 ">
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
              className="text-[5.5rem] xl:text-[5.4rem] 2xl:text-[7.5rem] font-extrabold uppercase tracking-tight leading-none text-right"
            >
              furry friends NEEDS.
            </h1>
          </div>
        </div>
      </div>

      <div className="flex justify-center hover:scale-110 transition-transform duration-300 mt-16 ">
        <GlassButton href="/userlogin" text=" JOIN NOW " />
      </div>
    </div>
  );
}
