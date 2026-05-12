import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Background } from "./components/Background";
import { Car } from "./components/Car";
import { COLORS } from "./config/story-config";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleEntry = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
    durationInFrames: 40,
  });

  const bylineEntry = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });

  const flagEntry = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.6 },
    durationInFrames: 25,
  });

  // Fade out near end
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const emojiRow = "🏁🚗🏆";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Background />

      {/* Animated flag emojis */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: `translate(-50%, ${(1 - flagEntry) * -40}px)`,
          opacity: flagEntry * fadeOut,
          fontSize: 72,
          textAlign: "center",
          letterSpacing: 8,
          filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
        }}
      >
        {emojiRow}
      </div>

      {/* Main title */}
      <h1
        style={{
          position: "absolute",
          top: 310,
          left: "50%",
          transform: `translate(-50%, ${(1 - titleEntry) * -30}px)`,
          opacity: titleEntry * fadeOut,
          fontFamily: "'Fredoka One', 'Nunito', 'Segoe UI Semibold', system-ui, sans-serif",
          fontSize: 110,
          fontWeight: 900,
          color: COLORS.jade,
          textShadow: `4px 4px 0 ${COLORS.jadeDark}, 0 0 40px rgba(74,222,128,0.5)`,
          lineHeight: 1.1,
          textAlign: "center",
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        Jade's First Race
      </h1>

      {/* Byline */}
      <div
        style={{
          position: "absolute",
          top: 460,
          left: "50%",
          transform: `translate(-50%, ${(1 - bylineEntry) * 20}px)`,
          opacity: bylineEntry * fadeOut,
          fontSize: 36,
          color: COLORS.gold,
          fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
          fontWeight: 700,
          letterSpacing: 2,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        ✍️ A story by Isabella, age 8
      </div>

      {/* Animated cars racing across the bottom */}
      <Car
        emoji="🟢🚗"
        glowColor={COLORS.jade}
        x={interpolate(frame, [0, 150], [-100, 2100])}
        y={960}
        fontSize={60}
        entryDelay={0}
        bounceDelay={0}
      />
      <Car
        emoji="🔴🚗"
        glowColor={COLORS.ruby}
        x={interpolate(frame, [0, 150], [-300, 1900])}
        y={930}
        fontSize={52}
        entryDelay={0}
        bounceDelay={5}
      />
      <Car
        emoji="🟡🚗"
        glowColor={COLORS.yasmin}
        x={interpolate(frame, [0, 150], [-200, 2000])}
        y={970}
        fontSize={48}
        entryDelay={0}
        bounceDelay={10}
      />
    </div>
  );
};
