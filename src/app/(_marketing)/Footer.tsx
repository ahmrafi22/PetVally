"use client";

import { PawPrint } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lobster, Satisfy } from "next/font/google";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

const text = Satisfy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const text2 = Lobster({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Footer = () => {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;

    const split = new SplitText(headingRef.current, {
      type: "chars",
      charsClass: "char",
    });

    gsap.set(split.chars, { opacity: 0, y: 50 });

    ScrollTrigger.create({
      trigger: headingRef.current,
      start: "top 88%",
      // markers:true,
      onEnter: () => {
        gsap.to(split.chars, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.04,
          ease: "power2.out",
        });
      },
    });

    return () => {
      split.revert();
    };
  }, []);

  const leftLinks = [
    { name: "Home", url: "/" },
    { name: "Bracu", url: "https://www.bracu.ac.bd" },
  ];

  const rightLinks = [
    { name: "Github     ", url: "https://github.com/ahmrafi22/PetVally"},
    { name: "Admin", url: "/admin" },
  ];

  interface LinkProps {
    name: string;
    url: string;
  }

  const LinkWithEffect: React.FC<LinkProps> = ({ name, url }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (url === "/") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (url.startsWith("http")) {
        window.open(url, "_blank");
      } else {
        router.push(url);
      }
    };

    return (
      <li
        className="relative cursor-pointer sm:h-8 w-fit hover:w-fit h-5 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <a className="block relative">
          <span
            className={`block whitespace-nowrap transition-transform duration-300 ease-in-out ${
              isHovered ? "-translate-y-full" : "translate-y-0"
            }`}
          >
            {name}
          </span>
          <span
            className={`absolute top-0 left-0 whitespace-nowrap text-[#ff7a66] font-medium transition-transform duration-300 ease-in-out ${
              isHovered ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {name}
          </span>
        </a>
      </li>
    );
  };

  return (
    <footer className="w-full h-[55vh] bg-white flex justify-center items-center">
      <div className="relative  w-full h-full flex justify-end px-12 text-right items-start py-12 text-[#ff5941]">
        <div className="flex flex-row space-x-12 sm:space-x-16 md:space-x-24 text-sm sm:text-lg md:text-xl">
          <ul className="space-y-2">
            {leftLinks.map((link, index) => (
              <LinkWithEffect key={index} name={link.name} url={link.url} />
            ))}
          </ul>
          <ul className="space-y-2 ">
            {rightLinks.map((link, index) => (
              <LinkWithEffect key={index} name={link.name} url={link.url} />
            ))}
          </ul>
        </div>

        {/*Pet Vally Title */}
        <h2
          ref={headingRef}
          className={cn(
            text.className,
            "absolute bottom-0 left-0 md:translate-y-10 translate-y-2 md:text-[160px] lg:text-[256px] text-[80px] text-[#ff5941] flex items-center"
          )}
        >
          <PawPrint className="inline-block w-15 h-15 md:w-30 md:h-30 lg:w-45 lg:h-45 fill-current mr-0" />
          Pet&nbsp;<span className={text2.className}>Vally</span>
        </h2>
      </div>
    </footer>
  );
};

export default Footer;