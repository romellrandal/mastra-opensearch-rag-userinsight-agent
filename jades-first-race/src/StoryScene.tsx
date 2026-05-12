import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Background } from "./components/Background";
import { Car } from "./components/Car";
import { SpeechBubble } from "./components/SpeechBubble";
import {
  COLORS,
  StoryScene as StorySceneType,
  CHARACTER_COLORS,
  CHARACTER_NAMES,
} from "./config/story-config";

interface Props {
  scene: StorySceneType;
  sceneIndex: number;
}

export const StoryScene: React.FC<Props> = ({ scene, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const isLastPlace = scene.id === "last-place";
  const isCheers = scene.id === "cheers";

  const cardEntry = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
    durationInFrames: 35,
  });

  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mainColor = CHARACTER_COLORS[scene.character];
  const mainName = CHARACTER_NAMES[scene.character];

  // Scene number badge
  const sceneNum = sceneIndex + 1;

  // For "last place" scene — Jade car enters from right (she just finished)
  // For "cheers" scene — all cars gathered around
  const mainCarX = isLastPlace ? 1600 : isCheers ? 960 : 1400;
  const mainCarY = 880;

  // Text lines split for highlighting character names
  const textLines = scene.text.split("\n");

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Background />

      {/* Scene number indicator */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 48,
          opacity: cardEntry * fadeOut,
          background: `rgba(255,255,255,0.08)`,
          border: `2px solid rgba(255,255,255,0.18)`,
          borderRadius: 12,
          padding: "6px 18px",
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        {sceneNum} / 6
      </div>

      {/* Story text card */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          right: 80,
          opacity: cardEntry * fadeOut,
          transform: `translateY(${(1 - cardEntry) * 30}px)`,
          background: "rgba(255,255,255,0.07)",
          border: "2px solid rgba(255,255,255,0.14)",
          borderRadius: 28,
          padding: "36px 48px",
          backdropFilter: "blur(12px)",
          maxWidth: 1000,
        }}
      >
        {textLines.map((line, i) => (
          <p
            key={i}
            style={{
              margin: i < textLines.length - 1 ? "0 0 12px 0" : 0,
              fontSize: 38,
              lineHeight: 1.7,
              color: COLORS.white,
              fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            <HighlightedText text={line} />
          </p>
        ))}
      </div>

      {/* Speech bubble */}
      {scene.speech && (
        <SpeechBubble
          text={scene.speech}
          accentColor={scene.speechColor ?? mainColor}
          entryDelay={25}
          x={80}
          y={isCheers ? 430 : scene.otherCars ? 430 : 480}
          width={isCheers ? 1100 : 860}
          fontSize={isCheers ? 26 : 31}
        />
      )}

      {/* Main scene car */}
      {!isCheers && (
        <Car
          emoji={scene.emoji}
          glowColor={mainColor}
          x={mainCarX}
          y={mainCarY}
          fontSize={isLastPlace ? 80 : 90}
          entryDelay={isLastPlace ? 10 : 5}
          bounceDelay={sceneIndex * 7}
          label={mainName}
          labelColor={mainColor}
          spinning={false}
        />
      )}

      {/* Other cars */}
      {scene.otherCars &&
        !isCheers &&
        scene.otherCars.map((other, i) => (
          <Car
            key={i}
            emoji={other.emoji}
            glowColor={other.color}
            x={1200 + i * 180}
            y={870}
            fontSize={60}
            entryDelay={15 + i * 8}
            bounceDelay={(sceneIndex + i) * 5}
            label={other.label}
            labelColor={other.color}
          />
        ))}

      {/* Cheers scene — all cars in a row */}
      {isCheers && (
        <>
          <Car emoji="🟢🚗" glowColor={COLORS.jade} x={760} y={870} fontSize={90} entryDelay={0} bounceDelay={0} label="Jade" labelColor={COLORS.jade} />
          <Car emoji="🔴🚗" glowColor={COLORS.ruby} x={1100} y={870} fontSize={68} entryDelay={12} bounceDelay={8} label="Ruby" labelColor={COLORS.ruby} />
          <Car emoji="🟡🚗" glowColor={COLORS.yasmin} x={1340} y={870} fontSize={64} entryDelay={20} bounceDelay={14} label="Yasmin" labelColor={COLORS.yasmin} />
          <Car emoji="🔵🚗" glowColor={COLORS.ben} x={1560} y={870} fontSize={62} entryDelay={28} bounceDelay={20} label="Ben" labelColor={COLORS.ben} />
        </>
      )}

      {/* Emotion overlay for last-place scene */}
      {isLastPlace && (
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 80,
            fontSize: 80,
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * fadeOut,
          }}
        >
          😔
        </div>
      )}
    </div>
  );
};

// Simple component to bold character names in text
const CHARACTER_PATTERNS = [
  { name: "Jade the Green Car", color: COLORS.jade },
  { name: "Ruby the Red Car", color: COLORS.ruby },
  { name: "Yasmin the Yellow Car", color: COLORS.yasmin },
  { name: "Ben the Blue Car", color: COLORS.ben },
  { name: "Jade", color: COLORS.jade },
  { name: "Ruby", color: COLORS.ruby },
  { name: "Yasmin", color: COLORS.yasmin },
  { name: "Ben", color: COLORS.ben },
];

function HighlightedText({ text }: { text: string }) {
  let parts: Array<{ text: string; color?: string }> = [{ text }];

  for (const { name, color } of CHARACTER_PATTERNS) {
    parts = parts.flatMap((part) => {
      if (part.color) return [part];
      const segments = part.text.split(name);
      if (segments.length === 1) return [part];
      const result: Array<{ text: string; color?: string }> = [];
      segments.forEach((seg, i) => {
        if (seg) result.push({ text: seg });
        if (i < segments.length - 1) result.push({ text: name, color });
      });
      return result;
    });
  }

  return (
    <>
      {parts.map((p, i) =>
        p.color ? (
          <span
            key={i}
            style={{
              color: p.color,
              fontWeight: 800,
              textShadow: `0 0 10px ${p.color}88`,
            }}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}
