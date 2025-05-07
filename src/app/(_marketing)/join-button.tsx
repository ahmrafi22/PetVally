import { useState } from 'react';
import { useRouter } from "next/navigation";
import { ArrowRight, PawPrint } from 'lucide-react';
import { Unbounded } from 'next/font/google';
import { cn } from '@/lib/utils';

const unboundedFont = Unbounded({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
});

const JoinButton = ({ href = "/", text = "Click Me" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative cursor-pointer flex items-center gap-4 px-9 py-4 text-base font-semibold text-black rounded-full border-4 border-transparent bg-transparent shadow-[0_0_0_2px_#ec4899] hover:shadow-[0_0_0_12px_transparent] hover:text-gray-800 transition-all duration-700 ease-in-out overflow-hidden"
        )}
      >
        <ArrowRight strokeWidth={3}
          className={`absolute z-10 w-6 h-6 font-bold   transition-all duration-700 ease-in-out ${
            isHovered ? 'right-0 opacity-0 translate-x-8' : 'right-4 opacity-100'
          }`}
        />

        <PawPrint
          className={`absolute z-10 w-6 h-6 fill-black transition-all duration-700 ease-in-out ${
            isHovered ? 'left-4 opacity-100' : 'left-0 -translate-x-8 opacity-0'
          }`}
        />

        <span
          className={cn(
            `relative z-10 transition-all font-bold duration-700 ease-in-out ${
              isHovered ? 'translate-x-3' : '-translate-x-3'
            }`,
            unboundedFont.className
          )}
        >
          {text}
        </span>

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-pink-500 to bg-lime-100 rounded-full transition-all duration-700 ease-in-out ${
            isHovered ? 'w-64 h-64 opacity-100' : 'w-5 h-5 opacity-0'
          }`}
        ></div>
      </button>
    </div>
  );
};

export default JoinButton;