import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import { useTheme } from 'next-themes';

interface DeveloperCardProps {
    name: string;
    role: string;
    twitterUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    image: string;
    githubUsername: string;
    className?: string;
}

const cardAnimations = `
  @keyframes fadeUpCard {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes popImage {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

export default function DeveloperCard({
    name,
    role,
    twitterUrl,
    linkedinUrl,
    githubUrl,
    image,
    githubUsername,
    className,
}: DeveloperCardProps) {
    const { theme } = useTheme();

    return (
        <div className={`w-full select-none flex justify-center ${className}`}>
            <style>{cardAnimations}</style>

            <div
                className="py-10 w-full max-w-4xl gap-x-6 flex flex-col md:flex-row items-center justify-center font-light"
                style={{
                    animation: 'fadeUpCard 1s ease-out forwards',
                }}
            >
                <div className="flex flex-col w-full md:w-[35%] items-center justify-center p-2 gap-y-4">
                    <div className="w-full flex items-center gap-x-3">
                        <div
                            className="w-16 h-16 flex justify-center items-center overflow-hidden rounded-xl"
                            style={{ animation: 'popImage 0.6s ease-out forwards' }}
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={image}
                                    alt="Founder profile"
                                    fill
                                    className="object-cover rounded-xl"
                                    unoptimized
                                />
                            </div>
                        </div>

                        <div className="flex flex-col text-[14px] px-3 justify-center gap-y-0.5">
                            <span className="text-[16px] font-normal dark:text-white text-gray-900">
                                {name}
                            </span>
                            <span className="text-[14px] dark:text-gray-300 text-gray-600">
                                {role}
                            </span>
                        </div>
                    </div>

                    <div className="w-full text-[13px] pt-1 tracking-wide flex items-end justify-between px-1 pr-16">
                        <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dark:text-white text-gray-700 dark:hover:text-[#c3afee] hover:text-[#9573E1] transition-all transform duration-150 tracking-wider"
                        >
                            Twitter
                        </a>
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dark:text-white text-gray-700 dark:hover:text-[#c3afee] hover:text-[#9573E1] transition-all transform duration-150 tracking-wider"
                        >
                            GitHub
                        </a>
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dark:text-white text-gray-700 dark:hover:text-[#c3afee] hover:text-[#9573E1] transition-all transform duration-150 tracking-wider"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>

                <div className="w-full md:w-[65%] flex justify-center items-center">
                    <div className="w-full max-w-full overflow-hidden">
                        <GitHubCalendar
                            username={githubUsername}
                            blockSize={8}
                            blockMargin={3}
                            fontSize={10}
                            colorScheme={theme === 'dark' ? 'dark' : 'light'}
                            theme={{
                                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                            }}
                            style={{
                                width: '100%',
                                maxWidth: '100%',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
