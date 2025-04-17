"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./(_marketing)/loading";
import MainPage from "./(_marketing)/main-page";
import Second from "./(_marketing)/second-page";
import { ReactLenis, useLenis } from "lenis/react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const lenis = useLenis(({ scroll }) => {});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ReactLenis root>
      <main className="min-h-screen">
        {isLoading && (<LoadingScreen />)}
        <div>
          <MainPage />
          <Second />
        </div>
      </main>
    </ReactLenis>
  );
}
