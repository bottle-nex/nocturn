import type { FC } from 'react';
import LeftFeatureComponent from './LandingFeatureSectionComponents/LeftFeatureComponent';
import RightFeatureComponent from './LandingFeatureSectionComponents/RightFeatureComponent';

const LandingFeaturesComponent: FC = () => {
    return (
        <div className="mx-auto w-full max-w-270 py-15 px-6 xl:px-0">
            <div className="flex flex-col md:flex-row w-full items-start gap-y-10">
                <LeftFeatureComponent />
                <RightFeatureComponent />
            </div>
        </div>
    );
};

export default LandingFeaturesComponent;
