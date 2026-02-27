import { Check, Star } from 'lucide-react';
import InformationHeadingSection from '../revamp/InformationHeadingSection';

export default function PremiumComponent() {
    return (
        <div className="w-screen min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col gap-y-14 py-20 px-6">
                <InformationHeadingSection
                    topText="Nocturn Features"
                    topTextClassName="text-neutral-500"
                    title="Choose your subscription."
                    description="Learning doesn't have to be hard. With Nocturn, engagement becomes effortless — and powerful."
                    buttonTitle="Buy Premium"
                    buttonRedirectUrl="/home"
                    buttonClassName="bg-neutral-900 hover:bg-neutral-800 text-white w-40 shadow-sm"
                />

                <section className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Free Plan */}
                    <div className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm p-10 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-neutral-900">Free</h3>

                            <p className="text-sm text-neutral-500 mt-2">
                                Easiest way to try Nocturn.
                            </p>

                            <div className="mt-8">
                                <span className="text-4xl font-bold text-neutral-900">€0</span>
                                <span className="text-neutral-500 ml-2">/ forever</span>
                            </div>

                            <ul className="mt-10 space-y-4">
                                {[
                                    '50 participants per month',
                                    'Unlimited participants once per month',
                                    'Multiple question types (Word Clouds, Polls, Quizzes & more)',
                                    'Session insights & feedback',
                                ].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-neutral-600"
                                    >
                                        <Check className="w-4 h-4 mt-0.5 text-neutral-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            disabled
                            className="mt-10 w-full rounded-lg bg-neutral-100 text-neutral-400 py-3 text-sm font-medium cursor-not-allowed"
                        >
                            Current plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-2xl border border-neutral-300 bg-white shadow-md p-10 flex flex-col justify-between">
                        <div className="absolute top-6 right-6 flex items-center gap-1 rounded-full bg-neutral-900 text-white text-xs px-3 py-1">
                            <Star className="w-3 h-3" />
                            Recommended
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-neutral-900">Pro</h3>

                            <p className="text-sm text-neutral-500 mt-2">
                                Powerful tools for customization.
                            </p>

                            <div className="mt-8">
                                <span className="text-4xl font-bold text-neutral-900">€16</span>
                                <span className="text-neutral-500 ml-2">
                                    / month (billed yearly)
                                </span>
                            </div>

                            <ul className="mt-10 space-y-4">
                                {[
                                    'Advanced design capabilities (Match your brand or preferences)',
                                    'Workspace collaboration (Share themes and templates)',
                                    'Co-create slides (Edit and present together)',
                                    'Live presentation control (Moderate Q&A and view live results)',
                                ].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-neutral-700"
                                    >
                                        <Check className="w-4 h-4 mt-0.5 text-neutral-700" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="mt-10 w-full rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white py-3 text-sm font-medium transition-colors">
                            Upgrade to Pro
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
