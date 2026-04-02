import { BookOpen, PlayCircle, ChevronRight } from "lucide-react";

function TutorialWidget() {
    const steps = [
        { label: "Create your first quiz", done: true },
        { label: "Add questions & answers", done: true },
        { label: "Invite participants", done: false },
    ];
    return (
        <div className="flex flex-col gap-y-1.5 px-3 mt-3">
            {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-x-2 bg-light-alpha rounded-lg px-2.5 py-1.5 ring-1 ring-black/5 shadow-xs shadow-black/5">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-dark-base" : "ring-1 ring-black/20"}`}>
                        {s.done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span className={`text-[10px] ${s.done ? "text-dark-base/50" : "text-dark-base/70"}`}>{s.label}</span>
                    {!s.done && <ChevronRight className="ml-auto size-3 text-dark-base/30" />}
                </div>
            ))}
            <div className="flex items-center gap-x-1.5 mt-1 px-1">
                <PlayCircle className="size-3.5 text-dark-base/40" />
                <span className="text-[10px] text-dark-base/40">Watch tutorial • 3 min</span>
            </div>
        </div>
    );
}

export default function BeginnerGuideCard() {
    return (
        <div className="h-65 w-65 ring-1 ring-black/10 rounded-xl flex flex-col overflow-hidden shadow-sm shadow-black/10 bg-[#f8ffff] absolute left-[26%] rotate-2 top-25 select-none">
            <div className="bg-[#00827B] h-9 w-full text-light-base text-sm px-3.5 flex items-center shrink-0">
                New to quizzes? Start here
            </div>
            <div className="flex flex-col py-2 px-4">
                <div className="text-dark-base/60 text-base font-semibold flex items-center gap-x-1.5">
                    <BookOpen className="size-4" /> Beginner Guide
                </div>
                <div className="text-[13px] text-dark-base/60">
                    Follow steps or watch quick tutorials
                </div>
            </div>
            <TutorialWidget />
        </div>
    );
}