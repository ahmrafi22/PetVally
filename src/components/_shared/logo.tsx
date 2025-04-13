import React from "react";
import { Satisfy, Lobster } from "next/font/google";
import { PawPrint } from "lucide-react";

// Initialize the font
const pawPaint = Satisfy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
const pawPaint2 = Lobster({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const PetVallyLogo = () => {
  return (
    <div className="flex items-center gap-2 justify-center">
      <PawPrint className="w-8 h-8  text-pink-600 font-bold" />
      <h1
        className={`text-3xl md:text-4xl font-bold text-black ${pawPaint.className} flex items-center`}
      >
        Pet&nbsp;
        <span className={`${pawPaint2.className}`}>Vally</span>
      </h1>
    </div>
  );
};

export default PetVallyLogo;
