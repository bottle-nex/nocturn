export default function WhyNocturnCard3() {
    return (
        <div className="h-[65vh] w-full max-w-110 shadow-xs shadow-black/5 rounded-4xl bg-[#b5a6ff] flex flex-col py-15 px-12 gap-y-2 relative overflow-hidden">
            <div className="top-60 left-1/2 -translate-x-1/2 h-52 w-45 bg-linear-to-b from-[#aa99fe] to-[#9b87ff] shadow-md shadow-black/10 absolute flex flex-col items-center justify-between p-4">
                <div className="text-light-alpha font-semibold text-[22px]">Nocturn</div>

                <div className="h-18 bg-[#b3a4ff] w-full"></div>

                <div className="w-full h-10 flex justify-center items-center bg-[#4b87ff] text-light-base">
                    Add people
                </div>
            </div>

            <div className="bg-[#f1fffe] text-dark-base w-fit px-2.5 text-base py-px rounded-sm">
                Collaborate Effortlessly
            </div>
            <div className="text-[#063c39] text-[15px] font-extralight tracking-wide">
                Turn quiz creation into a shared experience. Invite collaborators, brainstorm
                together, and watch the quiz evolve live, fast, interactive, and built as a team.
            </div>
        </div>
    );
}
