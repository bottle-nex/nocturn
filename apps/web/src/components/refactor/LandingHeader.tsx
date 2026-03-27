import { JSX } from "react";

interface LandingHeaderProps {
    heading: string;
    subheading: string;
}

export default function LandingHeader({ heading, subheading }: LandingHeaderProps): JSX.Element {
    return (
        <div>
            <h1 className="text-5xl text-dark-alpha text-center font-semibold">{heading}</h1>
            <p className="text-lg text-center text-dark-base/60 mt-4">{subheading}</p>
        </div>
    );
}