import LandingCreateCardComponent from './LandingCardsSectionComponents/LandingCreateCardComponent';
import LandingLaunchCardComponent from './LandingCardsSectionComponents/LandingLaunchCardComponent';
import LandingPublishCardComponent from './LandingCardsSectionComponents/LandingPublishCardComponent';
import LandingSectionHeader from './LandingSectionHeader';

export default function LandingCardsComponent() {
    return (
        <div className="h-auto lg:h-screen w-full max-w-270 flex flex-col items-center mx-auto py-15 px-6 xl:px-0">
            <LandingSectionHeader
                heading="From Idea to Live Quiz, Instantly"
                subheading="Build quizzes your way or let AI generate them for you. Make quick edits, fine-tune details, and publish instantly"
            />

            <div className="w-full h-full lg:items-center flex flex-col lg:flex-row justify-between gap-y-6 gap-x-6 mt-10 lg:mt-5">
                <LandingCreateCardComponent />
                <LandingPublishCardComponent />
                <LandingLaunchCardComponent />
            </div>
        </div>
    );
}
