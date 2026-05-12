import React from "react";
import { Series } from "remotion";
import { TitleScene } from "./TitleScene";
import { StoryScene } from "./StoryScene";
import { EndingScene } from "./EndingScene";
import { SCENES, TITLE_DURATION, ENDING_DURATION, seconds } from "./config/story-config";

export const JadesFirstRace: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={TITLE_DURATION}>
        <TitleScene />
      </Series.Sequence>

      {SCENES.map((scene, index) => (
        <Series.Sequence
          key={scene.id}
          durationInFrames={seconds(scene.durationSeconds)}
        >
          <StoryScene scene={scene} sceneIndex={index} />
        </Series.Sequence>
      ))}

      <Series.Sequence durationInFrames={ENDING_DURATION}>
        <EndingScene />
      </Series.Sequence>
    </Series>
  );
};
