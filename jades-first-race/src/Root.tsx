import React from "react";
import { Composition } from "remotion";
import { JadesFirstRace } from "./JadesFirstRace";
import { FPS, WIDTH, HEIGHT, TOTAL_DURATION } from "./config/story-config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="JadesFirstRace"
      component={JadesFirstRace}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
