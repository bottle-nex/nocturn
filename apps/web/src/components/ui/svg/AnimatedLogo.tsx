'use client';
import { useEffect } from 'react';
import gsap from 'gsap';

export default function AnimatedNocturnLogo() {
    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        ['#leftWing', '#rightWing', '#topDiamond', '#bottomDiamond'].forEach((id, _i) => {
            const el = document.querySelector(id);
            if (!el) return;

            tl.to(
                el,
                {
                    duration: 0.6,
                    x: gsap.utils.random(-100, 100), // shoot out randomly
                    y: gsap.utils.random(-100, 100),
                    rotation: gsap.utils.random(-45, 45),
                    ease: 'power3.out',
                },
                0, // all start together
            )
                .to(
                    el,
                    {
                        duration: 1.5,
                        x: gsap.utils.random(-150, 150),
                        y: gsap.utils.random(-150, 150),
                        rotation: gsap.utils.random(-180, 180),
                        ease: 'sine.inOut',
                        yoyo: true,
                        repeat: 1,
                    },
                    '>-0.2',
                )
                .to(
                    el,
                    {
                        duration: 1,
                        x: 0,
                        y: 0,
                        rotation: 0,
                        ease: 'power4.inOut',
                    },
                    '>-0.1',
                );
        });
    }, []);

    return (
        <div className="flex items-center justify-center h-full w-full">
            <svg
                width="250"
                height="138"
                viewBox="0 0 250 138"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g filter="url(#filter0_d_160_178)">
                    <path
                        id="leftWing"
                        d="M74 0.00292969C100.003 0.271104 121 21.4333 121 47.5C121 73.7335 99.7335 95 73.5 95C47.2665 95 26 73.7335 26 47.5C26 38.5357 28.4859 30.1533 32.8027 23H52.1465C45.3164 28.9579 41 37.7246 41 47.5C41 65.4493 55.5507 80 73.5 80C91.4493 80 106 65.4493 106 47.5C106 29.7177 91.7187 15.2731 74 15.0059V15H15L4 0H74V0.00292969Z"
                        fill="white"
                    />
                    <path
                        id="rightWing"
                        d="M235 15H176V15.0059C158.281 15.2731 144 29.7177 144 47.5C144 65.4493 158.551 80 176.5 80C188.006 80 198.115 74.0207 203.891 65H220.671C213.703 82.5728 196.553 95 176.5 95C150.266 95 129 73.7335 129 47.5C129 21.4333 149.997 0.271104 176 0.00292969V0H246L235 15Z"
                        fill="white"
                    />
                    <path
                        id="topDiamond"
                        d="M146.381 0.0546875C137.453 5.11562 130.095 12.6242 125.218 21.668C120.34 12.624 112.982 5.11563 104.054 0.0546875C104.036 0.0364153 104.018 0.0183068 104 0H146.436L146.381 0.0546875Z"
                        fill="#F5C718"
                    />
                    <path
                        id="bottomDiamond"
                        d="M125.218 73C130.095 82.0438 137.453 89.5523 146.381 94.6133L146.428 94.6602C135.296 103.003 127.461 115.505 125.229 129.86C122.997 115.498 115.157 102.992 104.018 94.6494C104.03 94.6372 104.042 94.6255 104.054 94.6133C112.982 89.5523 120.34 82.044 125.218 73Z"
                        fill="#F5C718"
                    />
                </g>
                <defs>
                    <filter
                        id="filter0_d_160_178"
                        x="0"
                        y="0"
                        width="250"
                        height="137.86"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        />
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="2" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_160_178"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_160_178"
                            result="shape"
                        />
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
