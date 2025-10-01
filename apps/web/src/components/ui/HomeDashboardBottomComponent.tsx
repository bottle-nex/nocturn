import { JSX } from 'react';

interface Element {
    color: string;
    accent: string;
    height: number;
}

const elements: Element[] = [
    {
        color: '#e63e41',
        accent: '#e46062',
        height: 120,
    },
    {
        color: '#ffc412',
        accent: '#e3c670',
        height: 130,
    },
    {
        color: '#04a552',
        accent: '#3cc980',
        height: 165,
    },
    {
        color: '#7a78ff',
        accent: '#8483fd',
        height: 200,
    },
    {
        color: '#ff6d38',
        accent: '#e77c55',
        height: 225,
    },
];

export default function HomeDashboardBottomComponent(): JSX.Element {
    return (
        <div className="flex-1 w-full relative overflow-hidden">
            <div className="absolute bottom-0 w-full">
                <div className="w-full relative flex flex-row items-end gap-x-4 justify-center">
                    {elements.map((element, index) => (
                        <div key={`bar-${index}`} className="flex flex-col items-center relative">
                            <div className="w-40 h-40" />
                            <div
                                className="w-40 -mt-20"
                                style={{
                                    height: `${element.height}px`,
                                    backgroundColor: `${element.accent}80`,
                                }}
                            />
                        </div>
                    ))}
                    <div className="absolute bottom-0 w-full flex flex-row items-end gap-x-4 justify-center pointer-events-none">
                        {elements.map((element, index) => (
                            <div key={`circle-${index}`} className="flex flex-col items-center">
                                <div
                                    style={{
                                        background: `linear-gradient(to bottom, ${element.color} 0%, ${element.color} 50%, ${element.color}80 50%, ${element.color}80 100%)`,
                                        zIndex: 0,
                                    }}
                                    className="rounded-full w-40 h-40 flex items-center justify-center"
                                >
                                    <div
                                        style={{
                                            background: `linear-gradient(to bottom, ${element.color} 0%, ${element.color} 50%, ${element.color}80 50%, ${element.color}80 100%)`,
                                            zIndex: 10,
                                        }}
                                        className="rounded-full w-20 h-20 rotate-180"
                                    ></div>
                                </div>

                                <div
                                    className="w-40 -mt-20"
                                    style={{
                                        height: `${element.height}px`,
                                        visibility: 'hidden',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
