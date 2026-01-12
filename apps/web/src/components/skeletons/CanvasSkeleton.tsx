import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CanvasSkeletonProps {
    className?: string;
}

export default function CanvasSkeleton({ className }: CanvasSkeletonProps) {
    return (
        <div className={cn("aspect-16/7 rounded-sm bg-black/10 dark:bg-white/10", className)}>
            <Skeleton className="w-full h-full rounded-sm" />
            <Skeleton className="h-5 w-3/4 mt-2 rounded" />
            <Skeleton className="h-3 w-1/2 mt-1 rounded" />
        </div>
    );
}