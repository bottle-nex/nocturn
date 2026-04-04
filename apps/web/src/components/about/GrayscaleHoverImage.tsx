import Image from "next/image";
import PerspectiveCard from "../utility/PerspectiveCard";

interface GrayscaleHoverImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function GrayscaleHoverImage({ src, alt, width = 400, height = 400, className }: GrayscaleHoverImageProps) {
    return (
        <PerspectiveCard style={{ width: `${width}px`, height: `${height}px` }} className={`group relative overflow-hidden ${className ?? ""}`}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="grayscale w-full h-full object-cover"
            />
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none [clip-path:circle(0%_at_50%_50%)] group-hover:[clip-path:circle(75%_at_50%_50%)] transition-[clip-path] duration-500 ease-out"
            />
        </PerspectiveCard>
    );
}
