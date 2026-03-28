import type { FC } from "react";
import LeftFeatureComponent from "./LandingFeatureSectionComponents/LeftFeatureComponent";
import RightFeatureComponent from "./LandingFeatureSectionComponents/RightFeatureComponent";

const LandingFeaturesComponent: FC = () => {
  return (
    <div className="mx-auto w-full max-w-270 bg-light-base pb-32 pt-25 ring-1 ring-black/10">
      {/*
        items-start is critical:
        without it flex children stretch to equal height,
        which breaks sticky because the left panel has nowhere to "stick" to.
      */}
      <div className="flex w-full items-start">
        <LeftFeatureComponent />
        <RightFeatureComponent />
      </div>
    </div>
  );
};

export default LandingFeaturesComponent;