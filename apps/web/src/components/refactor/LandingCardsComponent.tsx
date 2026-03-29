import LandingCreateCardComponent from './LandingCardsSectionComponents/LandingCreateCardComponent';
import LandingLaunchCardComponent from './LandingCardsSectionComponents/LandingLaunchCardComponent';
import LandingPublishCardComponent from './LandingCardsSectionComponents/LandingPublishCardComponent';
import LandingSectionHeader from './LandingSectionHeader';

export default function LandingCardsComponent() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col items-center mx-auto ring-1 ring-black/10 bg-light-base pt-25">
            <LandingSectionHeader
                heading="From Idea to Live Quiz, Instantly"
                subheading="Build quizzes your way or let AI generate them for you. Make quick edits, fine-tune details, and publish instantly"
            />

            <div className="w-full h-full items-center flex justify-between px-6 gap-x-6 mt-5">
                <LandingCreateCardComponent />
                <LandingPublishCardComponent />
                <LandingLaunchCardComponent />
            </div>
        </div>
    );
}
