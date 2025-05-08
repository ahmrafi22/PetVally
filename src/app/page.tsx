"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./(_marketing)/loading";
import MainPage from "./(_marketing)/main-page";
import SecondPage from "./(_marketing)/second-page";
import ThirdPage from "./(_marketing)/third-page";
import Footer from "./(_marketing)/Footer";
import { ReactLenis, useLenis } from "lenis/react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const lenis = useLenis(() => {});

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalOverflow = document.body.style.overflow;

      if (isLoading) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, 0);
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLoading]);

  return (
    <ReactLenis root options={{ smoothWheel: !isLoading }}>
      <div className="min-h-[100vh] bg-white">
        {isLoading && <LoadingScreen />}
        <MainPage />
        <SecondPage />
        <ThirdPage />
      </div>
      <Footer />
    </ReactLenis>
  );
}

