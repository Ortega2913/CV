import React from "react";
import { Composition } from "remotion";
import { ParallaxScene } from "./ParallaxScene";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ParallaxCamera"
      component={ParallaxScene}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
