import { JSX } from 'react';
import LandingSectionHeader from '../refactor/LandingSectionHeader';
import { Users } from '../ui/animated-icons/premium-page/free-section/Users';
import { ChartColumn } from '../ui/animated-icons/premium-page/free-section/ChartColumn';
import { Layers } from '../ui/animated-icons/premium-page/free-section/Layers';
import { ScanText } from '../ui/animated-icons/premium-page/premium-section/ScanText';
import { CircleHelp } from '../ui/animated-icons/premium-page/free-section/CircleHelp';
import { LayoutGrid } from '../ui/animated-icons/premium-page/premium-section/LayoutGrid';
import { Airplay } from '../ui/animated-icons/premium-page/premium-section/AirPlay';
import { PremiumGrip } from '../ui/animated-icons/premium-page/premium-section/PremiumGrip';

export default function PremiumFeaturesComponent() {
    return (
        <div className="min-h-screen w-full max-w-250 mx-auto flex flex-col py-15 gap-y-5">
            <LandingSectionHeader
                heading="Features"
                subheading="Try it free. Stay for the control, speed, and experience."
            />

            <div className="flex flex-col mt-5">
                <div className="text-dark-base font-semibold text-4xl mb-6 mt-10 px-4">
                    Free Perks
                </div>

                <FeatureComponent
                    icon={<Users className="size-5" />}
                    index={0}
                    heading="50 participants per month"
                    description="A comfortable starting point for smaller sessions, classrooms, or internal discussions. Run focused interactions without overwhelming your audience, while still having enough capacity to experiment with formats, test engagement styles, and build confidence before scaling to larger groups."
                />

                <FeatureComponent
                    icon={<ChartColumn className="size-5" />}
                    index={1}
                    heading="Unlimited participants"
                    description="Once every month, remove all limits and host large-scale sessions with ease. Ideal for launches, town halls, or high-impact events where reach matters most—giving you the flexibility to go big when it counts, without committing to a full upgrade."
                />

                <FeatureComponent
                    icon={<CircleHelp className="size-5" />}
                    index={2}
                    heading="Multiple question types"
                    description="Bring your sessions to life with a variety of interactive formats like polls, quizzes, and word clouds. Instead of one-way presentations, you create engaging, two-way experiences that encourage participation, spark thinking, and keep your audience actively involved throughout."
                />

                <FeatureComponent
                    icon={<Layers className="size-5" />}
                    index={3}
                    heading="Session insights & feedback"
                    description="Get a clear understanding of how your session performed with actionable insights. Track participation levels, analyze responses, and gather feedback to identify what worked—and continuously refine your sessions for better engagement and outcomes."
                />
            </div>

            <div className="flex flex-col mt-10">
                <div className="text-dark-base font-semibold text-4xl mb-10 mt-10 px-4">
                    Premium Perks
                </div>

                <FeatureComponent
                    icon={<PremiumGrip className="size-5" />}
                    index={0}
                    heading="Advanced design capabilities"
                    description="Take full control over the look and feel of your sessions with powerful customization tools. Align visuals with your brand, create polished and cohesive experiences, and ensure every interaction feels intentional, professional, and memorable."
                />

                <FeatureComponent
                    icon={<Airplay className="size-5" />}
                    index={1}
                    heading="Workspace collaboration"
                    description="Collaborate seamlessly with your team in a shared workspace built for efficiency. Create, edit, and manage sessions together in real time—eliminating unnecessary back-and-forth and enabling faster, more aligned execution."
                />

                <FeatureComponent
                    icon={<ScanText className="size-5" />}
                    index={2}
                    heading="Co-create slides"
                    description="Build presentations together, live. Multiple contributors can ideate, edit, and refine content simultaneously, making brainstorming sessions more fluid and turning collaboration into a truly dynamic process."
                />

                <FeatureComponent
                    icon={<LayoutGrid className="size-5" />}
                    index={3}
                    heading="Live presentation control"
                    description="Stay in complete control during your sessions. Guide the flow, manage audience interactions, and adapt in real time—so you can deliver smooth, responsive, and high-impact presentations without losing momentum."
                />
            </div>
        </div>
    );
}

interface FeatureComponentProps {
    heading: string;
    description: string;
    icon?: JSX.Element;
    index: number;
}

function FeatureComponent({ heading, description, index, icon }: FeatureComponentProps) {
    const isAlt = index % 2 === 1;

    return (
        <div
            className={`flex w-full p-5 py-6 text-base rounded-lg transition-colors duration-200 ${
                isAlt ? 'bg-light-base/60' : ''
            }`}
        >
            <div className="w-[40%] text-dark-base font-semibold tracking-wide flex items-start">
                <div className="flex items-center">
                    {icon}
                    {heading}
                </div>
            </div>

            <div className="text-dark-base/60 flex-1 leading-relaxed">{description}</div>
        </div>
    );
}
