import { cn } from '@/lib/utils';
import { FiZap, FiMoon, FiShield, FiFeather, FiSmile } from 'react-icons/fi';

const features: Feature[] = [
    {
        title: 'Blazing Fast Experience',
        description: 'Optimized flows that feel instant, smooth, and frictionless.',
        color: '#6366F1',
        icon: <FiZap size={20} />,
    },
    {
        title: 'Built for Night Owls',
        description: 'Dark-first design that respects your eyes and your focus.',
        color: '#0F172A',
        icon: <FiMoon size={20} />,
    },
    {
        title: 'Privacy Comes First',
        description: 'Your data stays yours. No tracking, no funny business.',
        color: '#22C55E',
        icon: <FiShield size={20} />,
    },
    {
        title: 'Minimal by Design',
        description: 'Clean UI that removes noise and lets intent shine.',
        color: '#F59E0B',
        icon: <FiFeather size={20} />,
    },
    {
        title: 'Pleasant to Use',
        description: 'Subtle interactions that make the product feel alive.',
        color: '#EC4899',
        icon: <FiSmile size={20} />,
    },
    {
        title: 'Pleasant to Use',
        description: 'Subtle interactions that make the product feel alive.',
        color: '#EC4899',
        icon: <FiSmile size={20} />,
    },
];

interface Feature {
    title: string;
    description: string;
    color: string;
    icon: React.ReactNode;
}

export function Features() {
    return (
        <div className="w-full bg-[#90a7ed] h-[calc(100vh-160px)] py-12 flex flex-col justify-center">
            <div className="max-w-7xl mx-auto">
                <div className="relative mx-auto w-fit flex items-center justify-center">
                    <div className="text-center text-6xl font-semibold w-full text-tprime">
                        Features of Nocturn
                    </div>
                    <div className="uppercase text-tprime absolute -right-58 z-10 cursor-pointer rotate-10 text-4xl font-black shadow-hard border-2 border-black transition-transform duration-200 ease-out hover:translate-x-0.5 hover:translate-y-0.5 hover:scale-99 px-3 py-2 bg-white">
                        HAVE FUN!
                    </div>
                </div>
            </div>
            <section className={cn('grid grid-cols-3 gap-6 max-w-6xl mx-auto mt-12 px-4')}>
                {features.map((feature, idx) => (
                    <div
                        className={cn(
                            'col-span-1 border-2 border-black bg-white shadow-hard w-full h-48 transition-transform duration-200 ease-out hover:translate-x-0.5 hover:translate-y-0.5 hover:scale-99',
                            'flex flex-col items-start justify-end px-6 py-4',
                        )}
                        key={idx}
                    >
                        <h1 className="text-2xl font-bold text-tprime">{feature.title}</h1>
                        <span className="text-base font-normal text-tprime">
                            {feature.description}
                        </span>
                    </div>
                ))}
            </section>
        </div>
    );
}
