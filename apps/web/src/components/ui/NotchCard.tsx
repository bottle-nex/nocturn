import { cn } from "@/lib/utils";

interface NotchedCardProps {
    label?: string;
    className?: string;
    labelClassname?: string;
    children: React.ReactNode;
}

export default function NotchCard({
    label,
    className,
    labelClassname,
    children,
}: NotchedCardProps) {
    return (
        <fieldset
            className={cn(
                "border border-dark-alpha px-3 py-2 text-lg",
                label && '-mt-1 ',
                className,
            )}
        >
            {label && (
                <legend
                    className={cn(
                        "px-1 text-xs tracking-wide text-dark-alpha leading-none",
                        labelClassname,
                    )}
                >
                    {label}
                </legend>
            )}

            <div>{children}</div>
        </fieldset>
    );
}


