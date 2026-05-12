import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../config/story-config";

const ROAD_HEIGHT = 140;
const ROAD_Y = 1080 - ROAD_HEIGHT;
const DASH_WIDTH = 50;
const DASH_GAP = 40;
const DASH_PERIOD = DASH_WIDTH + DASH_GAP;

export const Road: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 3) % DASH_PERIOD;

  const dashes: React.ReactNode[] = [];
  const dashY = ROAD_Y + ROAD_HEIGHT / 2 - 5;
  for (let x = -DASH_PERIOD + offset; x < 1920 + DASH_PERIOD; x += DASH_PERIOD) {
    dashes.push(
      <rect
        key={x}
        x={x}
        y={dashY}
        width={DASH_WIDTH}
        height={10}
        fill="white"
        opacity={0.9}
      />
    );
  }

  return (
    <svg
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${ROAD_HEIGHT}px`, overflow: "hidden" }}
      viewBox={`0 0 1920 ${ROAD_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {/* Road surface */}
      <rect x={0} y={0} width={1920} height={ROAD_HEIGHT} fill={COLORS.road} />
      {/* Yellow border line at top */}
      <rect x={0} y={0} width={1920} height={6} fill={COLORS.roadLine} />
      {/* Moving white dashes */}
      <clipPath id="roadClip">
        <rect x={0} y={0} width={1920} height={ROAD_HEIGHT} />
      </clipPath>
      <g clipPath="url(#roadClip)">{dashes}</g>
    </svg>
  );
};
