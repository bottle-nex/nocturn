import { JSX } from 'react';

interface LandingHeaderProps {
    heading: string;
    subheading: string;
}

export default function LandingHeader({ heading, subheading }: LandingHeaderProps): JSX.Element {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-5xl text-dark-base/90 text-center font-semibold">{heading}</h1>
            <p className="text-lg text-center text-dark-base/50 mt-3 max-w-120">{subheading}</p>
        </div>
    );
}
