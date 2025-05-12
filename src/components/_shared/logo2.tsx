import React from "react";
import { Satisfy, Lobster } from "next/font/google";
import { PawPrint } from "lucide-react";

// Initialize the font
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

const PetVallyLogo2 = () => {
  return (
    <div className="flex items-center gap-2 justify-center">
       <PawPrint  className="w-10 h-9.5 text-green-500 fill-current font-bold" />
      <h1
        className={`text-3xl md:text-4xl font-bold text-black ${text.className} flex items-center`}
      >
        Pet&nbsp;
        <span className={`${text2.className}`}>Vally</span>
      </h1>
    </div>
  );
};

export default PetVallyLogo2;
