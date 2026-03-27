import LandingCreateCardComponent from './LandingCardsSectionComponents/LandingCreateCardComponent';
import LandingLaunchCardComponent from './LandingCardsSectionComponents/LandingLaunchCardComponent';
import LandingPublishCardComponent from './LandingCardsSectionComponents/LandingPublishCardComponent';

export default function LandingCardsComponent() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col items-center mx-auto ring-1 ring-black/10 bg-light-base">
            <div className="flex flex-col items-center mt-30">
                <div className="text-dark-base/50 max-w-md text-center mt-1">Knowledge pays</div>
                <div className="text-[40px] text-dark-base/90 font-semibold">
                    Zero-effort quizzing
                </div>
            </div>

            <div className="w-full h-full items-center flex justify-between px-6 gap-x-6">
                <LandingCreateCardComponent />
                <LandingPublishCardComponent />
                <LandingLaunchCardComponent />
            </div>
        </div>
    );
}
