'use client';

import { Button } from '../ui/button';
import React, { useState } from 'react';

interface FeatureBoxComponentProps {
    title: string;
    description: string;
    buttonText: string;
    color: string;
    backgroundSvg: (hovered: boolean, color: string) => React.ReactNode;
    buttonOnClick?: () => void;
}

export default function FeatureBoxComponent({
    title,
    description,
    buttonText,
    color,
    backgroundSvg,
    buttonOnClick,
}: FeatureBoxComponentProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={`relative flex-1 w-[440px] border-l border-r transition-all group py-6 flex flex-col`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered
                    ? `linear-gradient(to bottom, ${color}20, ${color}10, transparent)` // subtle gradient overlay
                    : 'transparent',
            }}
        >
            {/* Decorative borders */}
            <span className="absolute -top-1 -left-1 w-2 h-2 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="h-[10%] flex justify-start items-center text-[19px] px-7 mt-4">
                {title}
            </div>

            <div className="h-[20%] text-start text-[#7D8187] group-hover:text-dark-base group-hover:dark:text-light-base px-7 tracking-wide">
                {description}
            </div>

            <div className="h-[70%] w-full flex justify-center items-center text-9xl">
                {backgroundSvg(hovered, color)}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <Button
                    onClick={buttonOnClick}
                    className="flex rounded-full !px-4 !py-2.5 text-md"
                    style={{
                        backgroundColor: color,
                        color: '#fff',
                    }}
                >
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}
