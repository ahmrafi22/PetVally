import { HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function CareJoinButton() {
  const [isRippling, setIsRippling] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleClick = (e: any) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    router.push("/caregiverlogin");

    setRipplePosition({ x, y });
    setIsRippling(true);

    setTimeout(() => {
      setIsRippling(false);
    }, 700);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="relative group cursor-pointer 
                px-5 py-2 text-sm sm:px-8 sm:py-4 sm:text-lg
                font-bold uppercase tracking-wider text-gray-800 
                backdrop-blur-sm bg-white/25 border border-white/20 
                rounded-lg sm:rounded-xl
                shadow-md sm:shadow-lg transition-all duration-500 overflow-hidden
                transform perspective-800 
                hover:scale-105 hover:rotate-1 hover:-translate-y-1 sm:hover:-translate-y-2
                hover:bg-gradient-to-r hover:from-green-400 hover:to-green-500
                hover:shadow-lg sm:hover:shadow-xl hover:shadow-white-500/30
                focus:outline-none active:scale-95"
    >
      {/* Shimmer effect */}
      <span
        className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-[-20deg] z-10
                       transition-all duration-700 ease-out
                       group-hover:left-[100%]"
      ></span>

      {/* Ripple effect */}
      {isRippling && (
        <span
          className="absolute bg-white/40 rounded-full opacity-0 animate-ripple"
          style={{
            left: ripplePosition.x + "px",
            top: ripplePosition.y + "px",
            transform: "translate(-50%, -50%)",
          }}
        ></span>
      )}

      {/* Text content */}
      <span className="relative z-20 transition-transform duration-500 transform hover:scale-110 group-hover:text-white">
        Join as a Caregiver
        <HeartHandshake className="inline-block w-5 h-4 sm:w-8 sm:h-7 fill-white group-hover:text-black ml-1 sm:ml-2" />
      </span>
    </button>
  );
}