import React from "react";

interface IconWrapperProps {
    children: React.ReactNode;
}

export function IconWrapper({ children }: IconWrapperProps) {
    return (
        <span className="h-8 w-8 aspect-square inline-flex items-center justify-center text-light/40 bg-dark rounded-md border border-border outline outline-offset-1 overflow-hidden cursor-pointer">
            {children}
        </span>
    )
}