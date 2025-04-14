import { MoveUpRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ExploreButton({ text = "Explore All", href = "#" }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} passHref>
      <button
        className="flex cursor-pointer items-center gap-3 bg-purple-700 text-white font-semibold py-3 px-5 pl-5 rounded-full transition-colors duration-300 hover:bg-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>{text}</span>
        <div className="relative w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <div
            className={`transition-transform duration-300 ease-in-out ${
              isHovered ? "translate-x-[150%] -translate-y-[150%]" : "translate-x-0 translate-y-0"
            }`}
          >
            <MoveUpRight size={14} className={`text-purple-700 ${isHovered ? "text-black" : ""}`} />
          </div>
          <div
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-300 ease-in-out delay-100 ${
              isHovered ? "translate-x-0 translate-y-0" : "-translate-x-[150%] translate-y-[150%]"
            }`}
          >
            <MoveUpRight size={14} className="text-black" />
          </div>
        </div>
      </button>
    </Link>
  );
}