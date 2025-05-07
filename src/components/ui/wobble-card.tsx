"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Initialize GSAP context
  useEffect(() => {
    const containerEl = containerRef.current;
    const contentEl = contentRef.current;
    
    // Reset transformations when component mounts
    gsap.set(containerEl, { 
      x: 0, 
      y: 0, 
      scale: 1 
    });
    
    gsap.set(contentEl, { 
      x: 0, 
      y: 0, 
      scale: 1 
    });
    
    return () => {
      // Clean up animations when component unmounts
      gsap.killTweensOf(containerEl);
      gsap.killTweensOf(contentEl);
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!isHovering) return;
    
    const containerEl = containerRef.current;
    const contentEl = contentRef.current;
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    
    // Animate container
    gsap.to(containerEl, {
      x: x,
      y: y,
      duration: 0.1,
      ease: "power1.out",
      overwrite: true
    });
    
    // Animate content in opposite direction
    gsap.to(contentEl, {
      x: -x,
      y: -y,
      scale: 1.03,
      duration: 0.1,
      ease: "power1.out",
      overwrite: true
    });
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    
    const containerEl = containerRef.current;
    const contentEl = contentRef.current;
    
    // Reset position with animation when mouse leaves
    gsap.to(containerEl, {
      x: 0,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    
    gsap.to(contentEl, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "mx-auto w-full bg-indigo-800 relative rounded-2xl overflow-hidden",
        containerClassName
      )}
    >
      <div
        className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:mx-0 sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)",
        }}
      >
        <div
          ref={contentRef}
          className={cn("h-full px-4 py-10 sm:px-10", className)}
        >
          <Noise />
          {children}
        </div>
      </div>
    </section>
  );
};

const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
      style={{
        backgroundImage: "url(/noise.webp)",
        backgroundSize: "30%",
      }}
    ></div>
  );
};