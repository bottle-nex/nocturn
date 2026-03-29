import JoinQuizButton from '../test/JoinQuizButton';

export default function LandingHeroSection() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col gap-y-3 pt-40 items-center">
            <div className="text-5xl font-semibold max-w-xl text-dark-base text-center">
                Knowledge that pays off
            </div>

            <div className="text-dark-base/60 w-full max-w-2xl text-2xl text-center">
                Nocturn is a real-time quiz app made for people who love learning and friendly
                competition.
            </div>

            <div className="mt-2">
                <JoinQuizButton />
            </div>
        </div>
    );
}
