import { useEffect, useRef, useState } from 'react';

export default function AnimatedHorizontalBars() {
    const rightBarRef = useRef(null);
    const leftBarRef = useRef(null);
    const [rightTransform, setRightTransform] = useState(0);
    const [leftTransform, setLeftTransform] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            const maxScroll = documentHeight - windowHeight;
            const scrollProgress = Math.min(scrollPosition / maxScroll, 1);

            const rightPos = -220 + (scrollProgress * 200);
            setRightTransform(rightPos);

            const leftPos = 180 - (scrollProgress * 200);
            setLeftTransform(leftPos);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="w-full">
            <div className="max-w-screen overflow-hidden h-auto relative">
                {/* right pointed */}
                <div
                    ref={rightBarRef}
                    style={{
                        transform: `translateX(${rightTransform}%)`,
                        transition: 'none'
                    }}
                    className="w-full"
                >
                    <svg width="2142" height="202" viewBox="0 0 2142 202" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1588.69 0.5H2046.14C2050.3 0.500125 2054.26 2.28782 2057.01 5.4082L2132.87 91.4082C2137.71 96.889 2137.71 105.111 2132.87 110.592L2057.01 196.592C2054.26 199.712 2050.3 201.5 2046.14 201.5H1588.69C1580.68 201.5 1574.19 195.008 1574.19 187V15C1574.19 6.99187 1580.68 0.5 1588.69 0.5Z" fill="#7A78FF" stroke="black" />
                        <path d="M1117.14 0.5H1584.05C1588.16 0.5 1592.08 2.24621 1594.83 5.30371L1672.18 91.3037C1677.14 96.817 1677.14 105.183 1672.18 110.696L1594.83 196.696C1592.08 199.754 1588.16 201.5 1584.05 201.5H1117.14C1109.13 201.5 1102.64 195.008 1102.64 187V15C1102.64 6.99187 1109.13 0.5 1117.14 0.5Z" fill="#FFC412" stroke="black" />
                        <path d="M565.51 0.5H1112.81C1116.54 0.5 1120.13 1.93941 1122.83 4.51855L1212.79 90.5186C1218.76 96.2293 1218.76 105.771 1212.79 111.481L1122.83 197.481C1120.13 200.061 1116.54 201.5 1112.81 201.5H565.51C557.51 201.5 551.01 195.008 551.01 187V15C551.01 6.99187 557.51 0.5 565.51 0.5Z" fill="#FF6D38" stroke="black" />
                        <path d="M14.9999 0.5H562.29C566.02 0.5 569.61 1.93941 572.31 4.51855L662.27 90.5186C668.25 96.2293 668.25 105.771 662.27 111.481L572.31 197.481C569.61 200.061 566.02 201.5 562.29 201.5H14.9999C6.98988 201.5 0.499878 195.008 0.499878 187V15C0.499878 6.99187 6.98988 0.5 14.9999 0.5Z" fill="#C7FF69" stroke="black" />
                    </svg>

                </div>

                {/* Left pointed */}
                <div
                    ref={leftBarRef}
                    style={{
                        transform: `translateX(${leftTransform}%)`,
                        transition: 'none'
                    }}
                    className="w-full"
                >
                    <svg width="2142" height="202" viewBox="0 0 2142 202" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M553.309 0.5H95.8613C91.7005 0.500125 87.7398 2.28782 84.9873 5.4082L9.12793 91.4082C4.29335 96.889 4.29335 105.111 9.12793 110.592L84.9873 196.592C87.7398 199.712 91.7005 201.5 95.8613 201.5H553.309C561.317 201.5 567.809 195.008 567.809 187V15C567.809 6.99187 561.317 0.5 553.309 0.5Z" fill="#7A78FF" stroke="black" />
                        <path d="M1024.86 0.5H557.949C553.836 0.5 549.917 2.24621 547.167 5.30371L469.823 91.3037C464.864 96.817 464.864 105.183 469.823 110.696L547.167 196.696C549.917 199.754 553.836 201.5 557.949 201.5H1024.86C1032.87 201.5 1039.36 195.008 1039.36 187V15C1039.36 6.99187 1032.87 0.5 1024.86 0.5Z" fill="#FFC412" stroke="black" />
                        <path d="M1576.49 0.5H1029.19C1025.46 0.5 1021.87 1.93941 1019.17 4.51855L929.211 90.5186C923.238 96.2293 923.238 105.771 929.211 111.481L1019.17 197.481C1021.87 200.061 1025.46 201.5 1029.19 201.5H1576.49C1584.49 201.5 1590.99 195.008 1590.99 187V15C1590.99 6.99187 1584.49 0.5 1576.49 0.5Z" fill="#FF6D38" stroke="black" />
                        <path d="M2127 0.5H1579.71C1575.98 0.5 1572.39 1.93941 1569.69 4.51855L1479.73 90.5186C1473.75 96.2293 1473.75 105.771 1479.73 111.481L1569.69 197.481C1572.39 200.061 1575.98 201.5 1579.71 201.5H2127C2135.01 201.5 2141.5 195.008 2141.5 187V15C2141.5 6.99187 2135.01 0.5 2127 0.5Z" fill="#C7FF69" stroke="black" />
                    </svg>


                </div>
            </div>

        </div>
    );
}