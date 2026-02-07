export default function UserType() {
    return (
        <section className="w-full max-w-7xl mx-auto px-24 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative min-h-90">
                <section className="bg-yellow-400 rounded-3xl p-8 flex flex-col justify-between h-full relative">
                    <div>
                        <h2 className="text-7xl font-black text-gray-900 mb-2">HOST</h2>
                        <p className="text-gray-700 font-semibold mb-8">Main Character Energy</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            You make the rules, you break the rules. Control the chaos, set the
                            vibe, and watch your quiz empire unfold. Crown not included, but highly
                            recommended.
                        </p>
                    </div>
                    <p className="text-gray-700 font-semibold mt-8">🎭 The Boss</p>
                </section>

                <div className="absolute left-1/3 bottom-12 -translate-x-1/2 z-20 hidden md:flex">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-lg">Hire Us!</span>
                    </div>
                </div>

                <section className="bg-gray-900 rounded-3xl p-8 flex flex-col justify-between h-full relative">
                    <div className="absolute right-0 top-[20%] w-8 h-8 bg-alpha rounded-l-full"></div>
                    <div className="absolute right-0 top-[40%] w-8 h-8 bg-alpha rounded-l-full"></div>
                    <div className="absolute right-0 top-[60%] w-8 h-8 bg-alpha rounded-l-full"></div>
                    <div className="absolute right-0 top-[80%] w-8 h-8 bg-alpha rounded-l-full"></div>

                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">PARTICIPANTS</h2>
                        <p className="text-gray-300 font-semibold mb-4">The Gladiators</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Sweat, stress, and questionable life choices—all for that sweet taste of
                            victory. Battle it out, flex your brain cells, and pretend you knew the
                            answer all along.
                        </p>
                    </div>

                    <div className="flex items-center justify-end mr-4 gap-2 mt-8">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-900"></div>
                            <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-gray-900"></div>
                            <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-gray-900"></div>
                            <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">30+</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-pink-500 rounded-3xl p-8 flex flex-col justify-between h-full relative">
                    <div className="absolute left-0 top-[20%] w-8 h-8 bg-alpha rounded-r-full"></div>
                    <div className="absolute left-0 top-[40%] w-8 h-8 bg-alpha rounded-r-full"></div>
                    <div className="absolute left-0 top-[60%] w-8 h-8 bg-alpha rounded-r-full"></div>
                    <div className="absolute left-0 top-[80%] w-8 h-8 bg-alpha rounded-r-full"></div>

                    <div>
                        <h2 className="text-3xl font-black text-light-alpha mb-2">SPECTATOR</h2>
                        <p className="text-light-alpha font-semibold mb-8">Couch Critic Mode</p>
                        <p className="text-light-alpha text-sm leading-relaxed">
                            Zero pressure, all the drama. Judge everyone&apos;s answers, sip your
                            drink, and enjoy the show. You&apos;re basically royalty, but lazier.
                        </p>
                    </div>
                    <p className="text-light-alpha font-semibold mt-8">🍿 Living the Dream</p>
                </section>
            </div>
        </section>
    );
}
