
import { useEffect, useState } from 'react';

const LOADER_DURATION_MS = 3000;
const SLIDE_UP_DURATION_MS = 650;

export default function Loader() {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  useEffect(() => {
    const displayTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, LOADER_DURATION_MS);

    const unmountTimer = window.setTimeout(() => {
      setIsUnmounted(true);
    }, LOADER_DURATION_MS + SLIDE_UP_DURATION_MS + 50);

    return () => {
      window.clearTimeout(displayTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Creating Leather Goods"
      aria-hidden={isExiting}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && isExiting) {
          setIsUnmounted(true);
        }
      }}
      style={{
        transform: isExiting
          ? 'translate3d(0, -100%, 0)'
          : 'translate3d(0, 0, 0)',
        transition: `transform ${SLIDE_UP_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
      className={`fixed inset-0 z-[100] bg-[#17130F] text-white flex items-center justify-center px-6 select-none will-change-transform ${
        isExiting ? 'pointer-events-none' : ''
      }`}
    >
      {/* Brand SVG Logo */}
      <svg
        viewBox="0 0 300 340"
        className="w-[280px] sm:w-[340px] md:w-[400px]"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Creating Leather Goods logo"
      >
        {/* Monogram */}
        <path d="M75 30 H265 L240 95 H195 L207 62 H112 L85 160 H120 L145 90 H190 L165 160 H225 L205 205 H150 L140 230 H220 L245 130 H205 L220 100 H285 L245 260 H80 L100 195 H30 Z" />

        {/* Brand Name */}
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
