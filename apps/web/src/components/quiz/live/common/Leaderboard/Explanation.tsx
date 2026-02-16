import { cn } from "@/lib/utils";

interface ExplanationProps {
    explanation: string;
    className?: string;
}

export default function Explanation({ explanation, className }: ExplanationProps) {
    return (
        <div className={cn(
            'relative text-dark-alpha px-4 py-3 ',
            'flex justify-center items-center font-extralight tracking-wide ',
            className,
        )}>
            <div className="absolute -top-1.5 left-3 bg-light-alpha text-sm px-1 h-2 flex items-center justify-center">
                explanation
            </div>
            <div>
                {explanation}
            </div>
        </div>
    );
}