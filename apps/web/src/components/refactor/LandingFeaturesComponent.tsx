import type { FC } from 'react';
import LeftFeatureComponent from './LandingFeatureSectionComponents/LeftFeatureComponent';
import RightFeatureComponent from './LandingFeatureSectionComponents/RightFeatureComponent';

const LandingFeaturesComponent: FC = () => {
    return (
        <div className="mx-auto w-full max-w-270 py-15">
            <div className="flex w-full items-start">
                <LeftFeatureComponent />
                <RightFeatureComponent />
            </div>
        </div>
    );
};

export default LandingFeaturesComponent;
