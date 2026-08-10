import React from "react";

export function CampaignDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* Arcos no canto superior direito */}
      <svg
        className="absolute -right-20 -top-20 w-[420px] h-[420px] text-[#00A878]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="170"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.3"
        />
        <path
          d="M 50 200 A 150 150 0 0 1 350 200"
          stroke="#00A878"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </svg>

      {/* Arcos sobrepostos grandes no canto inferior esquerdo */}
      <svg
        className="absolute -left-36 -bottom-36 w-[560px] h-[560px] text-[#008E66]"
        viewBox="0 0 500 500"
        fill="none"
      >
        {/* Arco externo mais grosso verde escuro/médio */}
        <circle
          cx="100"
          cy="400"
          r="300"
          stroke="#008E66"
          strokeWidth="32"
          opacity="0.45"
          fill="none"
        />
        {/* Arco interno intermediário verde de destaque */}
        <circle
          cx="100"
          cy="400"
          r="220"
          stroke="#00A878"
          strokeWidth="24"
          opacity="0.5"
          fill="none"
        />
        {/* Linha fina contornada */}
        <circle
          cx="100"
          cy="400"
          r="140"
          stroke="#00A878"
          strokeWidth="1.5"
          opacity="0.7"
          fill="none"
        />
      </svg>

      {/* Círculo verde contornado adicional na parte inferior */}
      <svg
        className="absolute left-[35%] -bottom-16 w-64 h-64 text-[#00A878]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="75"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
