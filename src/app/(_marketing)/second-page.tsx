"use client";
import { useEffect, useRef, useCallback, useMemo } from "react";
import Lenis from "lenis";
import CareJoinButton from "./_components/care-join-button";
import { Unbounded } from "next/font/google";
import { cn } from "@/lib/utils";
import TxtEffct from "./_components/text-effectt";

const text = Unbounded({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
});

interface TrailImage {
  element: HTMLImageElement;
  rotation: number;
  removeTime: number;
}

interface TrailConfig {
  imageCount: number;
  imageLifespan: number;
  removalDelay: number;
  mouseThreshold: number;
  scrollThreshold: number;
  idleCursorInterval: number;
  inDuration: number;
  outDuration: number;
  inEasing: string;
  outEasing: string;
}

export default function SecondPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<TrailImage[]>([]);

  // static configuration to prevent unnecessary re-renders
  const config = useMemo<TrailConfig>(
    () => ({
      imageCount: 22,
      imageLifespan: 750,
      removalDelay: 50,
      mouseThreshold: 100,
      scrollThreshold: 50,
      idleCursorInterval: 300,
      inDuration: 750,
      outDuration: 1000,
      inEasing: "cubic-bezier(.07, .5, .5,1)",
      outEasing: "cubic-bezier(.87, 0, .13,1)",
    }),
    []
  );

  // Memoize images array to prevent re-creation
  const images = useMemo<string[]>(
    () => Array.from({ length: 22 }, (_, i) => `/assets/${i + 1}.jpeg`),
    []
  );

  // Consolidate refs -> a single mutable object
  const stateRef = useRef({
    mousePos: {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      isMoving: false,
      isInContainer: false,
    },
    timing: {
      lastRemovalTime: 0,
      lastSteadyImageTime: 0,
      lastScrollTime: 0,
      isScrolling: false,
      scrollTicking: false,
    },
  });


  const isInContainer = useCallback((x: number, y: number): boolean => {
    if (!containerRef.current) return false;
    const rect = containerRef.current.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }, []);

  const hasMovedEnough = useCallback((): boolean => {
    const { x, y, lastX, lastY } = stateRef.current.mousePos;
    const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
    return distance > config.mouseThreshold;
  }, [config]);

  const createImage = useCallback(() => {
    if (!containerRef.current) return;

    const img = document.createElement("img");
    img.className =
      "absolute w-[200px] h-[200px] z-50 object-cover rounded-sm pointer-events-none will-change-transform";

    const randomIndex = Math.floor(Math.random() * images.length);
    const rotation = (Math.random() - 0.5) * 50;
    img.src = images[randomIndex];

    const rect = containerRef.current.getBoundingClientRect();
    const { x, y } = stateRef.current.mousePos;
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    img.style.left = `${relativeX}px`;
    img.style.top = `${relativeY}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
    img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

    containerRef.current.appendChild(img);

    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
    }, 10);

    trailRef.current.push({
      element: img,
      rotation,
      removeTime: Date.now() + config.imageLifespan,
    });
  }, [images, config]);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    const { mousePos, timing } = stateRef.current;

    const createTrailImage = () => {
      const now = Date.now();
      if (!mousePos.isInContainer) return;

      if (mousePos.isMoving && hasMovedEnough()) {
        mousePos.lastX = mousePos.x;
        mousePos.lastY = mousePos.y;
        createImage();
        return;
      }

      if (
        !mousePos.isMoving &&
        now - timing.lastSteadyImageTime >= config.idleCursorInterval
      ) {
        timing.lastSteadyImageTime = now;
        createImage();
      }
    };

    const createScrollTrailImage = () => {
      if (!mousePos.isInContainer) return;

      mousePos.lastX +=
        (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
      mousePos.lastY +=
        (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);

      createImage();

      mousePos.lastX = mousePos.x;
      mousePos.lastY = mousePos.y;
    };

    const removeOldImages = () => {
      const now = Date.now();
      if (
        now - timing.lastRemovalTime < config.removalDelay ||
        trailRef.current.length === 0
      )
        return;

      const oldestImage = trailRef.current[0];

      if (now >= oldestImage.removeTime) {
        const imgToRemove = trailRef.current.shift()!;

        imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
        imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

        timing.lastRemovalTime = now;

        setTimeout(() => {
          if (imgToRemove.element.parentNode) {
            imgToRemove.element.parentNode.removeChild(imgToRemove.element);
          }
        }, config.outDuration);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      mousePos.isInContainer = isInContainer(e.clientX, e.clientY);

      if (mousePos.isInContainer) {
        mousePos.isMoving = true;
        clearTimeout((window as any).moveTimeout);
        (window as any).moveTimeout = setTimeout(() => {
          mousePos.isMoving = false;
        }, 100);
      }
    };

    const handleScroll = () => {
      mousePos.isInContainer = isInContainer(mousePos.x, mousePos.y);

      if (mousePos.isInContainer) {
        mousePos.isMoving = true;
        mousePos.lastX += (Math.random() - 0.5) * 10;

        clearTimeout((window as any).moveTimeout);
        (window as any).scrollTimeout = setTimeout(() => {
          mousePos.isMoving = false;
        }, 100);
      }

      const now = Date.now();
      timing.isScrolling = true;

      if (now - timing.lastScrollTime < config.scrollThreshold) return;

      timing.lastScrollTime = now;
      if (!timing.scrollTicking) {
        timing.scrollTicking = true;
        requestAnimationFrame(() => {
          createScrollTrailImage();
          timing.isScrolling = false;
          timing.scrollTicking = false;
        });
      }
    };

    const animate = () => {
      createTrailImage();
      removeOldImages();
      requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      lenis.destroy();
    };
  }, [config, createImage, hasMovedEnough, isInContainer]);
  
  return (
    <div className="">
      <section
        ref={containerRef}
        className=" w-full  md:h-[90vh] lg:h-[85vh] h-[55vh]  flex flex-col justify-center items-center relative"
      >
        {/* Base gradient background - purple to indigo gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-200 to-orange-200"></div>
        
        {/* Shadow gradient overlay - white at top fading to transparent */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-[rgba(255,255,255,0.2)] via-[35%] to-transparent"></div>
      <TxtEffct animateOnScroll={true} delay={0.2}>
        <h1 className={cn("text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 px-4  z-99 max-w-5xl relative text-white mix-blend-difference", text.className)}>
          Our care givers help Thousands of pet owners everyday
        </h1>
        </TxtEffct>

        <div className="z-99 relative">
          <p className="uppercase text-center font-mono font-semibold select-none text-blue-400  mb-4">
            (Join our Network of help)
          </p>
          <CareJoinButton />
        </div>
      </section>
    </div>
  );
}