import React from "react";
import { Satisfy } from "next/font/google";
import { PawPrint } from "lucide-react";

// Initialize the font
const pawPaint = Satisfy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const PetVallyLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <PawPrint className="w-8 h-8 text-black" />
      <h1
        className={`text-3xl md:text-4xl font-bold text-black ${pawPaint.className} flex items-center`}
      >
        PetVally
      </h1>
    </div>
  );
};

export default PetVallyLogo;