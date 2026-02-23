import { cn } from "@/lib/utils";
import Image from "next/image";
import { RiVipCrown2Fill } from "react-icons/ri";

interface WinnerCardData {
    isWinner?: boolean;
    imgUrl: string;
    points: number;
    name: string;
    primaryColor: string;
    className?: string
}

export default function WinnerCard({ isWinner, imgUrl, points, name, className, primaryColor }: WinnerCardData) {
    return (
        <div className={cn("flex flex-col items-center gap-y-3 relative group", className)}>
            {isWinner && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 -rotate-6 group-hover:-rotate-12 group-hover:scale-110 transition-all transform duration-250">
                    <RiVipCrown2Fill
                    style={{ color: primaryColor }}
                    className={cn('size-12')}/>
                </div>
            )}
            <div
            style={{ boxShadow: `0 0 0 3px ${primaryColor}` }}
            className={cn("h-40 w-40 rounded-full relative overflow-hidden")}>
                <Image
                    src={imgUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    loading="lazy"
                />
            </div>
            <div className="flex flex-col items-center">
                <div
                style={{ color: primaryColor }}
                className={cn("text-3xl font-semibold")}>
                    {points}
                </div>
                <div className="text-xl">
                   {name} 
                </div>
            </div>
        </div>
    )
}