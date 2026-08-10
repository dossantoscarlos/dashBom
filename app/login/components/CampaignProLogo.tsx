import React from "react";

export function CampaignProLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="44"
        height="44"
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle
          cx="34"
          cy="34"
          r="25"
          stroke="#008E66"
          strokeWidth="8"
          fill="none"
        />
        <path
          d="M 34 9 A 25 25 0 0 1 59 34"
          stroke="#00A878"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="34" cy="34" r="14" fill="#071F3D" />
      </svg>
      <span className="text-2xl sm:text-3xl lg:text-[30px] font-bold text-white tracking-tight leading-none">
        campanha<span className="font-extrabold text-white">PRO</span>
      </span>
    </div>
  );
}
