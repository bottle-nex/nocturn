import { cn } from "@/lib/utils";
import { useRive } from "@rive-app/react-canvas";
import { JSX } from "react";

interface NoContentProps {
    title: string;
    description?: string;
    className?: string;
}

export default function NoContent({ title, description, className }: NoContentProps): JSX.Element {
    const { RiveComponent } = useRive({
        src: "/rive/no-content.riv",
        stateMachines: "State Machine 1", // name from the .riv file
        autoplay: true,
    });

    return (
        <div className={cn("flex flex-col items-center justify-center gap-6 py-16 text-center", className)}>
            <div className="h-56 w-56 sm:h-64 sm:w-64 md:h-120 md:w-120">
                <RiveComponent />
            </div>
            <div className="flex flex-col gap-2 -mt-32">
                <p className="dark:text-gamma text-dark-alpha font-semibold text-xl sm:text-2xl">{title}</p>
                {description && (
                    <p className="dark:text-gamma/50 text-dark-base/80 text-sm sm:text-base max-w-xs sm:max-w-sm">{description}</p>
                )}
            </div>
        </div>
    );
}
