import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../config/story-config";

interface SpeechBubbleProps {
  text: string;
  accentColor?: string;
  entryDelay?: number;
  x?: number;
  y?: number;
  width?: number;
  fontSize?: number;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  accentColor = COLORS.jade,
  entryDelay = 0,
  x = 80,
  y = 560,
  width = 800,
  fontSize = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - entryDelay,
    fps,
    config: { damping: 15, stiffness: 150, mass: 0.6 },
    durationInFrames: 25,
  });

  const lines = text.split("\n");

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          borderLeft: `5px solid ${accentColor}`,
          borderRadius: "0 16px 16px 0",
          padding: "18px 24px",
          backdropFilter: "blur(8px)",
        }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              margin: i < lines.length - 1 ? "0 0 8px 0" : 0,
              fontSize,
              fontStyle: "italic",
              color: COLORS.cream,
              fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};
