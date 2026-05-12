import React from "react";
import { StarField } from "./StarField";
import { Road } from "./Road";
import { COLORS, WIDTH, HEIGHT } from "../config/story-config";

export const Background: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        background: `linear-gradient(160deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg3} 100%)`,
        overflow: "hidden",
      }}
    >
      <StarField />
      <Road />
    </div>
  );
};
