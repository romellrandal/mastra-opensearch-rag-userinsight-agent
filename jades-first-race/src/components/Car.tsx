import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

interface CarProps {
  emoji: string;
  glowColor: string;
  x: number;
  y: number;
  fontSize?: number;
  bounceDelay?: number;
  entryDelay?: number;
  label?: string;
  labelColor?: string;
  spinning?: boolean;
}

export const Car: React.FC<CarProps> = ({
  emoji,
  glowColor,
  x,
  y,
  fontSize = 72,
  bounceDelay = 0,
  entryDelay = 0,
  label,
  labelColor,
  spinning = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - entryDelay,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });

  const bounce = Math.sin(((frame - bounceDelay) / fps) * Math.PI * 2) * 6;
  const rotation = spinning ? ((frame - entryDelay) / fps) * 360 * 0.5 : 0;

  const scale = entryProgress;
  const translateY = bounce * entryProgress;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg) translateY(${translateY}px)`,
        transformOrigin: "center center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize,
          lineHeight: 1,
          filter: `drop-shadow(0 0 16px ${glowColor}) drop-shadow(0 0 32px ${glowColor}88)`,
          userSelect: "none",
        }}
      >
        {emoji}
      </div>
      {label && (
        <div
          style={{
            marginTop: 8,
            fontSize: 22,
            fontWeight: 700,
            color: labelColor ?? glowColor,
            fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
            textShadow: `0 0 8px ${glowColor}88`,
            opacity: entryProgress,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
