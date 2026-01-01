import { templates } from '@/lib/templates';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

export default function useLiveTemplate() {
    const { quiz } = useLiveQuizStore();
    return templates.find((t) => t.id === quiz.theme);
}
