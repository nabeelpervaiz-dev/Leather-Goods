
import { useEffect, useState } from "react";

function Loader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-[9999] flex items-center justify-center bg-black transition-transform duration-[1200ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        open ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Logo SVG */}
      <svg
        viewBox="0 0 300 340"
        className="w-[280px] sm:w-[340px] md:w-[400px]"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Monogram */}
        <path d="M75 30 H265 L240 95 H195 L207 62 H112 L85 160 H120 L145 90 H190 L165 160 H225 L205 205 H150 L140 230 H220 L245 130 H205 L220 100 H285 L245 260 H80 L100 195 H30 Z" />

        {/* Brand name */}
        <text
          x="150"
          y="300"
          textAnchor="middle"
          fontSize="30"
          fontWeight="800"
          letterSpacing="2"
        >
          CREATING
        </text>

        <text
          x="150"
          y="330"
          textAnchor="middle"
          fontSize="18"
          fontWeight="400"
          letterSpacing="5"
        >
          LEATHER GOODS
        </text>
      </svg>
    </div>
  );
}

export default Loader;
