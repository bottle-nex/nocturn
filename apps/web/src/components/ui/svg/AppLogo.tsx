interface AppLogoProps {
    variant?: 'dark' | 'light';
    size?: number;
    className?: string;
}

export function AppLogo({ size, className }: AppLogoProps) {
    return (
        <>
            <LightAppLogo size={size} className={className} />
            <DarkAppLogo size={size} className={className} />
        </>
    );
}

function LightAppLogo({ size, className }: AppLogoProps) {
    return (
        <div
            className={`dark:hidden bg-dark-base p-1.5 rounded-sm border border-dark-prime flex justify-center items-center `}
            style={{
                height: size,
                width: size,
            }}
        >
            <svg
                viewBox="0 0 207 173"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${className}`}
            >
                <path
                    d="M67 0C73.0408 7.20359e-08 79.0225 1.19024 84.6035 3.50195C90.1844 5.81367 95.2559 9.20122 99.5273 13.4727C103.799 17.7441 107.186 22.8156 109.498 28.3965C111.81 33.9775 113 39.9592 113 46V147L83 173V46H83.001C83.001 43.8988 82.5873 41.8182 81.7832 39.877C80.9791 37.9356 79.8003 36.1714 78.3145 34.6855C76.8286 33.1997 75.0644 32.0209 73.123 31.2168C71.1818 30.4127 69.1012 29.999 67 29.999V30H0V0H67ZM180.585 30H120.508C118.328 24.4586 115.5 19.383 112.112 14.9648C107.841 9.39341 102.769 4.97426 97.1885 1.95898C95.815 1.21691 94.4169 0.563492 93 0H206.585L180.585 30Z"
                    fill={'white'}
                />
            </svg>
        </div>
    );
}

function DarkAppLogo({ size, className }: AppLogoProps) {
    return (
        <div
            className={`hidden dark:flex dark:bg-light-base p-1.5 rounded-sm border border-dark-prime justify-center items-center `}
            style={{
                height: size,
                width: size,
            }}
        >
            <svg
                viewBox="0 0 207 173"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${className}`}
            >
                <path
                    d="M67 0C73.0408 7.20359e-08 79.0225 1.19024 84.6035 3.50195C90.1844 5.81367 95.2559 9.20122 99.5273 13.4727C103.799 17.7441 107.186 22.8156 109.498 28.3965C111.81 33.9775 113 39.9592 113 46V147L83 173V46H83.001C83.001 43.8988 82.5873 41.8182 81.7832 39.877C80.9791 37.9356 79.8003 36.1714 78.3145 34.6855C76.8286 33.1997 75.0644 32.0209 73.123 31.2168C71.1818 30.4127 69.1012 29.999 67 29.999V30H0V0H67ZM180.585 30H120.508C118.328 24.4586 115.5 19.383 112.112 14.9648C107.841 9.39341 102.769 4.97426 97.1885 1.95898C95.815 1.21691 94.4169 0.563492 93 0H206.585L180.585 30Z"
                    fill={'black'}
                />
            </svg>
        </div>
    );
}
