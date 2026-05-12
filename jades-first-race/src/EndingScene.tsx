import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Background } from "./components/Background";
import { Car } from "./components/Car";
import { COLORS } from "./config/story-config";

export const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const medalEntry = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 90, mass: 1.2 },
    durationInFrames: 40,
  });

  const textEntry = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
    durationInFrames: 35,
  });

  const subEntry = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });

  const theEndEntry = spring({
    frame: frame - 50,
    fps,
    config: { damping: 16, stiffness: 80, mass: 1 },
    durationInFrames: 30,
  });

  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const medalBounce = Math.sin((frame / fps) * Math.PI * 2) * 8 * medalEntry;

  // Stars/sparkles bursting out
  const sparkleProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Background />

      {/* Golden glow circle behind medal */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: "50%",
          transform: `translate(-50%, ${medalBounce}px) scale(${medalEntry})`,
          opacity: 0.25 * medalEntry * fadeOut,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}, transparent 70%)`,
        }}
      />

      {/* Medal emoji */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: "50%",
          transform: `translate(-50%, ${medalBounce}px) scale(${medalEntry})`,
          opacity: fadeOut,
          fontSize: 140,
          textAlign: "center",
          filter: `drop-shadow(0 0 30px ${COLORS.gold}) drop-shadow(0 0 60px ${COLORS.gold}88)`,
        }}
      >
        🏅
      </div>

      {/* Main ending message */}
      <div
        style={{
          position: "absolute",
          top: 310,
          left: "50%",
          transform: `translate(-50%, ${(1 - textEntry) * 25}px)`,
          opacity: textEntry * fadeOut,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontFamily: "'Fredoka One', 'Nunito', 'Segoe UI Semibold', system-ui, sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: COLORS.gold,
            textShadow: `3px 3px 0 #92400e, 0 0 30px rgba(251,191,36,0.5)`,
          }}
        >
          Being kind is always winning. 💚
        </div>
      </div>

      {/* Sub text */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: "50%",
          transform: `translate(-50%, ${(1 - subEntry) * 20}px)`,
          opacity: subEntry * fadeOut,
          width: 1100,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, rgba(251,191,36,0.13), rgba(74,222,128,0.09))`,
            border: `2px solid rgba(251,191,36,0.35)`,
            borderRadius: 24,
            padding: "28px 40px",
          }}
        >
          <p
            style={{
              fontSize: 36,
              color: "#a7f3d0",
              fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Jade was the kindest car in the race — and that made her the greatest.
          </p>
        </div>
      </div>

      {/* Jade car in centre celebrating */}
      <Car
        emoji="🟢🚗"
        glowColor={COLORS.jade}
        x={960}
        y={850}
        fontSize={100}
        entryDelay={15}
        bounceDelay={0}
      />

      {/* Sparkle emojis around Jade */}
      {[
        { emoji: "✨", x: 780, y: 760, delay: 20, size: 50 },
        { emoji: "⭐", x: 1140, y: 750, delay: 28, size: 44 },
        { emoji: "🌟", x: 860, y: 730, delay: 35, size: 48 },
        { emoji: "✨", x: 1060, y: 770, delay: 22, size: 42 },
      ].map((s, i) => {
        const sparkIn = spring({
          frame: frame - s.delay,
          fps,
          config: { damping: 8, stiffness: 160, mass: 0.5 },
          durationInFrames: 20,
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              fontSize: s.size,
              opacity: sparkIn * fadeOut,
              transform: `scale(${sparkIn}) rotate(${frame * 2}deg)`,
            }}
          >
            {s.emoji}
          </div>
        );
      })}

      {/* THE END */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          transform: `translateX(-50%)`,
          opacity: theEndEntry * fadeOut,
          fontFamily: "'Fredoka One', 'Nunito', 'Segoe UI Semibold', system-ui, sans-serif",
          fontSize: 42,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: 10,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        — THE END —
      </div>
    </div>
  );
};
