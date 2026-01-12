import EmptyCanvas from "../canvas/EmptyCanvas";
import moment from "moment"
import { QuizViewsType } from "@nocturn/types";
import { JSX } from "react";
import { templates } from "@/lib/templates";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface RecentlyViewedCardProps {
    quiz: Partial<QuizViewsType>;
}

export default function RecentlyViewedCard({ quiz }: RecentlyViewedCardProps): JSX.Element {
    const template = templates.find(t => t.id === quiz.quiz?.theme);
    const formattedTime = moment(quiz.viewedAt).format('MMM D, YYYY');
    const router = useRouter();

    function handleCardClick() {
        router.push(`/new/${quiz.quiz?.id}`);
    }
    return (
        <div onClick={handleCardClick} className="w-88 aspect-video rounded-sm">
            {template && <EmptyCanvas className="w-full aspect-video outline-2 outline-black/40 dark:outline-white/40" template={template} />}
            <div className="flex items-center justify-start gap-x-2.5 px-3">
                {quiz.quiz?.host?.image && (
                    <Image
                        src={quiz.quiz.host.image}
                        width={32}
                        height={32}
                        alt="user-logo"
                        className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                    />
                )}
                <div>
                    <span className="block text-normal mt-1">{quiz.quiz?.title.slice(0, 28)}...</span>
                    <span className="block dark:text-white/60 text-black/60 text-[13px]"> last viewed {formattedTime}</span>
                </div>
            </div>
        </div>
    )
}