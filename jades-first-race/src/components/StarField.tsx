import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  period: number;
}

const STARS: Star[] = Array.from({ length: 80 }, (_, i) => {
  const seed = i * 137.508; // golden angle
  return {
    x: ((seed * 31) % 1920),
    y: ((seed * 17) % 700),
    size: 1 + ((seed * 7) % 3),
    phase: (seed * 13) % (Math.PI * 2),
    period: 45 + ((seed * 11) % 60),
  };
});

export const StarField: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "70%", pointerEvents: "none" }}
      viewBox="0 0 1920 756"
      preserveAspectRatio="none"
    >
      {STARS.map((star, i) => {
        const brightness = 0.3 + 0.7 * ((Math.sin((frame / star.period) * Math.PI * 2 + star.phase) + 1) / 2);
        return (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={brightness}
          />
        );
      })}
    </svg>
  );
};
