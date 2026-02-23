export default function GetToKnowNocturnSkeleton() {
    return (
        <div className="animate-pulse w-49 h-32 flex flex-col items-start justify-center px-4 rounded-beta bg-light-base dark:bg-dark-base gap-y-2">
            <div className="ml-2 w-5 h-5 rounded-sm bg-light-base dark:bg-dark-base" />
            <div className="ml-2 w-3/4 h-4 rounded-full bg-light-base dark:bg-dark-base" />
            <div className="ml-2 w-full h-3 rounded-full bg-dark-base dark:bg-dark-base" />
        </div>
    );
}
