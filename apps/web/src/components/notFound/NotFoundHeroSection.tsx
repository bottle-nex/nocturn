import Link from 'next/link';

export default function NotFoundHeroSection() {
    return (
        <div className="w-full max-w-270 mx-auto flex flex-col gap-y-3 pt-48 pb-20 items-center justify-center">
            <div className="text-7xl font-semibold max-w-xl text-dark-base text-center">
                404
            </div>
            <div className="text-4xl font-semibold max-w-xl text-dark-base text-center mt-2">
                Page not found
            </div>

            <div className="text-dark-base/60 w-full max-w-2xl text-xl text-center mt-4">
                Sorry, the page you are looking for doesn't exist or has been moved.
            </div>

            <div className="mt-8">
                <Link 
                    href="/"
                    className="bg-dark-base text-light-base text-[16px] h-11 px-8 flex items-center justify-center rounded-full shadow-xs cursor-pointer transition-all transform duration-200 ease-in-out hover:scale-105 active:scale-95 inset-shadow-xs inset-shadow-white/30"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
